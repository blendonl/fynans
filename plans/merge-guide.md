# Merging the backend review branches

Four branches came out of the 2026-09-09 backend review, produced in parallel.
They overlap, and two of them independently built the same authorization
module. This is the order to merge them in and the decisions to make on the way.

## Branch order

```
review/phase-0-security
  -> review/phase-1-authz
    -> worktree-phase3-idor-expense-item-user
      -> review/phase-2-money
```

Phase 0 first because everything else builds on it. Phase 1 next because it
establishes the authorization module that phase 3 must be reconciled against —
merging phase 3 first would mean resolving the duplicate module in the harder
direction. Phase 2 last: it is the largest diff and touches the most files, so
it benefits from landing on a settled structure.

`review/integration` already proves the 1 + 2 merge. It is
`review/phase-1-authz` with `review/phase-2-money` merged into it, resolved,
building, and green on the full suite (35 suites / 256 tests, against 28 / 197
for phase 1 alone and 26 / 159 for phase 2 alone). Reuse that resolution rather
than redoing it — the reasoning behind each conflict is recorded in the merge
commit.

### The rule that resolves almost every 1-vs-2 conflict

**Take phase 1's structure and phase 2's logic.**

Phase 1 made authorization structural: guards and decorators under
`common/authorization/`, with the ownership and membership checks moved out of
the use cases, and the pass-through service facades deleted so controllers call
use cases directly. Phase 2 fixed money correctness: one `ExpenseTotalCalculator`
on `Decimal`, `$transaction` wrapping, atomic balance increments, SQL
statistics and trends.

Where a facade is deleted on one side and edited on the other, the facade stays
deleted — but the behaviour phase 2 added inside it has to be carried into the
use case the controller now calls directly. That is the main way work gets lost
here, and it is silent: the merge is clean and the build passes.

Two cases in the 1 + 2 merge were only caught by reading the code, not by the
conflict markers:

- `GetExpenseTrendsUseCase` merged cleanly to phase 2's version, which re-added
  a `familyService.verifyMembership` call that phase 1 had deliberately moved
  into the route guard — and had deleted the method for. Caught by the build.
- Phase 1's fail-closed scope check lives in `buildWhereClause`. Phase 2 added a
  separate raw-SQL path (`buildFilterSql`) for statistics and trends, which had
  no such check, so an unscoped statistics query would have aggregated across
  every user. Nothing conflicted; phase 1's own `scoped-queries.spec.ts` already
  asserted expense statistics must fail closed, and that test caught it.

When merging phase 3, read for this shape rather than trusting a clean merge.

## The duplicate authorization module

`worktree-phase3-idor-expense-item-user` contains its own independent
`apps/backend/src/common/authorization/` — 14 file paths that overlap with
phase 1's.

**Ours is a strict superset.** Verified file by file:

- `resolve-owner-scope.use-case.ts`, `owner-scope.ts` and
  `resource-owner.repository.interface.ts` are byte-identical.
- `resource-ownership.guard.ts` differs by one line: ours threads
  `rule.ownerOnly` into `verifyResourceAccessUseCase.execute`.
- `owns-resource.decorator.ts` differs by one field: ours adds `ownerOnly?`.
- Their `OwnedResource` union is `'expense' | 'expenseItem'`; ours adds
  `'income'` and `'transaction'`.
- Their membership port has `isMember`, `findFamilyIds` and
  `findCoMemberUserIds`; ours adds `findRole`.
- The family-scope guard, `@RequiresFamilyMembership`, `@RequiresFamilyRole` and
  `FamilyMemberRole` exist only in ours.

**Resolution: discard that branch's `common/authorization/**` entirely and keep
only its `feature/expense-item/**` and `feature/user/**` changes.** Those work
against ours unmodified — its expense-item controller already uses
`@OwnsResource({ resource: 'expenseItem' })` and
`@OwnsResource({ resource: 'expense', source: 'body', key: 'expenseId' })`,
both of which ours supports. Take theirs for nothing under
`common/authorization/`; take theirs wholesale for the rest.

## A required merge-time edit

