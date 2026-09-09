-- Expense categories, income categories and items stop being globally shared rows
-- behind junction tables and become rows owned by exactly one user. Every row that
-- more than one user reached through a junction table is duplicated so that each
-- of those users keeps their own private copy.

-- ---------------------------------------------------------------------------
-- expense_category
-- ---------------------------------------------------------------------------

CREATE TABLE "_owner_map_expense_category" (
    "old_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "new_id" TEXT NOT NULL,
    "keeps_old_id" BOOLEAN NOT NULL
);

INSERT INTO "_owner_map_expense_category" ("old_id", "user_id", "new_id", "keeps_old_id")
WITH "claim" AS (
    SELECT uec."category_id" AS "old_id", uec."user_id", uec."created_at"
    FROM "user_expense_category" uec
    UNION ALL
    SELECT e."category_id" AS "old_id", t."user_id", t."created_at"
    FROM "expense" e
    JOIN "transaction" t ON t."id" = e."transaction_id"
),
"ranked" AS (
    SELECT "old_id", "user_id",
           ROW_NUMBER() OVER (
               PARTITION BY "old_id"
               ORDER BY MIN("created_at"), "user_id"
           ) AS "rn"
    FROM "claim"
    GROUP BY "old_id", "user_id"
)
SELECT "old_id",
       "user_id",
       CASE WHEN "rn" = 1 THEN "old_id" ELSE gen_random_uuid()::text END,
       "rn" = 1
FROM "ranked";

CREATE UNIQUE INDEX "_owner_map_expense_category_new_id_key" ON "_owner_map_expense_category"("new_id");
CREATE INDEX "_owner_map_expense_category_old_id_user_id_idx" ON "_owner_map_expense_category"("old_id", "user_id");

DROP INDEX "expense_category_name_key";

ALTER TABLE "expense_category" ADD COLUMN "user_id" TEXT;

UPDATE "expense_category" c
SET "user_id" = m."user_id"
FROM "_owner_map_expense_category" m
WHERE m."new_id" = c."id" AND m."keeps_old_id";

INSERT INTO "expense_category" ("id", "user_id", "parent_id", "name", "isConnectedToStore", "created_at", "updated_at")
SELECT m."new_id", m."user_id", c."parent_id", c."name", c."isConnectedToStore", c."created_at", CURRENT_TIMESTAMP
FROM "_owner_map_expense_category" m
JOIN "expense_category" c ON c."id" = m."old_id"
WHERE NOT m."keeps_old_id";

UPDATE "expense_category" c
SET "parent_id" = pm."new_id"
FROM "_owner_map_expense_category" pm
WHERE c."parent_id" IS NOT NULL
  AND pm."old_id" = c."parent_id"
  AND pm."user_id" = c."user_id"
  AND pm."new_id" <> c."parent_id";

UPDATE "expense_category" c
SET "parent_id" = NULL
WHERE c."parent_id" IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM "expense_category" p
      WHERE p."id" = c."parent_id" AND p."user_id" = c."user_id"
  );

UPDATE "expense" e
SET "category_id" = m."new_id"
FROM "transaction" t, "_owner_map_expense_category" m
WHERE t."id" = e."transaction_id"
  AND m."old_id" = e."category_id"
  AND m."user_id" = t."user_id"
  AND m."new_id" <> e."category_id";

DELETE FROM "expense_category" WHERE "user_id" IS NULL;

DO $$
DECLARE
    "expected" BIGINT;
    "actual" BIGINT;
    "unowned" BIGINT;
BEGIN
    SELECT COUNT(*) INTO "expected" FROM "_owner_map_expense_category";
    SELECT COUNT(*) INTO "actual" FROM "expense_category";
    IF "expected" <> "actual" THEN
        RAISE EXCEPTION 'expense_category backfill: expected % owned rows, found %', "expected", "actual";
    END IF;

    SELECT COUNT(*) INTO "unowned" FROM "expense_category" WHERE "user_id" IS NULL;
    IF "unowned" > 0 THEN
        RAISE EXCEPTION 'expense_category backfill: % rows still have no owner', "unowned";
    END IF;

    SELECT COUNT(*) INTO "unowned"
    FROM "expense" e
    JOIN "transaction" t ON t."id" = e."transaction_id"
    JOIN "expense_category" c ON c."id" = e."category_id"
    WHERE c."user_id" <> t."user_id";
    IF "unowned" > 0 THEN
        RAISE EXCEPTION 'expense_category backfill: % expenses still point at another user''s category', "unowned";
    END IF;
END $$;

ALTER TABLE "expense_category" ALTER COLUMN "user_id" SET NOT NULL;

