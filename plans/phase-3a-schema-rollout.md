# Phase 3a schema rollout

## Read this first

**Nothing in this document has been applied to, or verified against, a real
database.** There was no Postgres, and no Docker to run one, in the environment
where these six migrations were written. `prisma migrate dev` was never
executed. The SQL is hand-authored and checked by reading it, plus a unit test
(`apps/backend/src/common/prisma/prisma-schema.spec.ts`) that asserts the schema
files and the migration SQL say what this document claims they say. That test
proves the text is consistent. It proves nothing about how Postgres will behave
on your data.

Treat every step below as unexercised. Take a full backup first, rehearse the
whole sequence on a restored copy of production, and time it there before you
touch the real thing.

## Deploy shape: a rolling deploy, with one short window

An earlier revision of this document sequenced the `income.store_id` drop third
of six and concluded the whole thing needed a maintenance window spanning all
six migrations plus the application deploy. That conclusion was correct **for
that ordering** and is now obsolete: the drop has been renumbered from
`20260909032000` to `20260909036000` so it sorts last, which removes most of the
window.

The window existed only because a destructive migration was sequenced ahead of
an additive one the new code depends on. Three facts make the drop deferrable:

1. `income.store_id` is already nullable — `20260909020000` ran
   `ALTER COLUMN "store_id" DROP NOT NULL`. Old code writing to it keeps working
   whether or not the drop has run.
2. The new code never touches it. `prisma-income.repository.ts` on this branch
   has zero references to `storeId`, and the regenerated Prisma client no longer
   names the column in any query it emits.
3. The old code does write it — `storeId: data.storeId!` in its version of the
   same file — so the column must still exist while old code is serving.

Nothing in either version of the application requires the column to be *gone*.
That makes the drop pure cleanup, safe to run after the new code is live.

### The sequence

**Group 1 — apply while the old application keeps serving.**

```
20260909030000_add_decimal_precision
20260909031000_add_missing_indexes
20260909035000_add_soft_delete_and_audit_log
```

The old code tolerates all three. `deleted_at` and `financial_audit_log` are
invisible to it — Prisma names every column explicitly, so a client that does not
know about a column never selects it. The decimal narrowing changes stored
values but nothing structural. Migration 1 still takes `ACCESS EXCLUSIVE` for the
duration of its table rewrites, so "keeps serving" means "is not broken by the
schema", not "is unaffected" — requests against the rewritten tables will block.

**Group 2 — a short window: two migrations, then deploy immediately.**

```
20260909033000_fix_cascades
20260909034000_fix_basket_uniqueness
   → deploy the new application
```

These two are the remaining exposure. Neither can be deferred past the deploy —
the new code needs the `basket_family_id_key` unique index to exist before its
`upsert({ where: { familyId } })` will work — and both change rules the old code
relies on. Details in "What the old code can still hit" below. Keep the gap
between applying them and completing the deploy as small as you can.

**Group 3 — after the new application is live and old instances are gone.**

```
20260909036000_drop_income_store_id
```

Run this only once nothing writing `store_id` is still running. It is
irreversible; see its section.

This is a rolling deploy with a short window around group 2, rather than a
maintenance window spanning six migrations and a deploy.

### What the old code can still hit, during group 2

Two known exposures. Both are narrow, both are real, and neither has been
exercised against a database.

**`20260909033000` — family deletion breaks.** The migration makes
`transaction_family_id_fkey` `ON DELETE RESTRICT`. The new code handles that:
`PrismaFamilyRepository.delete` demotes the family's transactions to
`scope = PERSONAL, family_id = NULL` in the same transaction before removing the
family. The old code does not — its version is a bare `family.delete({ where: { id } })`.
So between this migration and the deploy, the last remaining owner of a family
that has any transactions cannot leave it: `LeaveFamilyUseCase` deletes the
family, Postgres rejects it on the foreign key, and the request fails. The data
stays consistent; the request errors.

**`20260909034000` — basket upserts may break outright.** This is the more
serious of the two, and worse than "a second family basket would violate the new
constraint". The migration drops `basket_user_id_scope_key` and
`basket_family_id_scope_key`. Those are the exact two compound uniques the old
code's upserts key on:

