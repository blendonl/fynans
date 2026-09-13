# Fynans backend review — findings and remediation plan

Reviewed: `apps/backend` (NestJS 11 + Prisma 7 + Postgres + BullMQ + MinIO), with
cross-checks against `apps/web`. ~26k LOC, 23 controllers, 12 Prisma schema files.

## Verdict

The structure is genuinely good: hexagonal layering (`core`/`rest`,
`domain`/`application`/`infrastructure`), one use case per operation, repositories
behind interfaces, DTOs at every boundary. There is no god class — the largest file
is 365 lines. The problem is not the shape of the code, it is that **the shape is not
enforced**, so the same decision is made differently in each feature.

The single most serious consequence: `AuthGuard` is the only global guard and it does
**authentication only**. There is no authorization layer. Every ownership and
membership check is hand-written inside individual use cases, and a large number of
them are simply missing. Nine separate cross-tenant holes are reachable today by any
authenticated user.

Second most serious: the expense total is computed in **five places with three
different formulas**, two of which disagree numerically.

---

# P0 — Security. Exploitable by any logged-in user.

### S1. Anyone can join any family
`accept-invitation.use-case.ts` loads the invitation by ID, checks `canBeAccepted()`,
then adds **the caller** as a member. It never compares `invitation.inviteeEmail` /
`inviteeId` against the authenticated user.

```
POST /families/invitations/<any-invitation-id>/accept   → you are now in that family
```

`decline-invitation.use-case.ts` has the same gap (grief/DoS: cancel other people's
invitations). Once inside a family, `getVisibleUserIds()` exposes every member's
categories, items and stores, and family expense/income listings become readable.

**Fix:** in both use cases, require
`invitation.inviteeId === userId || invitation.inviteeEmail === user.email`. Also
reject when the user is already a member (currently a raw unique-constraint 500).

### S2. Income can be attached to another user's transaction
`IncomeController.create` injects `@CurrentUser() user` and **never uses it** —
`createDto.toCoreDto()` takes no arguments. `CreateIncomeUseCase` accepts a
client-supplied `transactionId` and only checks that no income exists for it yet.

```
POST /incomes { transactionId: "<victim's transaction>", storeId, categoryId }
```

This writes an Income row onto the victim's transaction, links the category to the
victim's user id, and fires family notifications as the victim.

**Fix:** pass `user.id` through and verify `transaction.userId === userId` before
creating. (Note `findById`/`update`/`delete` *are* protected — via
`IncomeService.validateOwnership` — so only `create` is open.)

### S3. Cross-family read via `?familyId=`
`BaseFilters.fromQuery` sets `userId: query.familyId ? undefined : userId`. Whenever a
`familyId` is supplied the user filter is dropped entirely, and the caller is
responsible for verifying membership. Two callers do; two do not:

| Endpoint | Membership verified? |
|---|---|
| `GET /expenses` | yes (`ListExpensesUseCase`) |
| `GET /incomes` | yes (`ListIncomesUseCase`) |
| `GET /expenses/statistics` | **no** — `GetExpenseStatisticsUseCase` has no check |
| `GET /transactions` | **no** — `ListTransactionsUseCase` has no check |
| `GET /transactions/statistics` | n/a — leaks nothing, but see D9 |

`PrismaExpenseRepository.getStatistics(userId, filters)` accepts a `userId` argument
and **never reads it** — `buildWhereClause(filters)` is the only scoping. So
`GET /expenses/statistics?familyId=<any-uuid>` returns another family's totals,
per-category breakdown and per-store breakdown. `GET /transactions?familyId=<any-uuid>`
returns their full transaction list.

**Fix:** move the membership check out of individual use cases into a
`FamilyScopeGuard`/interceptor that fires whenever `familyId` is present on any
request, and delete the unused `userId` parameter from the repository signature so it
cannot be mistaken for scoping.

### S4. Receipt jobs are readable by anyone who has a job id
`GET /receipts/jobs/:jobId` and `GET /receipts/jobs/:jobId/stream` never compare
`job.data.userId` to the caller. Job ids are sequential BullMQ integers. Any
authenticated user can enumerate them and stream another user's parsed receipt —
store, line items, prices, totals.

