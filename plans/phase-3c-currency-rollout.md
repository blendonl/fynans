# Phase 3c — multi-currency columns: rollout and rollback

Adds the five columns a mixed-currency dashboard needs, and backfills them.
**Columns only.** No FX rate source, no aggregate rewrites, no write-path
changes, no UI — all of that belongs to the behaviour plan (its P3-2). This
phase exists so the columns land in the same deploy window as the category
re-ownership migration instead of being retrofitted later.

Migration: `apps/backend/prisma/migrations/20260909037000_add_currency_columns`.

**This migration has not been run against a live database.** There is no
Postgres in the environment it was authored in. It was verified by review and by
a unit test (`apps/backend/src/common/prisma/prisma-schema.spec.ts`) that
asserts the schema files and the migration SQL say what this document claims.
That test proves the text is consistent. It proves nothing about how Postgres
behaves on your data. Rehearse on a restored snapshot.

---

## Why these columns exist

A receipt's currency and the currency the payment settled in can differ — a USD
receipt paid with a EUR card. Nothing can sum mixed-currency rows without a
single normalisation target per user, so:

| Column | Type | Null | Meaning |
|---|---|---|---|
| `users.reporting_currency` | `char(3)` | **NOT NULL** | the one currency this user's totals are expressed in |
| `payment_method.currency` | `char(3)` | nullable | the settlement currency of the instrument |
| `transaction.currency` | `char(3)` | nullable | the currency the amount was recorded/receipted in — *not* the settlement currency |
| `transaction.exchange_rate` | `numeric(18,8)` | nullable | see "Direction" below |
| `transaction.settled_value` | `numeric(12,2)` | nullable | the amount actually settled, captured at transaction time |

No index is created on any of them. Nothing filters or groups by currency;
aggregates group by user, which is already indexed. Do not add speculative
indexes.

---

## The deploy-time reporting currency: `'EUR'`

### Where it is substituted

**One place.** The migration opens by creating a single-row scratch table and
inserting the literal:

```sql
CREATE TABLE "_currency_backfill_parameter" (
    "reporting_currency" CHAR(3) NOT NULL
);

INSERT INTO "_currency_backfill_parameter" ("reporting_currency") VALUES ('EUR');
```

Everything downstream reads that table (step 1) or reads the value step 1 wrote
(steps 2 and 3). The table is dropped at the end of the migration. To deploy
into a market that is not the euro area, change that one literal and nothing
else. A unit test asserts `'EUR'` appears exactly once in the file and that
`_currency_backfill_parameter` is read exactly once.

### Why EUR, and how confident we are

The codebase is **not** currency-agnostic — the receipt pipeline is written
explicitly for Kosovo, and Kosovo uses the euro. This is independently
verifiable rather than a preference:

- `apps/backend/src/feature/receipt/core/infrastructure/services/parsers/receipt-prompt.builder.ts:2`
  — `"Parse this Kosovo store receipt (Albanian)."`
- same file, line 56 — `"...normalization assistant for Kosovo/Albanian grocery receipts."`
- `apps/backend/src/feature/ai/core/application/services/ai-category.service.ts:34,46,57`
  — `"...may be in Albanian or English. If it is Albanian, first translate it to English..."`

### Provenance of the choice

The EUR choice was **confirmed by the user through a parallel session working on
a different remediation plan**, not directly in this one. Recording that plainly
because it matters to anyone auditing the decision later.

The ambiguity that confirmation resolved was **EUR vs ALL**: those prompts say
"Kosovo/Albanian", and Albania uses the lek (ALL) while Kosovo uses the euro.
The prompts name Kosovo as the market and Albanian as the *language*, so EUR is
the right reading — but the two are easy to conflate, which is why it was worth
confirming rather than inferring.

---

## Direction of `exchange_rate`

Pinned here and in the migration's own SQL comment so it can never be guessed at
later:

> `transaction.exchange_rate` is units of the **settlement** currency (the owning
> `payment_method.currency`) per **ONE** unit of `transaction.currency`, such
> that
>
> ```
> settled_value = value * exchange_rate
> ```

Worked example. A user records a USD 20.00 receipt and pays with a EUR card at
0.92 EUR per USD:

| Column | Value |
|---|---|
| `transaction.currency` | `USD` |
| `payment_method.currency` | `EUR` |
| `transaction.value` | `20.00` |
| `transaction.exchange_rate` | `0.92000000` |
| `transaction.settled_value` | `18.40` |

The inverse convention (USD per EUR, `1.08695652`) would produce `21.74` — a
plausible-looking number that is wrong, which is exactly why the direction is
written down in two places rather than inferred from a variable name.

### `settled_value` is stored, never recomputed

Historical totals must not drift when rates move. Recomputing
`value * exchange_rate` at read time also breaks the moment a payment method is
deleted: `transaction.payment_method_id` is `ON DELETE SET NULL`, so the
settlement currency disappears from the row while the money that actually left
the account does not. The stored value survives that.

---

## The null-payment-method rule

`transaction.payment_method_id` is `String?` with `onDelete: SetNull`, so a
transaction can have no payment method and therefore no settlement currency.
Defining it now, before any code depends on it:

> **When `payment_method_id IS NULL`, the settlement currency equals
> `transaction.currency`. Therefore `exchange_rate = 1` and
> `settled_value = value`.**
>
> The same rule applies whenever the transaction currency and the settlement
> currency are equal.

**The write path must never leave `exchange_rate` NULL on a row it touched.** A
NULL there forces every future aggregate to branch, and one of those branches
will eventually be wrong. `NULL` must mean one thing only: *this row pre-dates
multi-currency*. That is what makes the contract migration below possible.

---

## Expand / migrate / contract

This migration is the **expand** step.

| Column | Now | Eventually |
|---|---|---|
| `users.reporting_currency` | NOT NULL, **no default** | unchanged |
| `payment_method.currency` | nullable | NOT NULL |
| `transaction.currency` | nullable | NOT NULL |
| `transaction.exchange_rate` | nullable | NOT NULL |
| `transaction.settled_value` | nullable | NOT NULL |

Columns 2–5 are nullable here on purpose. Making them NOT NULL now would
hard-fail the deploy the first time the application inserted a row without them,
for no benefit, since nothing reads these columns yet. The **contract** step
belongs in a later migration, after the write path always populates them — that
is the behaviour plan's work, not this phase's.

`users.reporting_currency` is the exception and is NOT NULL immediately, because
it is the backfill source for the other four and depends on no write path.

### Why `reporting_currency` has no schema default

A `@default("USD")` — or a `@default("EUR")` — would silently re-introduce
exactly the hardcoded-currency defect this requirement exists to kill. NOT NULL
with no default forces the registration flow to supply a value explicitly, and
turns "we forgot to ask the user" into a loud insert failure instead of a
silently wrong number on someone's dashboard.

### What the later contract migration must assert

Before any `SET NOT NULL`, and aborting if a count is non-zero:

```sql
-- 1. Nothing written after the cutover is missing a currency.
SELECT COUNT(*) FROM payment_method WHERE currency IS NULL AND created_at > '<cutover>';
SELECT COUNT(*) FROM transaction    WHERE currency IS NULL AND created_at > '<cutover>';

-- 2. The three transaction columns are all-or-nothing. A row with a currency
--    but no rate is a write-path bug, not a pre-multi-currency row.
SELECT COUNT(*) FROM transaction
WHERE (currency IS NULL) <> (exchange_rate IS NULL)
   OR (currency IS NULL) <> (settled_value IS NULL);

-- 3. The stored settled value agrees with the stored rate, to the cent.
SELECT COUNT(*) FROM transaction
WHERE settled_value IS NOT NULL
  AND ROUND(value * exchange_rate, 2) <> settled_value;

-- 4. The null-payment-method rule held.
SELECT COUNT(*) FROM transaction
WHERE payment_method_id IS NULL
  AND exchange_rate IS NOT NULL
  AND exchange_rate <> 1;

-- 5. Same-currency rows were not given a rate other than 1.
SELECT COUNT(*) FROM transaction t
JOIN payment_method pm ON pm.id = t.payment_method_id
WHERE t.currency = pm.currency AND t.exchange_rate <> 1;
```