```ts
this.prisma.basket.upsert({ where: { personal_basket: { userId, scope: 'PERSONAL' } }, ... })
this.prisma.basket.upsert({ where: { family_basket: { familyId, scope: 'FAMILY' } }, ... })
```

If Prisma compiles those to a native `INSERT ... ON CONFLICT (user_id, scope)`,
Postgres will reject every one of them with *"there is no unique or exclusion
constraint matching the ON CONFLICT specification"* — meaning all basket opens
fail, not just duplicate ones. If Prisma instead compiles them to a
find-then-create pair, they keep working and the only exposure is the narrow one:
a second family basket for the same family now violates `basket_family_id_key`.

**Which of those two it is could not be determined here — there was no database
to run it against.** Assume the worse one. If baskets matter during the window,
either take a real maintenance window for group 2, or verify the emitted SQL on
a restored copy first:

```sql
-- with log_statement = 'all', open a basket on the old code and read the log
```

### Schema drift between group 2 and group 3

After the new application deploys and before `20260909036000` runs, the database
has an `income.store_id` column that the Prisma schema no longer declares. This
is harmless at runtime — Prisma names columns explicitly, so a column it does not
know about is simply never referenced, and the column is nullable so inserts that
omit it succeed.

It is *not* invisible to tooling. Expect `prisma migrate diff` and `prisma db pull`
to report the extra column, and `migrate status` to show one pending migration,
for as long as group 3 is outstanding. That is expected drift, not a problem to
fix by hand — running `20260909036000` resolves it. Do not "fix" it by
introspecting the column back into the schema.

## Apply order

Prisma applies migrations in directory-name order. After the renumbering, the
on-disk order matches the required order, so a plain `prisma migrate deploy`
cannot run the destructive drop early by accident:

| # | Migration | Group | Rewrites a table? | Lock | Reversible? |
|---|---|---|---|---|---|
| 1 | `20260909030000_add_decimal_precision` | 1 | **yes, nine tables** | `ACCESS EXCLUSIVE` (blocks reads and writes) | schema yes, data **no** |
| 2 | `20260909031000_add_missing_indexes` | 1 | no | `SHARE` (blocks writes, allows reads) | yes |
| 3 | `20260909035000_add_soft_delete_and_audit_log` | 1 | no | `ACCESS EXCLUSIVE`, momentary, then index builds | yes |
| 4 | `20260909033000_fix_cascades` | 2 | no | `ACCESS EXCLUSIVE` on `transaction`, scans it | schema yes, backfill **no** |
| 5 | `20260909034000_fix_basket_uniqueness` | 2 | no | `ACCESS EXCLUSIVE` briefly, then index builds | schema yes, backfill **no** |
| 6 | `20260909036000_drop_income_store_id` | 3 | no | `ACCESS EXCLUSIVE`, momentary | **no** |

Note that `20260909033000` and `20260909034000` sort *before* `20260909035000` on
disk, so `migrate deploy` will apply them in that order — which is fine, they are
mutually independent. If you want group 1 applied on its own first, run
`migrate deploy` once you are ready for group 2, or apply group 1 by hand and
`prisma migrate resolve --applied` each one. The renumbering only guarantees the
destructive drop comes last; it does not split groups 1 and 2 for you.

Why this order:

- **Decimal precision before the index migration.** A `SET DATA TYPE` rewrite
  rebuilds every index on the table it rewrites, and migration 1 rewrites exactly
  the tables migration 2 adds indexes to (`transaction`, `expense_item`,
  `store_item`). Running them the other way builds those indexes twice. This is
  efficiency, not correctness — swapping them produces the same end state, more
  slowly.
- **The drop last.** Nothing depends on the column being gone, and running it
  early is what forced a maintenance window in the first place. It is the only
  irreversible-by-design step in the set, so it goes after everything that might
  make you want to stop.
- **Inside `20260909033000`, the `UPDATE` must precede the `CHECK`.**
  `transaction_family_scope_check` asserts `scope <> 'FAMILY' OR family_id IS NOT NULL`.
  Any row already sitting at `scope = 'FAMILY', family_id = NULL` — which the old
  `ON DELETE SET NULL` rule created every time a family was deleted — makes
  `ADD CONSTRAINT` fail and rolls the whole migration back. The `UPDATE` clears
  them first.