**Fix:** load the job, compare `job.data.userId` to `user.id`, 404 otherwise.

### S5. Categories are global rows that anyone can rename or delete
`ExpenseCategory.name`, `IncomeCategory.name` and `Item.name` are `@unique`
**globally**, and categories are shared across all users through junction tables
(`UserExpenseCategory` etc.). `CreateExpenseCategoryUseCase` silently returns and
links the *existing global row* when the name matches.

Worse, `ExpenseCategoryService.update(id, dto)` and `.delete(id)` take **no userId at
all**, and neither does the controller:

```ts
@Put(':id')
async update(@Param('id') id: string, @Body() updateDto: UpdateExpenseCategoryRequestDto) {
  const category = await this.expenseCategoryService.update(id, coreDto);
```

Any user can rename or delete any category in the system, for every user who shares it.
Identical in `income-category.controller.ts`.

**Fix (short term):** require a `UserExpenseCategory` link for the caller before
update/delete. **Fix (proper):** see DB2 — categories should be user- or family-owned
rows, not global rows behind a junction table.

### S6. Payment methods are never checked for ownership
`paymentMethodId` flows from the request through `CreateExpenseUseCase` →
`CreateTransactionUseCase` → `transaction.create` with no validation, then
`paymentMethodService.recalculateBalance(paymentMethodId)` is called on it. Passing
another user's payment method id attaches your spending to their account and rewrites
their balance. Same on expense update, resubmit, update-pending, and transaction
create/update.

**Fix:** verify ownership in `CreateTransactionUseCase` (single choke point) — it
already verifies family membership there, so this is the right place.

### S7. Approval workflow has no separation of duties
`ApprovePendingExpenseUseCase` calls `ExpenseAuthService.verifyTransactionAccess`,
which only asserts the caller is *a member* of the family. There is no role check and
no check that the approver is not the submitter. A `MEMBER` can submit a pending
expense and immediately approve it. `FamilyMember.canManageMembers()` exists and is
used for invites/removals but not here.

**Fix:** require `canManageMembers()` (OWNER/ADMIN) **and** `userId !== transaction.userId`
to approve or reject.

### S8. Receipt linking does not check the target expense
`LinkReceiptToExpenseUseCase` verifies you own the *receipt* but not the *expense*.
You can attach your receipt to any expense id; `ExpenseController.withReceiptUrl` then
hands that expense's owner a presigned download URL to your image.

**Fix:** verify expense ownership too.

### S9. Receipt upload trusts `familyId`
`ReceiptController.processReceipt` passes `body.familyId` straight to
`SaveReceiptFileUseCase`, which writes `Receipt.familyId` unverified. Combined with the
family-scoped receipt listing this plants records in a family you do not belong to.

### S10. Missing baseline hardening
- No `helmet`, no `@nestjs/throttler`. OCR + LLM upload is unauthenticated-expensive
  and unthrottled.
- Upload limit is `100 * 1024 * 1024` — 100 MB for a receipt photo, held in memory
  (`file.buffer`) and then base64'd into Redis (+33%).
- `fileFilter` matches `file.mimetype.match(/image\/(jpeg|jpg|png)/)` — client-supplied,
  unanchored regex, no magic-byte check.
- Swagger `/docs` mounted unconditionally, including production.
- `better-auth.config.ts` hardcodes `useSecureCookies: true` / `sameSite: 'none'`
  regardless of environment.
- `NotificationGateway` uses `cors: { origin: '*' }` while HTTP CORS uses an allowlist.
- SSE handler logs full item names and prices at `log`/`debug` — financial data in logs.
- Receipt OCR text is interpolated straight into LLM prompts
  (`Item: "${cleaned}"`) with no delimiting — prompt-injection surface that can drive
  automatic category creation.

---

# P1 — Money correctness and data integrity