It must then backfill the remaining pre-cutover NULLs the same way this
migration did — rate 1, `settled_value = value`, currency from
`users.reporting_currency` — before the `SET NOT NULL`. It should also consider
adding `CHECK (exchange_rate > 0)`, which this migration deliberately does not
add because a positivity constraint on a column the write path does not yet
populate constrains nothing.

---

## Known limitation: `numeric(12,2)` and three-minor-unit currencies

`settled_value` is `numeric(12,2)` to match every other money column in the
schema (review item 24: `transaction.value`, `expense_item.price`,
`payment_method.current_balance`, and the rest). Two decimals **cannot represent
the three-minor-unit currencies** — KWD, BHD, JOD, TND — which are quoted to
0.001. A settled amount in those currencies would be silently rounded to the
cent.

This is a **forward-looking bound, not a live constraint.** Every row this
migration touches is EUR, which has two minor units, so `(12,2)` is exactly
right today. It becomes real only if the product ships into Kuwait, Bahrain,
Jordan or Tunisia, and the fix at that point is a schema-wide precision change
across all money columns, not a one-off widening of `settled_value` — mixing
`(12,2)` and `(12,3)` money columns is worse than either.

`exchange_rate` is `numeric(18,8)`, which is the usual FX quoting precision and
is not affected by this.

**Precision is not up for renegotiation in this phase.** Do not change it
unilaterally.

---

## BLOCKING DEPENDENCY — registration will fail until the sign-up flow supplies a currency

**Do not deploy this migration on its own.** It must ship together with, or
after, the work that makes the registration flow set `reporting_currency`.

`users` rows are created by better-auth's Prisma adapter
(`apps/backend/src/feature/auth/core/infrastructure/config/better-auth.config.ts`),
which knows only the fields declared to it. After this migration
`reporting_currency` is NOT NULL with no default, so **every `signUpEmail` and
every social sign-in creates a row with no value for it and fails on the insert.**

This does not show up at build time: the adapter writes through better-auth's own
untyped field map, so `yarn workspace @fynans/backend build` passes. It is a
runtime failure on the first registration after the cutover. Existing users are
unaffected — the backfill gives all of them `'EUR'`.

**This phase deliberately does not implement it**, because the registration flow
is write-path behaviour and belongs to the behaviour plan. What that work must
provide, and what this document asserts as its contract:

- Declare `reportingCurrency` in `user.additionalFields` in
  `better-auth.config.ts`, alongside the existing `firstName` / `lastName`
  entries, **or** set it in the existing `databaseHooks.user.create.before`
  hook in the same file. Either satisfies the NOT NULL.
- Whichever is chosen, the value must come from something explicit — a
  registration field, or a single named application-level constant that mirrors
  the migration's parameter — not a literal scattered through the auth config.

Verify before deploying that this is in the same release. If it is not, the
symptom is: existing users work fine, and nobody can sign up.

---

## Pre-flight, on a replica or a restored snapshot

Read-only. Run before scheduling.