CREATE UNIQUE INDEX "expense_category_user_id_name_key" ON "expense_category"("user_id", "name");
CREATE INDEX "expense_category_user_id_idx" ON "expense_category"("user_id");

ALTER TABLE "expense_category" ADD CONSTRAINT "expense_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE "_owner_map_expense_category";

-- ---------------------------------------------------------------------------
-- income_category
-- ---------------------------------------------------------------------------

CREATE TABLE "_owner_map_income_category" (
    "old_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "new_id" TEXT NOT NULL,
    "keeps_old_id" BOOLEAN NOT NULL
);

INSERT INTO "_owner_map_income_category" ("old_id", "user_id", "new_id", "keeps_old_id")
WITH "claim" AS (
    SELECT uic."category_id" AS "old_id", uic."user_id", uic."created_at"
    FROM "user_income_category" uic
    UNION ALL
    SELECT i."category_id" AS "old_id", t."user_id", t."created_at"
    FROM "income" i
    JOIN "transaction" t ON t."id" = i."transaction_id"
),
"ranked" AS (
    SELECT "old_id", "user_id",
           ROW_NUMBER() OVER (
               PARTITION BY "old_id"
               ORDER BY MIN("created_at"), "user_id"
           ) AS "rn"
    FROM "claim"
    GROUP BY "old_id", "user_id"
)
SELECT "old_id",
       "user_id",
       CASE WHEN "rn" = 1 THEN "old_id" ELSE gen_random_uuid()::text END,
       "rn" = 1
FROM "ranked";

CREATE UNIQUE INDEX "_owner_map_income_category_new_id_key" ON "_owner_map_income_category"("new_id");
CREATE INDEX "_owner_map_income_category_old_id_user_id_idx" ON "_owner_map_income_category"("old_id", "user_id");

DROP INDEX "income_category_name_key";

ALTER TABLE "income_category" ADD COLUMN "user_id" TEXT;

UPDATE "income_category" c
SET "user_id" = m."user_id"
FROM "_owner_map_income_category" m
WHERE m."new_id" = c."id" AND m."keeps_old_id";

INSERT INTO "income_category" ("id", "user_id", "parent_id", "name", "created_at", "updated_at")
SELECT m."new_id", m."user_id", c."parent_id", c."name", c."created_at", CURRENT_TIMESTAMP
FROM "_owner_map_income_category" m
JOIN "income_category" c ON c."id" = m."old_id"
WHERE NOT m."keeps_old_id";

UPDATE "income_category" c
SET "parent_id" = pm."new_id"
FROM "_owner_map_income_category" pm
WHERE c."parent_id" IS NOT NULL
  AND pm."old_id" = c."parent_id"
  AND pm."user_id" = c."user_id"
  AND pm."new_id" <> c."parent_id";

UPDATE "income_category" c
SET "parent_id" = NULL
WHERE c."parent_id" IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM "income_category" p
      WHERE p."id" = c."parent_id" AND p."user_id" = c."user_id"
  );

UPDATE "income" i
SET "category_id" = m."new_id"
FROM "transaction" t, "_owner_map_income_category" m
WHERE t."id" = i."transaction_id"
  AND m."old_id" = i."category_id"
  AND m."user_id" = t."user_id"
  AND m."new_id" <> i."category_id";

DELETE FROM "income_category" WHERE "user_id" IS NULL;

DO $$
DECLARE
    "expected" BIGINT;
    "actual" BIGINT;
    "unowned" BIGINT;
BEGIN
    SELECT COUNT(*) INTO "expected" FROM "_owner_map_income_category";
    SELECT COUNT(*) INTO "actual" FROM "income_category";
    IF "expected" <> "actual" THEN
        RAISE EXCEPTION 'income_category backfill: expected % owned rows, found %', "expected", "actual";
    END IF;

    SELECT COUNT(*) INTO "unowned" FROM "income_category" WHERE "user_id" IS NULL;
    IF "unowned" > 0 THEN
        RAISE EXCEPTION 'income_category backfill: % rows still have no owner', "unowned";
    END IF;

    SELECT COUNT(*) INTO "unowned"
    FROM "income" i
    JOIN "transaction" t ON t."id" = i."transaction_id"
    JOIN "income_category" c ON c."id" = i."category_id"
    WHERE c."user_id" <> t."user_id";
    IF "unowned" > 0 THEN
        RAISE EXCEPTION 'income_category backfill: % incomes still point at another user''s category', "unowned";
    END IF;
END $$;

ALTER TABLE "income_category" ALTER COLUMN "user_id" SET NOT NULL;

CREATE UNIQUE INDEX "income_category_user_id_name_key" ON "income_category"("user_id", "name");
CREATE INDEX "income_category_user_id_idx" ON "income_category"("user_id");