### D1. Five total calculations, three formulas, two disagree
| Site | Formula | Type |
|---|---|---|
| `CreateExpenseUseCase` | `price * qty - discount` | JS float |
| `PrismaExpenseItemRepository.calculateExpenseTotal` | `(price - discount) * qty` | Decimal |
| `CheckoutBasketItemsUseCase` | `price * qty` | JS float |
| `ReceiptProcessingWorker` | `price * qty` | JS float |
| `apps/web/src/utils/calculations.ts` | `(price - discount) * qty` | JS float |

For `price=10, discount=2, qty=3` the web app shows **24** and the backend stores **28**.
And because `AddItemToExpenseUseCase` recomputes the whole expense via
`calculateExpenseTotal`, **adding one item silently changes the total of the items
already there**.

**Fix:** one `ExpenseTotalCalculator` domain service using `Decimal`, called by
create, add-item, checkout and the worker. Delete `apps/web/src/utils/calculations.ts`
and return the total from the API.

### D2. Money is JS `number` everywhere above the repository
DTOs (`CreateExpenseDto.amount`, `UpdateExpenseDto.amount`, `ExpenseStatistics.*`,
`FamilyMember.balance`, `BalanceResult.*`) all use `number`, and every aggregation is a
float `reduce`. `Decimal` is only used at the Prisma boundary.

**Fix:** `Decimal` (or integer minor units) through the domain and application layers;
convert to `number` only in the response DTO.

### D3. Expense creation is not atomic
`CreateExpenseUseCase` performs: create transaction → create expense → create N items
→ notify → recalc balance, with **no `$transaction`**. A failure after step 1 leaves an
orphan `Transaction` with a value and no `Expense`, which still counts in
`transaction.aggregate` balances and statistics.

`CheckoutBasketItemsUseCase` (create expense, then remove basket items) and
`AcceptInvitationUseCase` (add member, then update invitation) have the same shape.

### D4. Items are silently discarded when no store resolves
```ts
if (store) {
  await Promise.all(items.map(item => this.expenseItemService.create(...)));
}
```
If the category is not `isConnectedToStore` and no `storeId`/`storeName` was sent, the
transaction is created with the full total but **zero items are persisted**, with no
error. Only the web app's client-side `canSubmit()` prevents this today.

### D5. Balance updates lose writes and drift
- `FamilyBalanceService.updateBalancesAfterTransaction` does read-modify-write
  (`family.balance + delta`) outside a transaction — two concurrent expenses lose one.
  Should be an atomic `{ increment }` inside `$transaction`.
- `UpdateExpenseUseCase` changes `transaction.value` but never recalculates the payment
  method or family balances.
- `DeleteExpenseUseCase` recalculates the payment method but **not** family/member
  balances.
- `RecalculateBalanceUseCase` wraps everything in `try {} catch {}` and swallows all
  errors silently.
- `FamilyBalanceService.recalculateBalances` has a comment admitting member balances
  are not recalculated.

Four denormalized balances exist (`User.balance`, `Family.balance`,
`FamilyMember.balance`, `PaymentMethod.currentBalance`) with no reconciliation job and
no invariant test. `User.balance` appears to be written nowhere at all.

### D6. Income creation from the web app is broken
`useIncomeSubmission` posts to `POST /transactions` with
`{ type, value, description, categoryId, recordedAt, familyId, paymentMethodId }` plus
`pending: true` for review. `CreateTransactionRequestDto` declares only
`type, value, recordedAt, familyId, paymentMethodId`, and the global `ValidationPipe`
runs with `forbidNonWhitelisted: true` — so `description`, `categoryId` and `pending`
cause a **400**.

Even if it passed, that endpoint creates a bare `Transaction` and never an `Income`
row, so the income would never appear in income listings or category reports. Income
creation is a two-call client-orchestrated flow (`POST /transactions` then
`POST /incomes`) that the web app does not actually perform.

**Fix:** add `POST /incomes` that takes amount/category/note and creates transaction +
income server-side in one call, mirroring `POST /expenses`.

### D7. Statistics and trends are computed in JavaScript over full table scans
`getStatistics` runs `findMany` with **no pagination** and aggregates category and
store totals in a JS `Map`. `getTrends` does the same. At a few thousand expenses this
is slow; at scale it is an OOM.