```sql
-- Row counts, so the post-flight checks have something to compare against.
SELECT
  (SELECT COUNT(*) FROM users)          AS users,
  (SELECT COUNT(*) FROM payment_method) AS payment_methods,
  (SELECT COUNT(*) FROM transaction)    AS transactions;

-- The columns must not already exist (a partially applied earlier attempt).
SELECT table_name, column_name
FROM information_schema.columns
WHERE (table_name, column_name) IN (
  ('users', 'reporting_currency'),
  ('payment_method', 'currency'),
  ('transaction', 'currency'),
  ('transaction', 'exchange_rate'),
  ('transaction', 'settled_value')
);  -- expect 0 rows

-- Every transaction and payment method must have a user the join can reach.
-- Both columns are NOT NULL behind a foreign key, so this is a sanity check on
-- the constraints themselves, not on the data.
SELECT COUNT(*) FROM transaction t
LEFT JOIN users u ON u.id = t.user_id WHERE u.id IS NULL;   -- expect 0
SELECT COUNT(*) FROM payment_method pm
LEFT JOIN users u ON u.id = pm.user_id WHERE u.id IS NULL;  -- expect 0
```

---

## Where this sits in the combined sequence

```
20260909030000 decimal precision       before deploy
20260909031000 indexes                 before deploy
20260909033000 cascades                before deploy
20260909034000 basket uniqueness       before deploy
20260909035000 soft delete + audit     before deploy
20260909036000 own categories/items    before deploy
20260909037000 add currency columns    before deploy   <- this one
20260909040000 drop income.store_id    AFTER the application deploy
```

See `plans/phase-3a-schema-rollout.md` for the authoritative ordering and the
deploy shape. This migration is purely additive and changes none of that: it
runs in the same `migrate deploy` as the others, before the application deploy.

### Locks and duration

| Statement | Lock | Notes |
|---|---|---|
| `ADD COLUMN ... CHAR(3)` / `DECIMAL` (nullable, no default) | `ACCESS EXCLUSIVE`, metadata only | instant on any size |
| `UPDATE users SET reporting_currency = ...` | row locks, rewrites every row | proportional to the user count — small |
| `ALTER COLUMN reporting_currency SET NOT NULL` | `ACCESS EXCLUSIVE` + full scan of `users` | seconds |
| `UPDATE payment_method ... FROM users` | row locks, rewrites every row | small |
| `UPDATE transaction ...` ×3 | row locks, **rewrites every transaction row three times** | the dominant cost |
| `ADD CONSTRAINT ... CHECK` ×3 | `ACCESS EXCLUSIVE` + validation scan | seconds |

The three `UPDATE`s on `transaction` are the expensive part. On a few hundred
thousand rows this is seconds; measure on the rehearsal rather than assuming,
and note that they also produce dead tuples — schedule a `VACUUM` (or let
autovacuum catch up) afterwards.

The whole file runs in one transaction, so a failure at any statement leaves the
database exactly as it was.

### Is this safe with the old code running?

**Yes, with one caveat.** Every column is new and nullable-or-backfilled, and no
deployed code reads or writes any of them, so an old replica is unaffected by
their existence. The caveat is the one above: once `reporting_currency` is NOT
NULL, the old code's registration path breaks, because the old code does not set
it either. So this migration is only *read*-safe with old code, not
*registration*-safe — which is why it ships with the behaviour work rather than
ahead of it.

---

## Post-flight verification

