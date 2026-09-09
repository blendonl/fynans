# Phase 3b — re-owning categories and items: rollout and rollback

Covers review item 27 (`DB2`, `S5`): `expense_category`, `income_category` and
`item` stop being globally shared rows behind junction tables and become rows
owned by exactly one user.

Migration: `apps/backend/prisma/migrations/20260909036000_own_categories_and_items`.

**This migration has not been run against a live database.** There is no
Postgres in the environment it was authored in, so it was verified by review and
by diffing the resulting schema against `prisma migrate diff` output, not by
execution. Treat the staging rehearsal below as mandatory, not optional.

---

## What the migration does

For each of the three tables, in order:

1. Build an owner map `(old_id, user_id) -> new_id`. The user with the earliest
   claim keeps the original row id; every other claimant gets a fresh uuid.
2. Drop the system-wide unique index on `name`.
3. Add a nullable `user_id` column and set it on the rows that keep their id.
4. Insert one duplicate row per additional claimant.
5. Re-point dependent rows at the copy owned by the same user.
6. Delete rows that nobody claimed.
7. Assert the row counts and the absence of cross-user references; abort if
   either fails.
8. `SET NOT NULL`, add `@@unique([user_id, name])`, add the `user_id` index, add
   the `ON DELETE CASCADE` foreign key to `users`.
9. Drop the owner map table.

Finally `user_expense_category`, `user_income_category` and `user_item` are
dropped.

### Who counts as a claimant

| Table | Claimants |
|---|---|
| `expense_category` | rows in `user_expense_category`, plus the owner of every `transaction` behind an `expense` in that category |
| `income_category` | rows in `user_income_category`, plus the owner of every `transaction` behind an `income` in that category |
| `item` | rows in `user_item`, plus the owner of every `user_store_item` link to a `store_item` of that item |

Including the transaction owners is what makes step 5 total: every expense and
every income is guaranteed to find a category owned by its own user, so no
financial record is left pointing at a stranger's row.

### Deliberate consequences

- **Two members of the same family who both used "Groceries" now own two rows.**
  Family visibility is unchanged (a row owned by any co-member is readable), so
  both copies appear in a shared list. This is the direct cost of "duplicate per
  linked user" and is the safe direction: nobody silently keeps write access to
  somebody else's category. Merging duplicates within a family is a separate,
  reversible product decision — it is not part of this migration.
- **`store_item` rows stay shared and keep pointing at the item that kept the
  original id.** A user whose item is a duplicate sees their item in
  `GET /items` but with no store prices attached until they record a price
  themselves. `item_size` rows *are* copied, so sizes survive for every owner.
- **`item_category` (`store-item-category`), `store` and `store_item` are not
  re-owned by this migration** and keep their `user_item_category`,
  `user_store` and `user_store_item` junction tables. They have no system-wide
  unique name and are a separate migration.

---

## BLOCKING DEPENDENCY — a user registered after this migration has no categories

**Do not deploy this migration on its own.** It must ship together with, or
after, the onboarding work that seeds a starter catalog.

`Expense.categoryId` is required. Before this change a brand-new account was
carried by the global catalog: whatever categories existed system-wide were
visible to everybody, so "Add Transaction" worked on day one. After this change
there is no shared catalog. An account created after the migration owns zero
`expense_category`, zero `income_category` and zero `item` rows, and
`POST /expenses` has nothing valid to put in `categoryId`. The user is stuck at
the first screen.

Existing accounts are unaffected — the backfill gives every current user their
own copy of everything they were linked to. This is strictly about accounts
created after the cutover.

**This phase deliberately does not implement seeding.** Seeding belongs to the
onboarding effort, which owns the registration flow; doing it here would put a
catalog writer inside a schema migration branch and collide with that work.

What that work must provide, and what this document is asserting as its
contract:

- Seed **per-user rows** at registration — insert `expense_category`,
  `income_category` (and optionally `item`) rows with `user_id` set to the new
  user. Do **not** seed one shared tree and point users at it: that is exactly
  the shared-ownership model this phase removes, and the `@@unique([user_id,
  name])` index no longer permits the old junction-table shape anyway.
- A user who somehow reaches expense creation with no categories should get an
  actionable API response, not a foreign-key error.

Until that lands, the answer to "what happens to a user with no categories?" is:
**they cannot create an expense.** Verify before deploying that the onboarding
seed is in the same release.

---

## Pre-flight, on a replica or a restored snapshot

Run all of these **before** scheduling the migration. They are read-only.