**Fix:** `prisma.expense.groupBy` / `aggregate`, or raw SQL with `date_trunc`.

### D8. Trend buckets mix timezones
`getDateKey` uses local-time `getFullYear()/getMonth()` for month keys but
`toISOString()` (UTC) for day and week keys. Near midnight, entries land in the wrong
bucket, and month vs day totals will not reconcile.

### D9. The same filter means three different things
For `?familyId=X`: `findAll` returns the whole family's expenses, `getStatistics`
returns the whole family's totals (unchecked), and `getTrends` force-injects
`userId` so it returns **only your own** expenses in that family. The three panels of
a family dashboard therefore disagree with each other.

### D10. `buildWhereClause` fails open
```ts
if (!filters) return { transaction: { status: CONFIRMED } };
```
`findAll()` with no filters returns every expense in the database. Safe only because
callers happen to pass filters.

---

# P2 — Prisma schema and database design

### DB1. `Income.storeId` is a required column with no relation
```prisma
model Income {
  storeId String @map("store_id")   // no `store Store @relation(...)`
}
```
Required, unenforced, and semantically wrong — an income does not have a store. The
API rejects income creation without one (`'Store ID is required'`), so clients must
invent a store id.

### DB2. Global uniqueness breaks multi-tenancy
`ExpenseCategory.name @unique`, `IncomeCategory.name @unique`, `Item.name @unique` are
system-wide. User A creating "Groceries" claims the name for everyone; user B gets A's
row including A's `parentId` and `isConnectedToStore`. `DeleteExpenseCategoryUseCase`
counts expenses **globally**, so a category becomes undeletable because a stranger used
it. Combined with S5 this is the root cause of the cross-tenant mutation problem.

**Fix:** own the rows. Either `userId` on the category with
`@@unique([userId, name])`, or an explicit "system/global" flag for a seeded taxonomy
plus user-owned overrides. The junction tables become unnecessary.

### DB3. No decimal precision anywhere
Every money column is bare `Decimal`, which Prisma maps to Postgres
`DECIMAL(65,30)`. Should be `@db.Decimal(12,2)` (and `@db.Decimal(12,3)` for quantity).

### DB4. Missing indexes on foreign keys actually used in filters
Not indexed: `Expense.categoryId`, `Expense.storeId`, `ExpenseItem.expenseId`,
`ExpenseItem.itemId`, `Income.categoryId`, `StoreItem.itemId`, `StoreItem.storeId`,
`StoreItemDiscount.storeItemId`, `ExpenseCategory.parentId`, `IncomeCategory.parentId`,
`ItemCategory.parentId`, `Transaction.recordedAt` (the default sort key on every list).

### DB5. Basket uniqueness is wrong for multi-family users
```prisma
@@unique([userId, scope], name: "personal_basket")
```
With `scope = FAMILY`, this permits a user **one family basket total**. A user in two
families cannot have a basket in both. Should be `@@unique([userId])` filtered to
`PERSONAL`, plus `@@unique([familyId])` for family baskets.

### DB6. Cascade rules leave orphans
- `Transaction.familyId onDelete: SetNull` while `scope` stays `FAMILY` → transactions
  with `scope=FAMILY, familyId=null`.
- `ExpenseItem → Expense` has no `onDelete`; deletion only works because
  `DeleteExpenseUseCase` manually deletes items first.
- `Receipt.expenseId onDelete: SetNull` orphans the file's link.

### DB7. Ad-hoc primary keys
`Expense`, `Income` and `StoreItemDiscount` declare `id String` with `@@id([id])` and
**no `@default(uuid())`**, forcing every call site to `uuid()` manually. Inconsistent
with every other model.

### DB8. No audit trail
Financial records are mutated and hard-deleted in place. There is no soft delete, no
history table, and no record of who approved or edited what. For a finance app this is
a gap regardless of the bugs above.

---

# P3 — Architecture, abstraction, API design

