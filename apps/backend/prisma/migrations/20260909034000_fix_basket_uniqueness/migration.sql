-- Backfill: keep the oldest family basket per family, move the rest of their items onto it
WITH "surviving" AS (
    SELECT DISTINCT ON ("family_id") "id", "family_id"
    FROM "basket"
    WHERE "scope" = 'FAMILY' AND "family_id" IS NOT NULL
    ORDER BY "family_id", "created_at" ASC, "id" ASC
)
UPDATE "basket_item" bi
SET "basket_id" = s."id"
FROM "basket" b
JOIN "surviving" s ON s."family_id" = b."family_id"
WHERE bi."basket_id" = b."id" AND b."id" <> s."id";

DELETE FROM "basket" b
USING (
    SELECT DISTINCT ON ("family_id") "id", "family_id"
    FROM "basket"
    WHERE "scope" = 'FAMILY' AND "family_id" IS NOT NULL
    ORDER BY "family_id", "created_at" ASC, "id" ASC
) s
WHERE b."family_id" = s."family_id" AND b."id" <> s."id";

-- DropIndex
DROP INDEX "basket_user_id_scope_key";

-- DropIndex
DROP INDEX "basket_family_id_scope_key";

-- CreateIndex
CREATE UNIQUE INDEX "basket_family_id_key" ON "basket"("family_id");

-- A user gets exactly one personal basket; family baskets are unique per family.
-- Partial unique indexes are not expressible in the Prisma schema.
CREATE UNIQUE INDEX "basket_personal_user_id_key" ON "basket"("user_id") WHERE "scope" = 'PERSONAL';