```sql
-- 1. How much duplication is coming? (rows added per table)
SELECT 'expense_category' AS tbl, COUNT(*) - COUNT(DISTINCT category_id) AS extra_rows
FROM user_expense_category
UNION ALL
SELECT 'income_category', COUNT(*) - COUNT(DISTINCT category_id) FROM user_income_category
UNION ALL
SELECT 'item', COUNT(*) - COUNT(DISTINCT item_id) FROM user_item;

-- 2. Rows nobody claims: these are deleted by the migration.
SELECT COUNT(*) FROM expense_category c
WHERE NOT EXISTS (SELECT 1 FROM user_expense_category u WHERE u.category_id = c.id)
  AND NOT EXISTS (SELECT 1 FROM expense e WHERE e.category_id = c.id);

SELECT COUNT(*) FROM income_category c
WHERE NOT EXISTS (SELECT 1 FROM user_income_category u WHERE u.category_id = c.id)
  AND NOT EXISTS (SELECT 1 FROM income i WHERE i.category_id = c.id);

-- 3. BLOCKER: items with store prices that nobody claims.
--    The migration raises an exception on these rather than guessing an owner.
SELECT i.id, i.name
FROM item i
WHERE NOT EXISTS (SELECT 1 FROM user_item u WHERE u.item_id = i.id)
  AND NOT EXISTS (
    SELECT 1 FROM store_item si
    JOIN user_store_item usi ON usi.store_item_id = si.id
    WHERE si.item_id = i.id)
  AND EXISTS (SELECT 1 FROM store_item si WHERE si.item_id = i.id);
```

If query 3 returns rows, resolve them before the maintenance window: either
insert a `user_item` row naming the intended owner, or delete the orphaned
`store_item` rows. Do not let the migration decide.

Also record the numbers the post-flight checks compare against:

```sql
SELECT
  (SELECT COUNT(DISTINCT (category_id, user_id)) FROM user_expense_category) AS uec_pairs,
  (SELECT COUNT(DISTINCT (category_id, user_id)) FROM user_income_category)  AS uic_pairs,
  (SELECT COUNT(DISTINCT (item_id, user_id))     FROM user_item)             AS ui_pairs,
  (SELECT COUNT(*) FROM expense)  AS expenses,
  (SELECT COUNT(*) FROM income)   AS incomes,
  (SELECT COUNT(*) FROM item_size) AS item_sizes;
```

---

## Rollout

### Step 0 — rehearse

Restore the latest production snapshot into a scratch database, run
`prisma migrate deploy`, and run the post-flight checks. Time it. The dominant
cost is the three `INSERT ... SELECT` duplications and the `UPDATE` on `expense`
and `income`; on a dataset with a few hundred thousand expenses this is seconds,
not minutes, but measure rather than assume.

### Step 1 — back up

Take a fresh base backup (or confirm PITR is on and note the LSN / timestamp
immediately before the deploy). This is the only rollback for step 3 that does
not lose data written after the cutover — see below.

### Step 2 — is any of this safe online?

**No. This needs a short write lock on the affected tables, and the application
must not be serving writes while it runs.** Specifically:

| Statement | Lock | Online? |
|---|---|---|
| `ALTER TABLE ... ADD COLUMN "user_id" TEXT` (nullable, no default) | `ACCESS EXCLUSIVE`, metadata only | effectively instant, safe |
| `DROP INDEX "expense_category_name_key"` | `ACCESS EXCLUSIVE` on the table | instant, but see below |
| `INSERT ... SELECT` duplication | row locks | safe, but the new rows are invisible to old code |
| `UPDATE expense SET category_id = ...` | row locks on rewritten rows | **not safe with old code running** |
| `ALTER COLUMN "user_id" SET NOT NULL` | `ACCESS EXCLUSIVE` + full table scan | seconds on these table sizes |
| `CREATE UNIQUE INDEX ..._user_id_name_key` | `SHARE` — blocks writes | seconds |
| `ADD CONSTRAINT ..._user_id_fkey` | `SHARE ROW EXCLUSIVE` + validation scan | seconds |
| `DROP TABLE user_*` | `ACCESS EXCLUSIVE` | instant |

The reason this cannot be done online is not lock duration, it is
**correctness**: between the duplication and the deploy of the new application
code, old code writing through `user_expense_category` would create links to
rows that are about to be dropped, and old code creating a category would hit
the now-absent global unique index and produce a genuine cross-user duplicate.

The whole migration file runs inside one transaction, so a failure at any
statement leaves the database exactly as it was.

### Step 3 — the window

1. Put the API into maintenance / scale the backend to zero replicas. Drain the
   BullMQ receipt worker too — `EnrichReceiptDataUseCase` writes categories and
   items.
2. `prisma migrate deploy`.
3. Run the post-flight checks (below). If any fails, go to rollback R3.
4. Deploy the new backend image.
5. Bring traffic back.

The old backend image and the new schema are **not** compatible in either
direction: old code reads `user_expense_category`, which no longer exists. Do
not do a rolling deploy and do not leave an old replica running.

### Step 4 — post-flight verification