### A1. The dependency rule is inverted in the domain layer
`expense.entity.ts`, `transaction.entity.ts`, `expense-item.entity.ts` import from
`prisma/generated/prisma/client` and expose `static fromPrisma(...)`. The domain
depends on the ORM. Mappers exist for some features (`family`, `income`,
`notification`, `transaction`) and not others — so both patterns coexist.

**Fix:** pick mappers. Move every `fromPrisma` into `infrastructure/mappers/`.

### A2. Three exception dialects, mixed within single features
- `DomainNotFoundException` etc. → handled by `DomainExceptionFilter`
- `NotFoundException` / `ForbiddenException` / `BadRequestException` from
  `@nestjs/common`, imported directly into **core/application** use cases
  (`remove-family-member`, `leave-family`, `accept-invitation`, `cancel-invitation`,
  `get-family-with-members`, all payment-method use cases, `update-income`,
  all receipt use cases)
- Plain `throw new Error(...)` in entity `validate()` — these become **500s** where a
  400 is correct.

`family` uses domain exceptions in `invite-member` and Nest exceptions in
`remove-family-member`. There is also no fallback filter, so Prisma errors (P2002
unique violation, P2025 not found) surface as bare 500s.

**Fix:** domain exceptions only below `rest/`; add an `AllExceptionsFilter` that maps
Prisma error codes and logs with a correlation id.

### A3. Pass-through service facades, with authorization hiding inside them
`ExpenseService` is 132 lines of one-line delegations to 12 use cases.
`PaymentMethodService`, `IncomeService`, `FamilyService`, `TransactionService` are the
same. The layer would be harmless indirection except that **authorization is
inconsistently placed**:

- `IncomeService.validateOwnership` — in the *service*
- `GetExpenseByIdUseCase.verifyOwnership` — in the *use case*
- `ListExpensesUseCase.verifyMembership` — in the *use case*
- `GetExpenseStatisticsUseCase` — **nowhere**
- `TransactionService.findById(id, userId?)` — optional parameter, defaults to no check

Optional `userId?` parameters that silently skip the check are a fail-open design.

**Fix:** delete the facades, inject use cases into controllers directly, and move
authorization to one explicit place — guards/policies for coarse checks, a mandatory
non-optional `actor` argument on use cases for fine ones.

### A4. Business logic in controllers
`ExpenseController.withReceiptUrl` calls the storage provider to presign URLs, and
`findAll` filters `matchedItems` by lowercase substring match — search semantics
implemented in the REST layer, duplicating the repository's `search` filter.

### A5. Repositories bypassed
`DeleteExpenseUseCase` and `GetBalanceUseCase` inject `PrismaService` directly and
write queries inline, alongside the repository abstraction they are meant to use.

### A6. Types duplicated three times
`ExpenseFilters` is declared in `common/dto/base-filters.dto.ts`,
`core/application/dto/expense-filters.dto.ts`, and again as an interface in
`domain/repositories/expense.repository.interface.ts`. `ExpenseStatistics` likewise
exists in the repository interface, the application DTO, and the REST DTO.

### A7. Dead and misleading API surface
- `CreateExpenseRequestDto.scope` is validated, documented in Swagger, and **never read**
  by `toCoreDto()` — scope is derived from `familyId`.
- `CreateExpenseDto.storeId` is used by the worker but cannot be sent over REST.
- `Expense.description` is written by `UpdateExpenseUseCase` and is not in the entity,
  `toJSON()`, or any response DTO — write-only field.
- `COPILOT_TIMEOUT` is in `.env.example` and the zod schema; the service hardcodes 15s.
- `class-validator` decorators on `CreatePaymentMethodDto` (a *core* DTO) never execute.
- `@Type(() => Boolean)` on `pending` means `"false"` coerces to `true`.

### A8. Two controllers share one base path
`ReceiptController` and `StoredReceiptController` are both `@Controller('receipts')`.
`GET /receipts/jobs/:jobId` and `GET /receipts/:id` compete; correctness depends on
module registration order.