```sql
-- Nothing was missed. Expect 0 for all five.
SELECT COUNT(*) FROM users          WHERE reporting_currency IS NULL;
SELECT COUNT(*) FROM payment_method WHERE currency IS NULL;
SELECT COUNT(*) FROM transaction    WHERE currency IS NULL;
SELECT COUNT(*) FROM transaction    WHERE exchange_rate IS NULL;
SELECT COUNT(*) FROM transaction    WHERE settled_value IS NULL;

-- Everything is EUR, the rate is 1, and the identity holds. Expect 0 for all.
SELECT COUNT(*) FROM users          WHERE reporting_currency <> 'EUR';
SELECT COUNT(*) FROM transaction    WHERE exchange_rate <> 1;
SELECT COUNT(*) FROM transaction    WHERE settled_value <> value;
SELECT COUNT(*) FROM transaction    WHERE settled_value <> value * exchange_rate;

-- The settlement currency agrees with the recorded currency on every row that
-- has a payment method. Expect 0.
SELECT COUNT(*) FROM transaction t
JOIN payment_method pm ON pm.id = t.payment_method_id
WHERE t.currency <> pm.currency;

-- Row counts unchanged from pre-flight.
SELECT
  (SELECT COUNT(*) FROM users)          AS users,
  (SELECT COUNT(*) FROM payment_method) AS payment_methods,
  (SELECT COUNT(*) FROM transaction)    AS transactions;

-- The three CHECK constraints exist.
SELECT conname FROM pg_constraint
WHERE conname IN (
  'users_reporting_currency_check',
  'payment_method_currency_check',
  'transaction_currency_check'
);  -- expect 3 rows

-- The scratch parameter table is gone.
SELECT to_regclass('_currency_backfill_parameter');  -- expect NULL
```

The first four groups are also asserted *inside* the migration with
`RAISE EXCEPTION`, so a violation aborts the transaction rather than committing
bad data. Running them again is a cheap independent confirmation.

Smoke test after the application deploy: register a new account and confirm it
gets a `reporting_currency` (this is the blocking dependency above, and the
fastest way to catch a release that shipped without it).

---

## Rollback

### R1 — before `migrate deploy`

Nothing to undo.

### R2 — `migrate deploy` failed

The file runs in a single transaction, so the database is unchanged. Clear the
failed record and redeploy the old image:

```
prisma migrate resolve --rolled-back 20260909037000_add_currency_columns
```

The realistic cause is the `RAISE EXCEPTION` on an incomplete backfill, which
means a `transaction` or `payment_method` row does not join to a `users` row —
run the pre-flight orphan checks to find it.

### R3 — applied, but something is wrong

Unlike the phase 3b re-ownership migration, **this one has a clean down
migration.** It is purely additive: no data is destroyed and no existing column
changes meaning, so dropping the five columns restores the previous state
exactly.

```sql
ALTER TABLE "transaction"    DROP CONSTRAINT "transaction_currency_check";
ALTER TABLE "payment_method" DROP CONSTRAINT "payment_method_currency_check";
ALTER TABLE "users"          DROP CONSTRAINT "users_reporting_currency_check";
ALTER TABLE "transaction"    DROP COLUMN "settled_value";
ALTER TABLE "transaction"    DROP COLUMN "exchange_rate";
ALTER TABLE "transaction"    DROP COLUMN "currency";
ALTER TABLE "payment_method" DROP COLUMN "currency";
ALTER TABLE "users"          DROP COLUMN "reporting_currency";
DROP TABLE IF EXISTS "_currency_backfill_parameter";
```

Then `prisma migrate resolve --rolled-back 20260909037000_add_currency_columns`
and redeploy the old image.

The one thing this loses is any non-default `reporting_currency` a user picked
after the cutover. Before running it, capture them:

```sql
SELECT id, email, reporting_currency FROM users WHERE reporting_currency <> 'EUR';
```

Once the behaviour work is live and rows carry genuinely mixed currencies, this
rollback stops being lossless — dropping `settled_value` throws away a number
that cannot be recomputed from a rate that no longer exists. **From that point
on, fix forward.**

### Correcting one user's reporting currency

The likely real-world follow-up, not a rollback. `reporting_currency` is the
source the other four columns were derived from, so correcting it does **not**
retroactively fix them:

```sql
UPDATE users SET reporting_currency = 'CHF' WHERE id = '<user-id>';
```

leaves that user's `payment_method.currency` and `transaction.currency` on
`'EUR'`. That is deliberate — the backfill recorded what the money actually was
at the time, and re-labelling historical amounts would change what they mean.
Decide per case whether the historical rows were mislabelled (update them too)
or were genuinely EUR (leave them, and let the behaviour work convert them for
display).
