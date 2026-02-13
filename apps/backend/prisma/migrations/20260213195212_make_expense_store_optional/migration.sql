-- DropForeignKey
ALTER TABLE "expense" DROP CONSTRAINT "expense_store_id_fkey";

-- AlterTable
ALTER TABLE "expense" ALTER COLUMN "store_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
