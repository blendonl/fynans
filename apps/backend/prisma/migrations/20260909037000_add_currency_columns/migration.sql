-- Multi-currency columns. Columns and backfill only: nothing in the application
-- reads or writes these yet. All behaviour -- rate lookup, normalisation on the
-- write path, mixed-currency aggregates -- lands in a later change.
--
-- A receipt's currency and the currency the payment settled in can differ (a USD
-- receipt paid with a EUR card), so the dashboard needs a single normalisation
-- target per user.
--
-- EXCHANGE RATE DIRECTION, fixed here so it can never be guessed at later:
--   "transaction"."exchange_rate" is units of the SETTLEMENT currency
--   (the owning "payment_method"."currency") per ONE unit of
--   "transaction"."currency", such that
--
--       settled_value = value * exchange_rate
--
-- NULL PAYMENT METHOD: "transaction"."payment_method_id" is nullable and nulls
-- out on payment-method deletion, so a transaction can have no settlement
-- currency. When "payment_method_id" IS NULL the settlement currency IS the
-- transaction currency, therefore "exchange_rate" = 1 and
-- "settled_value" = "value". The same rule applies whenever the two currencies
-- are equal. The write path must never leave "exchange_rate" NULL on a row it
-- touched: NULL means only "this row pre-dates multi-currency".
--
-- "settled_value" is stored, never recomputed, so historical totals do not drift
-- when rates move and survive the deletion of the payment method.
--
-- Columns 2-5 land NULLABLE on purpose. This is the expand step; the contract
-- step that makes them NOT NULL belongs in a later migration, once the write
-- path always populates them.

-- ---------------------------------------------------------------------------
-- Deploy-time parameter. THIS IS THE ONLY PLACE THE CURRENCY IS NAMED.
-- Change this one literal to deploy into a market that is not the euro area.
-- ---------------------------------------------------------------------------

CREATE TABLE "_currency_backfill_parameter" (
    "reporting_currency" CHAR(3) NOT NULL
);

INSERT INTO "_currency_backfill_parameter" ("reporting_currency") VALUES ('EUR');

-- ---------------------------------------------------------------------------
-- 1. users.reporting_currency -- from the deploy-time parameter.
--    NOT NULL with deliberately NO schema default: a default would silently
--    re-introduce a hardcoded currency and let the registration flow forget to
--    choose one. Added nullable, backfilled, then constrained.
-- ---------------------------------------------------------------------------

ALTER TABLE "users" ADD COLUMN "reporting_currency" CHAR(3);

UPDATE "users"
SET "reporting_currency" = (SELECT "reporting_currency" FROM "_currency_backfill_parameter");

ALTER TABLE "users" ALTER COLUMN "reporting_currency" SET NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. payment_method.currency -- the settlement currency of the instrument.
--    Read from the value written in step 1, not from the parameter, so a later
--    correction to one user's reporting currency has a single source.
-- ---------------------------------------------------------------------------

ALTER TABLE "payment_method" ADD COLUMN "currency" CHAR(3);

UPDATE "payment_method" pm
SET "currency" = u."reporting_currency"
FROM "users" u
WHERE u."id" = pm."user_id";

-- ---------------------------------------------------------------------------
-- 3. transaction.currency -- the currency the amount was recorded or receipted
--    in. NOT the settlement currency. Also read from step 1's value.
-- ---------------------------------------------------------------------------

ALTER TABLE "transaction" ADD COLUMN "currency" CHAR(3);

UPDATE "transaction" t
SET "currency" = u."reporting_currency"
FROM "users" u
WHERE u."id" = t."user_id";

-- ---------------------------------------------------------------------------
-- 4. transaction.exchange_rate -- exactly 1 for every existing row: after
--    steps 2 and 3 the transaction currency and the settlement currency are
--    equal by construction, and rows with no payment method follow the same
--    rule.
-- ---------------------------------------------------------------------------

ALTER TABLE "transaction" ADD COLUMN "exchange_rate" DECIMAL(18,8);

UPDATE "transaction" SET "exchange_rate" = 1;

-- ---------------------------------------------------------------------------
-- 5. transaction.settled_value -- equal to value for every existing row, which
--    is what settled_value = value * exchange_rate yields at a rate of 1.
-- ---------------------------------------------------------------------------

ALTER TABLE "transaction" ADD COLUMN "settled_value" DECIMAL(12,2);

UPDATE "transaction" SET "settled_value" = "value";

-- ---------------------------------------------------------------------------
-- Assert the backfill was total. Every payment_method and every transaction has
-- a NOT NULL user_id behind a foreign key, so there is no row the joins above
-- could legitimately have missed.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
    "missing" BIGINT;
BEGIN
    SELECT COUNT(*) INTO "missing" FROM "payment_method" WHERE "currency" IS NULL;
    IF "missing" > 0 THEN
        RAISE EXCEPTION 'currency backfill: % payment methods have no currency', "missing";
    END IF;

    SELECT COUNT(*) INTO "missing" FROM "transaction" WHERE "currency" IS NULL;
    IF "missing" > 0 THEN
        RAISE EXCEPTION 'currency backfill: % transactions have no currency', "missing";
    END IF;

    SELECT COUNT(*) INTO "missing" FROM "transaction" WHERE "exchange_rate" IS NULL;
    IF "missing" > 0 THEN
        RAISE EXCEPTION 'currency backfill: % transactions have no exchange rate', "missing";
    END IF;

    SELECT COUNT(*) INTO "missing" FROM "transaction" WHERE "settled_value" IS NULL;
    IF "missing" > 0 THEN
        RAISE EXCEPTION 'currency backfill: % transactions have no settled value', "missing";
    END IF;

    SELECT COUNT(*) INTO "missing"
    FROM "transaction"
    WHERE "settled_value" <> "value" * "exchange_rate";
    IF "missing" > 0 THEN
        RAISE EXCEPTION 'currency backfill: % transactions break settled_value = value * exchange_rate', "missing";
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- ISO 4217 shape. Prisma cannot express these, so they live only here.
-- CHAR(3) is blank-padded, and the regex operator strips the padding, so a
-- two-letter code fails as surely as a lowercase one.
-- ---------------------------------------------------------------------------

ALTER TABLE "users" ADD CONSTRAINT "users_reporting_currency_check"
    CHECK ("reporting_currency" ~ '^[A-Z]{3}$');

ALTER TABLE "payment_method" ADD CONSTRAINT "payment_method_currency_check"
    CHECK ("currency" ~ '^[A-Z]{3}$');

ALTER TABLE "transaction" ADD CONSTRAINT "transaction_currency_check"
    CHECK ("currency" ~ '^[A-Z]{3}$');

DROP TABLE "_currency_backfill_parameter";