```sql
-- Every row has an owner and the owner exists.
SELECT COUNT(*) FROM expense_category WHERE user_id IS NULL;   -- expect 0
SELECT COUNT(*) FROM income_category  WHERE user_id IS NULL;   -- expect 0
SELECT COUNT(*) FROM item             WHERE user_id IS NULL;   -- expect 0

-- Row counts match the claimant pairs recorded pre-flight.
SELECT COUNT(*) FROM expense_category;  -- expect uec_pairs + expense-only claimants
SELECT COUNT(*) FROM income_category;   -- expect uic_pairs + income-only claimants
SELECT COUNT(*) FROM item;              -- expect ui_pairs + store-item-only claimants

-- No financial record points at another user's category. Expect 0 for both.
SELECT COUNT(*) FROM expense e
JOIN transaction t ON t.id = e.transaction_id
JOIN expense_category c ON c.id = e.category_id
WHERE c.user_id <> t.user_id;

SELECT COUNT(*) FROM income i
JOIN transaction t ON t.id = i.transaction_id
JOIN income_category c ON c.id = i.category_id
WHERE c.user_id <> t.user_id;

-- No category is parented to another user's category. Expect 0 for both.
SELECT COUNT(*) FROM expense_category c
JOIN expense_category p ON p.id = c.parent_id
WHERE p.user_id <> c.user_id;

SELECT COUNT(*) FROM income_category c
JOIN income_category p ON p.id = c.parent_id
WHERE p.user_id <> c.user_id;

-- Nothing was lost: expense, income and item_size counts.
SELECT COUNT(*) FROM expense;   -- unchanged from pre-flight
SELECT COUNT(*) FROM income;    -- unchanged from pre-flight
SELECT COUNT(*) FROM item_size; -- pre-flight count + one copy per duplicated item

-- Every user who had a link still has a row of that name.
-- Run against the snapshot with the old tables restored under a schema prefix,
-- or capture this list pre-flight and diff it:
--   SELECT u.user_id, c.name FROM user_expense_category u
--   JOIN expense_category c ON c.id = u.category_id ORDER BY 1, 2;
-- versus
--   SELECT user_id, name FROM expense_category ORDER BY 1, 2;
-- The second must be a superset of the first.
```

The first four assertions are also enforced *inside* the migration with
`RAISE EXCEPTION`, so a violation aborts the transaction rather than committing
bad data. Running them again afterwards is a cheap independent confirmation.

Smoke-test through the API before restoring traffic:

- `GET /expense-categories` as two users in the same family — each sees their own
  rows plus their co-member's.
- `PUT /expense-categories/:id` as a user who is *not* the owner — expect 403.
- `DELETE /expense-categories/:id` for a category only a co-member has expenses
  in — expect 204, because the count is now scoped to the owner's own category.
- `POST /expense-categories {"name":"Groceries"}` as two different users — both
  succeed and return different ids.
- `GET /items/search?name=...` returns only the caller's own items.

---

## Rollback

### R1 — before `migrate deploy`

Nothing to undo. Cancel the window.

### R2 — `migrate deploy` failed

The migration file runs in a single transaction, so a failure rolls the whole
thing back and the database is unchanged. Prisma will have recorded a failed
migration in `_prisma_migrations`; clear it with

```
prisma migrate resolve --rolled-back 20260909036000_own_categories_and_items
```

then redeploy the old image and reopen traffic. Fix the cause (almost certainly
the "items with store prices but no claimant" exception) and reschedule.

### R3 — `migrate deploy` succeeded but verification failed, no traffic yet

Restore the backup from step 1, or PITR to the recorded timestamp. This is
lossless because no application writes happened after the cutover. Redeploy the
old image.

### R4 — traffic is back and a problem surfaces

There is **no clean automated down-migration**. The duplication is
information-losing in the reverse direction: collapsing two owned rows back into
one shared row has to pick a winner for `parent_id` and `is_connected_to_store`,
and any category created after the cutover has no pre-migration counterpart.

Two options, in order of preference:

1. **Fix forward.** Every failure mode seen so far is an application-layer
   scoping bug, not a data problem — the data is strictly better shaped than it
   was. Patch and redeploy.
2. **Restore and replay.** Restore the step-1 backup to a new instance, take the
   window again, and manually replay the financial records written since the
   cutover (`transaction`, `expense`, `income`, `expense_item` by `created_at`).
   Categories and items created after the cutover must be re-created by hand.
   Budget hours, not minutes.

If a rollback to the old *code* is needed while keeping the new schema, it is not
possible: the old code selects from `user_expense_category`,
`user_income_category` and `user_item`. Recreating those three tables as views
over the owned rows would satisfy the reads but not the `upsert` writes, so this
is not a supported path.

### Recovering a single user

Far more likely than a full rollback. If one user's categories were mangled, the
pre-migration state for them is derivable from the step-1 backup:

```sql
SELECT c.id, c.name, c.parent_id, c."isConnectedToStore"
FROM expense_category c
JOIN user_expense_category u ON u.category_id = c.id
WHERE u.user_id = '<user-id>';
```

Re-insert the missing rows with `user_id = '<user-id>'` and a fresh uuid, then
re-point that user's expenses at them.