- **Inside `20260909034000`, both backfills must precede the unique indexes.**
  `basket_item.basket_id` is `ON DELETE CASCADE`. If the losing family baskets
  were deleted before their items were re-parented, those items would be
  destroyed silently — no error, no warning, just missing shopping-list rows. The
  `UPDATE` moves the items, then the `DELETE` removes the now-empty baskets.

Each migration file runs in its own transaction. A failure inside one rolls that
file back; the files applied before it stay applied.

---

## 1. `20260909030000_add_decimal_precision` (group 1)


### What it does

Nine `ALTER TABLE ... ALTER COLUMN ... SET DATA TYPE` statements moving every
money column from `DECIMAL(65,30)` to `DECIMAL(12,2)` and every quantity column
to `DECIMAL(12,3)`. Tables touched: `basket_item`, `expense_item`, `family`,
`family_member`, `payment_method`, `store_item`, `item_size`,
`store_item_discount`, `transaction`.

### This rewrites the tables

Narrowing a `numeric` typmod is not a metadata change. Postgres rewrites the
entire table file, re-checks every row against the new precision, and rebuilds
every index on that table. For the duration it holds `ACCESS EXCLUSIVE`, which
blocks reads as well as writes. You will also need roughly twice the size of the
largest of these tables in free disk while it runs.

On a few hundred thousand rows this is seconds. On tens of millions of rows in
`transaction` and `expense_item` it is minutes, and the whole application is
blocked for all of them. Time it against a restored copy before the window; do
not guess.

### It changes data

Any value carrying more than two decimal places (three for quantities) is
**rounded, permanently**. Postgres rounds half away from zero.

Any money value with more than ten integer digits **aborts the migration** with
`numeric field overflow`. Same for quantities with more than nine integer
digits.

### Pre-checks — run these, and stop if any returns a non-zero count

```sql
-- Values that will abort the migration (money: >= 10^10)
SELECT 'transaction.value'            AS col, count(*) FROM "transaction"         WHERE abs("value")           >= 10000000000
UNION ALL SELECT 'expense_item.price',           count(*) FROM "expense_item"        WHERE abs("price")           >= 10000000000
UNION ALL SELECT 'expense_item.discount',        count(*) FROM "expense_item"        WHERE abs("discount")        >= 10000000000
UNION ALL SELECT 'store_item.price',             count(*) FROM "store_item"          WHERE abs("price")           >= 10000000000
UNION ALL SELECT 'store_item_discount.discount', count(*) FROM "store_item_discount" WHERE abs("discount")        >= 10000000000
UNION ALL SELECT 'family.balance',               count(*) FROM "family"              WHERE abs("balance")         >= 10000000000
UNION ALL SELECT 'family_member.balance',        count(*) FROM "family_member"       WHERE abs("balance")         >= 10000000000
UNION ALL SELECT 'payment_method.initial',       count(*) FROM "payment_method"      WHERE abs("initial_balance") >= 10000000000
UNION ALL SELECT 'payment_method.current',       count(*) FROM "payment_method"      WHERE abs("current_balance") >= 10000000000
UNION ALL SELECT 'basket_item.price',            count(*) FROM "basket_item"         WHERE abs("price")           >= 10000000000;

-- Values that will abort the migration (quantity: >= 10^9)
SELECT 'expense_item.quantity' AS col, count(*) FROM "expense_item" WHERE abs("quantity") >= 1000000000
UNION ALL SELECT 'basket_item.quantity',       count(*) FROM "basket_item" WHERE abs("quantity") >= 1000000000
UNION ALL SELECT 'item_size.value',            count(*) FROM "item_size"   WHERE abs("value")    >= 1000000000;

-- Values that will be silently rounded. Non-zero here is not a blocker,
-- but you are agreeing to lose those digits.
SELECT 'transaction.value' AS col, count(*) FROM "transaction"  WHERE "value"    <> round("value", 2)
UNION ALL SELECT 'expense_item.price',    count(*) FROM "expense_item" WHERE "price"    <> round("price", 2)
UNION ALL SELECT 'expense_item.discount', count(*) FROM "expense_item" WHERE "discount" <> round("discount", 2)
UNION ALL SELECT 'expense_item.quantity', count(*) FROM "expense_item" WHERE "quantity" <> round("quantity", 3);
```