ALTER TABLE "income_category" ADD CONSTRAINT "income_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE "_owner_map_income_category";

-- ---------------------------------------------------------------------------
-- item
--
-- store_item rows stay shared and keep pointing at the copy that kept the
-- original id. Duplicated items carry their own copy of the item_size rows.
-- ---------------------------------------------------------------------------

CREATE TABLE "_owner_map_item" (
    "old_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "new_id" TEXT NOT NULL,
    "keeps_old_id" BOOLEAN NOT NULL
);

INSERT INTO "_owner_map_item" ("old_id", "user_id", "new_id", "keeps_old_id")
WITH "claim" AS (
    SELECT ui."item_id" AS "old_id", ui."user_id", ui."created_at"
    FROM "user_item" ui
    UNION ALL
    SELECT si."item_id" AS "old_id", usi."user_id", usi."created_at"
    FROM "store_item" si
    JOIN "user_store_item" usi ON usi."store_item_id" = si."id"
),
"ranked" AS (
    SELECT "old_id", "user_id",
           ROW_NUMBER() OVER (
               PARTITION BY "old_id"
               ORDER BY MIN("created_at"), "user_id"
           ) AS "rn"
    FROM "claim"
    GROUP BY "old_id", "user_id"
)
SELECT "old_id",
       "user_id",
       CASE WHEN "rn" = 1 THEN "old_id" ELSE gen_random_uuid()::text END,
       "rn" = 1
FROM "ranked";

CREATE UNIQUE INDEX "_owner_map_item_new_id_key" ON "_owner_map_item"("new_id");
CREATE INDEX "_owner_map_item_old_id_user_id_idx" ON "_owner_map_item"("old_id", "user_id");

DO $$
DECLARE
    "stranded" BIGINT;
BEGIN
    SELECT COUNT(*) INTO "stranded"
    FROM "item" i
    WHERE NOT EXISTS (SELECT 1 FROM "_owner_map_item" m WHERE m."old_id" = i."id")
      AND EXISTS (SELECT 1 FROM "store_item" si WHERE si."item_id" = i."id");
    IF "stranded" > 0 THEN
        RAISE EXCEPTION 'item backfill: % items have store prices but no user claiming them; assign an owner before migrating', "stranded";
    END IF;
END $$;

DROP INDEX "item_name_key";

ALTER TABLE "item" ADD COLUMN "user_id" TEXT;

UPDATE "item" i
SET "user_id" = m."user_id"
FROM "_owner_map_item" m
WHERE m."new_id" = i."id" AND m."keeps_old_id";

INSERT INTO "item" ("id", "user_id", "category_id", "name", "name_en", "created_at", "updated_at")
SELECT m."new_id", m."user_id", i."category_id", i."name", i."name_en", i."created_at", CURRENT_TIMESTAMP
FROM "_owner_map_item" m
JOIN "item" i ON i."id" = m."old_id"
WHERE NOT m."keeps_old_id";

INSERT INTO "item_size" ("id", "item_id", "value", "unit", "created_at", "updated_at")
SELECT gen_random_uuid()::text, m."new_id", s."value", s."unit", s."created_at", CURRENT_TIMESTAMP
FROM "_owner_map_item" m
JOIN "item_size" s ON s."item_id" = m."old_id"
WHERE NOT m."keeps_old_id";

DELETE FROM "item" WHERE "user_id" IS NULL;

DO $$
DECLARE
    "expected" BIGINT;
    "actual" BIGINT;
    "unowned" BIGINT;
BEGIN
    SELECT COUNT(*) INTO "expected" FROM "_owner_map_item";
    SELECT COUNT(*) INTO "actual" FROM "item";
    IF "expected" <> "actual" THEN
        RAISE EXCEPTION 'item backfill: expected % owned rows, found %', "expected", "actual";
    END IF;

    SELECT COUNT(*) INTO "unowned" FROM "item" WHERE "user_id" IS NULL;
    IF "unowned" > 0 THEN
        RAISE EXCEPTION 'item backfill: % rows still have no owner', "unowned";
    END IF;
END $$;

ALTER TABLE "item" ALTER COLUMN "user_id" SET NOT NULL;

CREATE UNIQUE INDEX "item_user_id_name_key" ON "item"("user_id", "name");
CREATE INDEX "item_user_id_idx" ON "item"("user_id");

ALTER TABLE "item" ADD CONSTRAINT "item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE "_owner_map_item";

-- ---------------------------------------------------------------------------
-- The junction tables no longer carry any information.
-- ---------------------------------------------------------------------------

DROP TABLE "user_expense_category";
DROP TABLE "user_income_category";
DROP TABLE "user_item";
