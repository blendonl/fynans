-- Backfill: family-scoped transactions whose family was already removed
UPDATE "transaction"
SET "scope" = 'PERSONAL'
WHERE "scope" = 'FAMILY' AND "family_id" IS NULL;

-- DropForeignKey
ALTER TABLE "expense_item" DROP CONSTRAINT "expense_item_expense_id_fkey";

-- AddForeignKey
ALTER TABLE "expense_item" ADD CONSTRAINT "expense_item_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "receipt" DROP CONSTRAINT "receipt_expense_id_fkey";

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_family_id_fkey";

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Family scope and family id must agree; not expressible in the Prisma schema
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_family_scope_check" CHECK ("scope" <> 'FAMILY' OR "family_id" IS NOT NULL);