If the rounding count is non-zero and you want the option to reason about it
later, snapshot first:

```sql
CREATE TABLE phase3a_transaction_value_backup AS
  SELECT id, "value" FROM "transaction" WHERE "value" <> round("value", 2);
```

### Verify

```sql
SELECT table_name, column_name, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE (table_name, column_name) IN (
  ('transaction','value'), ('expense_item','price'), ('expense_item','discount'),
  ('expense_item','quantity'), ('store_item','price'), ('store_item_discount','discount'),
  ('family','balance'), ('family_member','balance'),
  ('payment_method','initial_balance'), ('payment_method','current_balance'),
  ('basket_item','price'), ('basket_item','quantity'), ('item_size','value')
)
ORDER BY table_name, column_name;
```

Expect 13 rows: precision 12 throughout, scale 2 on money, scale 3 on
`expense_item.quantity`, `basket_item.quantity` and `item_size.value`.

### Rollback

The type change is reversible. The rounding is not.

```sql
ALTER TABLE "transaction"         ALTER COLUMN "value"           SET DATA TYPE DECIMAL(65,30);
ALTER TABLE "expense_item"        ALTER COLUMN "price"           SET DATA TYPE DECIMAL(65,30),
                                  ALTER COLUMN "discount"        SET DATA TYPE DECIMAL(65,30),
                                  ALTER COLUMN "quantity"        SET DATA TYPE DECIMAL(65,30);
ALTER TABLE "family"              ALTER COLUMN "balance"         SET DATA TYPE DECIMAL(65,30);
ALTER TABLE "family_member"       ALTER COLUMN "balance"         SET DATA TYPE DECIMAL(65,30);
ALTER TABLE "payment_method"      ALTER COLUMN "initial_balance" SET DATA TYPE DECIMAL(65,30),
                                  ALTER COLUMN "current_balance" SET DATA TYPE DECIMAL(65,30);
ALTER TABLE "store_item"          ALTER COLUMN "price"           SET DATA TYPE DECIMAL(65,30);
ALTER TABLE "item_size"           ALTER COLUMN "value"           SET DATA TYPE DECIMAL(65,30);
ALTER TABLE "store_item_discount" ALTER COLUMN "discount"        SET DATA TYPE DECIMAL(65,30);
ALTER TABLE "basket_item"         ALTER COLUMN "quantity"        SET DATA TYPE DECIMAL(65,30),
                                  ALTER COLUMN "price"           SET DATA TYPE DECIMAL(65,30);
```

This is a second full rewrite, with the same locks and the same duration. A
value that was `12.3456` before is `12.35` after the forward migration and stays
`12.35` after the rollback. **Widening the column back does not recover the
digits.** Only a restore from backup does.

---

## 2. `20260909031000_add_missing_indexes` (group 1)


### What it does

Twelve `CREATE INDEX` statements on `expense`, `expense_category`,
`expense_item`, `income`, `income_category`, `store_item`,
`store_item_discount`, `item_category` and `transaction`.

### Lock

Plain `CREATE INDEX` takes a `SHARE` lock: reads continue, **writes to those
tables block** until each index finishes building. `CREATE INDEX CONCURRENTLY`
would avoid that, but it cannot run inside a transaction block and Prisma wraps
each migration file in one, so it is not usable from the migration.

If the write pause is unacceptable, build them by hand ahead of the window:

```sql
CREATE INDEX CONCURRENTLY "expense_category_id_idx" ON "expense"("category_id");
-- ... the other eleven, using the exact names below ...
```

then mark the migration applied so `migrate deploy` skips it:

```
prisma migrate resolve --applied 20260909031000_add_missing_indexes
```

If you pre-create the indexes and do *not* resolve the migration, it will fail
with `relation "expense_category_id_idx" already exists`. Do one or the other,
not neither.

### Verify

```sql
SELECT indexname FROM pg_indexes
WHERE indexname IN (
  'expense_category_id_idx','expense_store_id_idx','expense_category_parent_id_idx',
  'expense_item_expense_id_idx','expense_item_item_id_idx','income_category_id_idx',
  'income_category_parent_id_idx','store_item_item_id_idx','store_item_store_id_idx',
  'store_item_discount_store_item_id_idx','item_category_parent_id_idx',
  'transaction_recorded_at_idx'
)
ORDER BY indexname;
```