### A9. Configuration is validated then ignored
`validateEnv()` runs in `main.ts` and its result is used for `PORT` and `CORS_ORIGIN`
only. `ConfigModule.forRoot({ isGlobal: true })` is not given the schema, and
`process.env` is read directly in 15 places including `PrismaService` and
`better-auth.config.ts`. `RECEIPT_NORMALIZE_NAMES` is in `.env.example` but not in the
schema.

Also missing: no `setGlobalPrefix('api')`, so business routes are at `/expenses` while
auth is at `/api/auth`.

### A10. Performance
- `AuthGuard` calls `betterAuth.api.getSession()` **plus** a `user.findUnique` on every
  single request. No caching.
- `getVisibleUserIds()` issues 2 queries and is called per repository method.
- `GetBalanceUseCase` fetches the balance summary, then fetches all payment methods
  again just to attach `type`, then does one `findMember` query per family.
- `ReceiptJobQueueService.streamJobProgress` constructs a **new `QueueEvents` Redis
  connection per SSE subscriber**.
- Receipt images are base64-encoded into the Redis job payload rather than passed by
  storage key.
- `notify-family-members` and `remove-family-member` create notifications in loops.

### A11. Tests
Six spec files exist. They cover the OCR HTTP client, the LLM parser, the job queue,
the worker, one mapper, and `AppController`. **Nothing covers expenses, incomes,
transactions, balances, families, permissions or auth.** The money and authorization
logic has zero coverage.

---

# Remediation plan

## Phase 0 — Stop the bleeding (days, ship immediately)

Security patches only, minimal diff, each with a regression test.

1. `accept-invitation` / `decline-invitation`: assert the caller is the invitee. **[S1]**
2. `IncomeController.create`: pass `user.id`; verify transaction ownership. **[S2]**
3. `GetExpenseStatisticsUseCase` + `ListTransactionsUseCase`: verify family
   membership. **[S3]**
4. Receipt job status + SSE: compare `job.data.userId` to the caller. **[S4]**
5. Category `update`/`delete` (expense, income, item): require a user link. **[S5]**
6. `CreateTransactionUseCase`: verify `paymentMethodId` belongs to the user. **[S6]**
7. `ApprovePendingExpenseUseCase` / `RejectPendingExpenseUseCase`: require
   `canManageMembers()` and approver ≠ submitter. **[S7]**
8. `LinkReceiptToExpenseUseCase`: verify expense ownership. **[S8]**
9. `SaveReceiptFileUseCase`: verify `familyId` membership. **[S9]**
10. Add `helmet` + `@nestjs/throttler` (tight limit on `/receipts/process`), drop upload
    limit to 10 MB, exact mime allowlist + magic-byte check, gate `/docs` behind
    `NODE_ENV !== 'production'`, environment-aware cookie flags, restrict WebSocket
    CORS, remove item/price logging. **[S10]**

**Exit criteria:** an integration test per hole, asserting 403/404 for a second user.

## Phase 1 — Make authorization structural (1–2 weeks)

The point is that Phase 0 must not be repeatable. Remove the possibility of forgetting.

11. Introduce `@RequiresFamilyMembership()` / `@RequiresFamilyRole(OWNER, ADMIN)`
    decorators plus a `FamilyScopeGuard` that fires on any request carrying `familyId`
    (body, query or param). Delete the hand-rolled checks it replaces.
12. Introduce a `ResourceOwnershipGuard` (or a mandatory `actor: AuthUser` first
    argument on every use case). **Ban optional `userId?` parameters** — make the
    signature force the decision.
13. Delete the pass-through service facades; inject use cases into controllers. Where a
    facade held the only auth check (`IncomeService`), move it into the guard/use case
    first. **[A3]**
14. Make `buildWhereClause` fail closed: require an explicit scope
    (`userId` or verified `familyId`) or throw. **[D10]**
15. Cache session validation in `AuthGuard` (short-TTL Redis, keyed by token). **[A10]**

## Phase 2 — Money correctness (1–2 weeks)

16. One `ExpenseTotalCalculator` domain service on `Decimal`; delete the other four
    implementations including `apps/web/src/utils/calculations.ts`. Decide the formula
    explicitly — `(price - discount) * quantity` matches the UI and the item
    entity's own `discount <= price` invariant. **[D1]**
