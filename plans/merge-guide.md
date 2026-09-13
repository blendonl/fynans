# Merging the backend review branches

Nine branches came out of the 2026-09-09 backend review and a parallel effort on
a second plan, produced concurrently. They overlap, two of them independently
built the same authorization module, and several carry migrations that must be
applied in one specific order around a single deploy. This is that order and the
decisions to make on the way.

## Branch order

Nine branches came out of this work: seven phases of the backend review plus an
integration branch, alongside three branches from a parallel effort on a
different plan. `review/integration` is the single merge path — it already
contains phases 0, 1 and 2 and all three of the parallel effort's branches, with
every conflict resolved and the resolutions explained in the merge commits.

```
review/integration                          (0 + 1 + 2 + the parallel effort's three)
  -> review/phase-4-architecture            57 commits
  -> review/phase-5-tests                   55 commits
  -> review/phase-3a-schema                 60 commits
    -> review/phase-3b-category-ownership   65 commits
      -> review/phase-3c-currency           68 commits
```

The last three are a stack, in that order, and must stay in it: 3b's migration
depends on 3a's, and 3c's on 3b's. Phase 4 and phase 5 are independent of the
stack and of each other.

Every one of those five branches already has `review/integration` merged INTO
it, so each is correct on its own rather than only correct once merged. That
matters if you review or cherry-pick one individually — an earlier state of
these branches carried a session-cache bug that was fixed on integration, and
merging integration in was how that was removed rather than documented.

Verified state per branch, all with `build` exiting 0:

| Branch | Suites | Tests | Lint (main = 710) |
|---|---|---|---|
| `review/integration` | 37 | 282 | 561 |
| `review/phase-4-architecture` | 55 | 428 | 443 |
| `review/phase-5-tests` | 43 | 371 | 559 |
| `review/phase-3a-schema` | 43 | 342 | 561 |
| `review/phase-3b-category-ownership` | 45 | 358 | 540 |
| `review/phase-3c-currency` | 45 | 373 | 540 |

`main` is 6 suites / 33 tests, two of which fail to run.

## Migrations — nothing here has touched a database

There is no Postgres and no Docker in the environment these were written in, so
**no migration has been applied or verified against a real database.** The SQL is
hand-authored and checked by reading it. Three rollout documents cover the
sequence in detail and should be read before any of it runs:

- `plans/phase-3a-schema-rollout.md`
- `plans/phase-3b-category-ownership-rollout.md`
- `plans/phase-3c-currency-rollout.md`

The combined order across all three branches, with the deploy boundary:

```
20260909030000  decimal precision          before deploy
20260909031000  indexes                    before deploy
20260909033000  cascades                   before deploy
20260909034000  basket uniqueness          before deploy
20260909035000  soft delete + audit log    before deploy
20260909036000  own categories and items   before deploy
20260909037000  currency columns           before deploy
20260909040000  drop income.store_id       AFTER the application deploy
```

`20260909040000` is deliberately last and deliberately deferred. Running it with
the others reintroduces a window in which no version of the application works.

**`20260909036000` has a blocking dependency**: after it, an account registered
post-migration owns zero categories and cannot create an expense, because
`Expense.categoryId` is required and the global catalog it used to fall back on
is gone. It must not ship without the onboarding work that seeds a starter
catalog per user. See the section of that name in the 3b rollout document.

## After merging

Run `yarn workspace @fynans/backend swagger:generate`, then `yarn api:generate`.
The OpenAPI surface moved for several independent reasons — the `api` global
prefix, the `receipts` / `receipt-jobs` split, `balance` leaving
`UserResponseDto`, and the currency columns — and one regeneration covers all of
them. Resolve any `openapi.json` conflict by regenerating rather than by hand.

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