That branch's expense-item routes carry `@OwnsResource({ resource: 'expenseItem' })`
with no `ownerOnly` flag, because the flag did not exist on its copy of the
module. After the merge, add it to the two write routes:

```ts
@Put(':id')
@OwnsResource({ resource: 'expenseItem', ownerOnly: true })

@Delete(':id')
@OwnsResource({ resource: 'expenseItem', ownerOnly: true })
```

Explicitly **do not** add it to `@Get(':id')` or `@Get()`. Reads stay
owner-or-family, matching every other resource.

Why the writes need it: an expense shared with a family is readable by every
member, but only the owner may change it — that is what `ownerOnly` on the
expense `PUT`/`DELETE` enforces. Line items are the itemised detail behind an
expense's total. If a non-owner family member can edit or delete a line item,
they can change what the expense is made of without being able to touch the
expense itself, so the itemised detail silently stops agreeing with the total
that was submitted and approved. The approval separation-of-duties check becomes
meaningless if the thing approved can be edited afterwards by someone who was
not allowed to approve it.

`POST` needs no flag: it is already guarded on the parent expense via
`source: 'body', key: 'expenseId'`, and creating an item on an expense you do
not own is refused there.

## Post-merge steps

Regenerate the API surface:

```
yarn api:generate
```

This is not optional — the OpenAPI surface changed on both sides.
`worktree-phase3-idor-expense-item-user` drops `balance` from
`UserResponseDto`, and this effort changed routes: `POST /incomes` now records
an income and its transaction in one request, `POST /incomes/link` is new for
attaching an income to an existing transaction,
`POST /families/{familyId}/balances/reconcile` is new, and the family routes
moved from `:id` to `:familyId`.

`openapi.json` is generated. Never hand-merge it — take either side to clear the
conflict, then regenerate once the code compiles
(`yarn workspace @fynans/backend swagger:generate`, which `yarn api:generate`
runs for you before regenerating the web and mobile clients).

## Verify these after merging

Each was fixed deliberately and each is easy to lose. Check them by reading the
merged code, not by assuming:

1. Writes stay owner-only. `ownerOnly: true` on `PUT`/`DELETE` for transaction,
   income and expense, on expense `resubmit` and `PATCH :id/pending`, and — after
   the edit above — on expense-item `PUT`/`DELETE`. Reads stay owner-or-family.
2. Denials are 404 for both "does not exist" and "not yours". This is deliberate
   existence-hiding; do not let it become 403.
3. `ExpenseAuthService.verifyApprovalAuthority` still rejects the submitter and
   still requires an OWNER/ADMIN role.
4. One total calculation: `ExpenseTotalCalculator` on `Decimal`,
   `(price - discount) * quantity`, used by create, add-item, checkout and the
   receipt worker.
5. Balance arithmetic goes through `TransactionAmountNormalizer` — every
   increment and the reconciliation sum.
6. `$transaction` wrapping on expense create, basket checkout, invitation accept,
   expense update and approval.
7. Creating an itemised expense with no resolvable store throws rather than
   persisting zero items.
8. The `AuthGuard` session cache survives, and every repository `buildWhereClause`
   — plus phase 2's `buildFilterSql` — still fails closed on an unscoped query.

Baselines to measure against: `npx eslint apps/backend/src` should stay at or
under main's 710 problems (`review/integration` is at 562), and no test may be
deleted or weakened to make a merge pass.

## Known follow-ups

These are real and unresolved. They are not merge problems, but they should not
be discovered later as surprises.

**Throttling does not hold across processes.** `@nestjs/throttler` is configured
with its default in-memory storage, so each process keeps its own counters.
Running more than one instance multiplies the effective rate limit by the
instance count, which means the limit does not do what it claims in any
deployment that scales out. The real fix is the Redis storage adapter; Redis is
already configured and running for BullMQ, so this is wiring, not new
infrastructure.

**No migration has been verified against a live database.** There is no Postgres
in the environment these branches were developed in. The migrations under
`apps/backend/prisma/migrations/` — including the one dropping `User.balance` and
relaxing the income-store constraint — were authored by hand following the
existing directory convention and checked by review only. They have not been
applied, and `prisma migrate dev` has not been run. Apply them against a real
database before trusting them.