Expect exactly 12 rows.

### Rollback

Fully reversible, no data involved.

```sql
DROP INDEX "expense_category_id_idx", "expense_store_id_idx", "expense_category_parent_id_idx",
           "expense_item_expense_id_idx", "expense_item_item_id_idx", "income_category_id_idx",
           "income_category_parent_id_idx", "store_item_item_id_idx", "store_item_store_id_idx",
           "store_item_discount_store_item_id_idx", "item_category_parent_id_idx",
           "transaction_recorded_at_idx";
```

---

## 3. `20260909035000_add_soft_delete_and_audit_log` (group 1)


### What it does

Creates the `audit_entity` and `audit_action` enums; adds a nullable
`deleted_at TIMESTAMP(3)` to `transaction`, `expense` and `income`; indexes each;
creates `financial_audit_log` with five indexes and a `RESTRICT` foreign key from
`actor_id` to `users.id`.

### Lock and duration

Adding a nullable column with no default is a catalog-only change — instant,
with a momentary `ACCESS EXCLUSIVE`, and no table rewrite at any supported
Postgres version. The three
`CREATE INDEX` statements on `deleted_at` block writes to those tables while they
build, same as migration 2. `financial_audit_log` is created empty, so its
indexes and its foreign key validate against nothing.

No backfill. Existing rows get `deleted_at = NULL`, which is exactly what
"not deleted" means to the new code.

### Behaviour change to be aware of

From the moment the new application deploys, deleting an expense or an income no
longer removes rows. `DELETE /expenses/:id` sets `deleted_at` on the expense and
its transaction, and the expense items stay. Anything that counts rows directly
in SQL — a report, a dashboard query, an export — will start including deleted
records unless it adds `deleted_at IS NULL`. The application repositories all
filter; external queries do not.

Two places deliberately still count soft-deleted rows, because the foreign keys
still point at them and the database would reject the delete anyway:
`countExpensesByCategory` and the store-deletion guard. A category or store used
only by a soft-deleted expense therefore remains undeletable.

### Verify

```sql
SELECT table_name FROM information_schema.columns
WHERE column_name = 'deleted_at' AND table_name IN ('transaction','expense','income')
ORDER BY table_name;
-- expect 3 rows

SELECT to_regclass('financial_audit_log');   -- expect financial_audit_log, not NULL

SELECT indexname FROM pg_indexes WHERE tablename = 'financial_audit_log' ORDER BY indexname;
-- expect 5 indexes plus financial_audit_log_pkey

SELECT count(*) FROM "transaction" WHERE deleted_at IS NOT NULL;  -- expect 0 immediately after
```

After the application has been live a while, confirm the audit log is actually
being written — approve or reject a pending expense and check:

```sql
SELECT entity, action, actor_id, created_at
FROM financial_audit_log ORDER BY created_at DESC LIMIT 20;
```

An empty table after real traffic means audit writes are failing silently:
`RecordFinancialAuditUseCase` swallows repository errors by design so it can
never fail the financial mutation it is auditing. Check the application logs for
`RecordFinancialAuditUseCase` errors.

### Rollback

Fully reversible as a schema change.

```sql
DROP TABLE "financial_audit_log";
DROP TYPE "audit_action";
DROP TYPE "audit_entity";
ALTER TABLE "transaction" DROP COLUMN "deleted_at";
ALTER TABLE "expense"     DROP COLUMN "deleted_at";
ALTER TABLE "income"      DROP COLUMN "deleted_at";
```

Two things go with it. Every audit row written since the deploy is destroyed —
that is the record of who approved and edited what, and it exists nowhere else.
And every soft-deleted expense, income and transaction becomes visible again,
because the flag that hid them is gone; users will see records they believe they
deleted. Export both before rolling back:

```sql
CREATE TABLE phase3a_audit_log_archive AS SELECT * FROM financial_audit_log;
CREATE TABLE phase3a_soft_deleted_archive AS
  SELECT 'transaction' AS entity, id, deleted_at FROM "transaction" WHERE deleted_at IS NOT NULL
  UNION ALL SELECT 'expense', id, deleted_at FROM "expense" WHERE deleted_at IS NOT NULL
  UNION ALL SELECT 'income',  id, deleted_at FROM "income"  WHERE deleted_at IS NOT NULL;
```