17. Push `Decimal` up through application DTOs; convert to `number` only in response
    DTOs. **[D2]**
18. Wrap expense create, basket checkout, invitation accept and expense delete in
    `prisma.$transaction`. **[D3]**
19. Fix D4: either persist items without a store or reject the request — no silent drop.
20. Replace balance read-modify-write with atomic `increment` inside transactions;
    recalculate family and payment-method balances on **update and delete**, not just
    create; stop swallowing errors in `RecalculateBalanceUseCase`; write a
    reconciliation job plus an invariant test
    (`sum(transactions) == cached balance`). **[D5]**
21. Add a real `POST /incomes` that creates transaction + income server-side; fix the
    web app to use it. **[D6]**
22. Move statistics and trends to SQL (`groupBy` / `date_trunc`), and fix the timezone
    mixing with an explicit, configurable timezone. **[D7, D8]**
23. Make `familyId` mean one thing across list, statistics and trends. **[D9]**

## Phase 3 — Schema (needs migrations; sequence carefully)

24. Add `@db.Decimal(12,2)` to all money columns, `@db.Decimal(12,3)` to quantity. **[DB3]**
25. Add the missing FK and `recordedAt` indexes. **[DB4]** *(cheap, do it with Phase 2)*
26. Fix `Income.storeId` — make it optional with a real relation, or drop it. **[DB1]**
27. Re-own categories/items per user or family; replace global `@unique(name)` with
    `@@unique([ownerId, name])`; migrate existing shared rows by duplicating per linked
    user. Largest single migration — plan it on its own. **[DB2, S5]**
28. Fix basket uniqueness. **[DB5]**
29. Fix cascade rules; add `@default(uuid())` to `Expense`/`Income`/`StoreItemDiscount`. **[DB6, DB7]**
30. Add soft delete + an audit log for financial mutations and approvals. **[DB8]**

## Phase 4 — Architecture cleanup (ongoing)

31. Move every `fromPrisma` out of domain entities into mappers. **[A1]**
32. Domain exceptions only below `rest/`; entity `validate()` throws
    `DomainValidationException`; add an `AllExceptionsFilter` mapping Prisma codes,
    with correlation-id logging. **[A2]**
33. Move `withReceiptUrl` and `matchedItems` out of the controller into the use
    case/response mapper. **[A4]**
34. Remove direct `PrismaService` use from use cases. **[A5]**
35. Collapse the triplicate `ExpenseFilters` / `ExpenseStatistics` definitions. **[A6]**
36. Remove dead API surface (`scope`, `description`, core-DTO validators); fix the
    `pending` boolean coercion; honour `COPILOT_TIMEOUT`. **[A7]**
37. Split the two `receipts` controllers onto distinct paths. **[A8]**
38. Wire the zod schema into `ConfigModule.forRoot({ validate })`; ban direct
    `process.env`; add `setGlobalPrefix('api')` (coordinate with the generated
    clients). **[A9]**
39. Share one `QueueEvents` instance; pass receipts to the queue by storage key rather
    than base64; batch notification creation; fix the `GetBalanceUseCase` N+1. **[A10]**
40. Delimit and escape OCR text in LLM prompts. **[S10]**

## Phase 5 — Tests

41. Integration tests per endpoint asserting a second user gets 403/404 — this is the
    regression net for Phase 0/1.
42. Unit tests for the total calculator (including the discount edge cases that
    currently diverge).
43. Balance invariant tests across create/update/delete/approve/reject.
44. Family role matrix tests (OWNER/ADMIN/MEMBER × invite/remove/approve/reject).

---

## Suggested ordering

Phase 0 ships first and alone. Phase 1 and Phase 2 can run in parallel — they touch
different seams. Phase 3 item 27 (category re-ownership) is the riskiest change in the
whole plan and should not be bundled with anything else. Phase 4 is continuous cleanup;
Phase 5 items 41–42 should land *with* Phases 0–2 rather than after them.