---

## 4. `20260909033000_fix_cascades` (group 2)


### What it does, in order

1. A backfill `UPDATE` setting `scope = 'PERSONAL'` on every transaction at
   `scope = 'FAMILY', family_id IS NULL`.
2. Drops and re-adds `expense_item_expense_id_fkey` as `ON DELETE CASCADE`.
3. Drops and re-adds `receipt_expense_id_fkey` as `ON DELETE CASCADE`.
4. Drops and re-adds `transaction_family_id_fkey` as `ON DELETE RESTRICT`.
5. Adds `transaction_family_scope_check`.

### Lock and duration

`ADD CONSTRAINT ... FOREIGN KEY` validates every existing row in the referencing
table and holds `SHARE ROW EXCLUSIVE` on both tables — reads continue, writes
block. `ADD CONSTRAINT ... CHECK` scans the whole of `transaction` under
`ACCESS EXCLUSIVE`. On a large `transaction` table that is the slowest part of
this migration.

If those scans are too long for the window, split them by hand: add each
constraint `NOT VALID` (instant, no scan), then `VALIDATE CONSTRAINT` in a
separate statement, which takes only `SHARE UPDATE EXCLUSIVE` and does not block
writes. The migration as written does not do this; it takes the simple path.

### The backfill

`UPDATE "transaction" SET "scope" = 'PERSONAL' WHERE "scope" = 'FAMILY' AND "family_id" IS NULL;`

These rows exist because the old foreign key was `ON DELETE SET NULL`: deleting
a family nulled `family_id` and left `scope` claiming `FAMILY`. They are
transactions that assert they belong to a family which no longer exists. The
check constraint added at the end of this migration refuses to be created while
any of them remain — that is why the `UPDATE` comes first, and why running these
statements out of order rolls the migration back.

**This is not reversible.** After the update you cannot distinguish a
transaction that was demoted from one that was always personal.

Pre-check and snapshot:

```sql
SELECT count(*) FROM "transaction" WHERE "scope" = 'FAMILY' AND "family_id" IS NULL;

CREATE TABLE phase3a_demoted_transactions AS
  SELECT id FROM "transaction" WHERE "scope" = 'FAMILY' AND "family_id" IS NULL;
```

### Behaviour change to be aware of

`transaction_family_id_fkey` becomes `RESTRICT`. From this point Postgres
**refuses** to delete a family that still has transactions attached. The
application handles this: `PrismaFamilyRepository.delete` demotes the family's
transactions to `scope = PERSONAL, family_id = NULL` inside the same transaction
before removing the family. Any other path that deletes a family row directly —
a manual `DELETE FROM family`, an admin script, a fixture teardown — will now
fail with a foreign key violation. That is the intended behaviour, but it will
surprise anything that used to rely on the silent null-out.

### Verify

```sql
-- backfill worked, and the constraint has nothing left to catch
SELECT count(*) FROM "transaction" WHERE "scope" = 'FAMILY' AND "family_id" IS NULL;  -- expect 0

-- cascade rules: 'c' = cascade, 'r' = restrict, 'n' = set null
SELECT conname, confdeltype FROM pg_constraint
WHERE conname IN ('expense_item_expense_id_fkey','receipt_expense_id_fkey','transaction_family_id_fkey')
ORDER BY conname;
-- expect: expense_item_expense_id_fkey = c
--         receipt_expense_id_fkey      = c
--         transaction_family_id_fkey   = r

-- the check constraint exists and is validated
SELECT conname, convalidated FROM pg_constraint WHERE conname = 'transaction_family_scope_check';
-- expect one row, convalidated = true
```

### Rollback

The constraints are reversible. The backfill is not.

```sql
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_family_scope_check";

ALTER TABLE "transaction" DROP CONSTRAINT "transaction_family_id_fkey";
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_family_id_fkey"
  FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "receipt" DROP CONSTRAINT "receipt_expense_id_fkey";
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_expense_id_fkey"
  FOREIGN KEY ("expense_id") REFERENCES "expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "expense_item" DROP CONSTRAINT "expense_item_expense_id_fkey";
ALTER TABLE "expense_item" ADD CONSTRAINT "expense_item_expense_id_fkey"
  FOREIGN KEY ("expense_id") REFERENCES "expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

To restore the demoted scopes, if you kept the snapshot:

```sql
UPDATE "transaction" SET "scope" = 'FAMILY'
WHERE id IN (SELECT id FROM phase3a_demoted_transactions);
```

Run that only *after* dropping the check constraint — it recreates exactly the
state the constraint forbids.

---

## 5. `20260909034000_fix_basket_uniqueness` (group 2)


### What it does, in order

1. Re-parents `basket_item` rows from losing family baskets onto the surviving
   basket for that family (oldest `created_at`, `id` as tiebreak).
2. Deletes the losing baskets.
3. Drops `basket_user_id_scope_key` and `basket_family_id_scope_key`.
4. Creates `basket_family_id_key` — unique on `family_id`.
5. Creates `basket_personal_user_id_key` — unique on `user_id`
   `WHERE scope = 'PERSONAL'`. This partial index is the reason the SQL is
   hand-written: Prisma's schema language cannot express it, so it lives only in
   the migration. A future `prisma migrate dev` will not know about it and will
   not recreate it on a fresh database built from `migrate dev`. `migrate deploy`
   against the migration history is fine. The same caveat already applies to the
   `pg_trgm` GIN indexes added in `20260214130000_add_search_indexes`.

### Destructive step

Step 2 deletes basket rows. Step 1 exists to make that safe:
`basket_item.basket_id` is `ON DELETE CASCADE`, so any item still pointing at a
losing basket when the `DELETE` runs is destroyed with it — silently, no error.
The `UPDATE` moves them first. Verify the item count afterwards; that is the
whole point of the check below.

Note the scope subtlety: both statements match on `family_id` alone, without
restricting `scope`. A basket carrying a `family_id` but a `PERSONAL` scope is
also re-parented and deleted. That is deliberate — the new `UNIQUE(family_id)`
allows exactly one row per family regardless of scope — but it means the
migration can remove a basket you would not have called a family basket.

`basket_family_id_key` is a plain unique index on a nullable column, so the many
personal baskets with `family_id IS NULL` do not collide; Postgres treats NULLs
as distinct.

### Pre-checks and snapshot

```sql
-- families with more than one basket: these are what the backfill collapses
SELECT family_id, count(*) FROM "basket"
WHERE family_id IS NOT NULL GROUP BY family_id HAVING count(*) > 1;

-- users with more than one personal basket: this ABORTS the migration at step 5.
-- The old basket_user_id_scope_key should have made it impossible. Check anyway.
SELECT user_id, count(*) FROM "basket"
WHERE scope = 'PERSONAL' GROUP BY user_id HAVING count(*) > 1;

-- record the counts you will compare against afterwards
SELECT count(*) AS baskets_before FROM "basket";
SELECT count(*) AS basket_items_before FROM "basket_item";

CREATE TABLE phase3a_basket_backup      AS SELECT * FROM "basket";
CREATE TABLE phase3a_basket_item_backup AS SELECT * FROM "basket_item";
```

### Verify

```sql
-- 1. No basket_item was lost to the cascade. This is the important one.
SELECT (SELECT count(*) FROM phase3a_basket_item_backup)
     - (SELECT count(*) FROM "basket_item") AS items_lost;
-- expect 0

-- 2. No basket_item is orphaned or points at a basket that no longer exists.
SELECT count(*) FROM "basket_item" bi
LEFT JOIN "basket" b ON b.id = bi.basket_id
WHERE b.id IS NULL;
-- expect 0

-- 3. Every item that moved landed on the surviving basket for the same family.
SELECT count(*) FROM "basket_item" bi
JOIN phase3a_basket_item_backup old ON old.id = bi.id
JOIN phase3a_basket_backup      oldb ON oldb.id = old.basket_id
JOIN "basket"                   newb ON newb.id = bi.basket_id
WHERE bi.basket_id <> old.basket_id
  AND newb.family_id IS DISTINCT FROM oldb.family_id;
-- expect 0: nothing moved across families

-- 4. Exactly one basket survives per family.
SELECT family_id, count(*) FROM "basket"
WHERE family_id IS NOT NULL GROUP BY family_id HAVING count(*) <> 1;
-- expect 0 rows

-- 5. Exactly one personal basket per user.
SELECT user_id, count(*) FROM "basket"
WHERE scope = 'PERSONAL' GROUP BY user_id HAVING count(*) <> 1;
-- expect 0 rows

-- 6. The indexes are as intended, including the partial predicate.
SELECT indexname, indexdef FROM pg_indexes
WHERE tablename = 'basket' ORDER BY indexname;
-- expect basket_family_id_key and basket_personal_user_id_key present,
-- the latter ending in: WHERE (scope = 'PERSONAL'::basket_scope)
-- expect basket_user_id_scope_key and basket_family_id_scope_key absent
```

### Rollback

The indexes are reversible. The deleted baskets and the re-parented items are
not, except from the snapshot tables.

```sql
DROP INDEX "basket_personal_user_id_key";
DROP INDEX "basket_family_id_key";
CREATE UNIQUE INDEX "basket_user_id_scope_key"   ON "basket"("user_id", "scope");
CREATE UNIQUE INDEX "basket_family_id_scope_key" ON "basket"("family_id", "scope");
```

To restore the collapsed baskets, drop the new indexes first, then:

```sql
INSERT INTO "basket" SELECT * FROM phase3a_basket_backup
  ON CONFLICT (id) DO NOTHING;
UPDATE "basket_item" bi SET basket_id = old.basket_id
  FROM phase3a_basket_item_backup old WHERE old.id = bi.id;
```

---

## 6. `20260909036000_drop_income_store_id` (group 3)

Run this last, once the new application is live and no old instance is still
writing `store_id`. This migration was originally numbered `20260909032000` and
sequenced third; renumbering it to sort last is what turns this rollout from a
six-migration maintenance window into a rolling deploy. Nothing depends on the
column being gone, so there is no hurry — but until it runs, `migrate status`
will report one pending migration and `migrate diff` will report the drift.

### What it does

```sql
ALTER TABLE "income" DROP COLUMN "store_id";
```

### This is destructive and it is not reversible

`DROP COLUMN` is a catalog change — it is fast and takes `ACCESS EXCLUSIVE` only
momentarily — but the values become unreachable through SQL the instant it
commits. The bytes linger in the heap until the next rewrite, and there is no
supported way to read them back.

**What is lost:** every `income.store_id` value. Because the column was
`NOT NULL` for most of its life with no foreign key behind it, clients were
forced to invent a store id for a record that has no store, so most of these
values are expected to be junk. That is the reason the column is being dropped
rather than given a relation. It does not change the fact that if any of them
turn out to have meant something, they are gone.

**Reverting the migration does not bring the data back.** Re-adding the column
gives you a column full of `NULL`.

### Before you run it, take the values

```sql
CREATE TABLE phase3a_income_store_id_backup AS
  SELECT id, store_id FROM "income" WHERE store_id IS NOT NULL;

SELECT count(*) FROM phase3a_income_store_id_backup;
```

Worth a look before deciding this is fine — how many of those ids point at a
store that actually exists:

```sql
SELECT count(*) FILTER (WHERE s.id IS NOT NULL) AS resolvable,
       count(*) FILTER (WHERE s.id IS NULL)     AS junk
FROM phase3a_income_store_id_backup b
LEFT JOIN "store" s ON s.id = b.store_id;
```

### Verify

```sql
SELECT count(*) FROM information_schema.columns
WHERE table_name = 'income' AND column_name = 'store_id';
```

Expect `0`.

### Rollback

Only meaningful if you took the backup table above.

```sql
ALTER TABLE "income" ADD COLUMN "store_id" TEXT;
UPDATE "income" i SET "store_id" = b."store_id"
FROM phase3a_income_store_id_backup b WHERE b.id = i.id;
```

Without that table: unrecoverable short of a full database restore.

---

## After any manual rollback

Prisma tracks applied migrations in `_prisma_migrations`. If you undo a
migration by hand, remove its row or the next `migrate deploy` will consider it
applied and skip it:

```sql
DELETE FROM "_prisma_migrations" WHERE migration_name = '20260909035000_add_soft_delete_and_audit_log';
```

## Cleaning up

The snapshot tables in this document are named `phase3a_*` so they are easy to
find. Drop them once you are confident, and not before:

```sql
SELECT tablename FROM pg_tables WHERE tablename LIKE 'phase3a_%';
```
