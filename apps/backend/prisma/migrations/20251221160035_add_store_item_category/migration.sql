/*
  Warnings:

  - You are about to drop the column `category_id` on the `expense_item` table. All the data in the column will be lost.
  - Added the required column `category_id` to the `store_item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "expense_item" DROP CONSTRAINT "expense_item_category_id_fkey";

-- AlterTable
ALTER TABLE "expense" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "expense_item" DROP COLUMN "category_id";

-- AlterTable
ALTER TABLE "store_item" ADD COLUMN     "category_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "store_item" ADD CONSTRAINT "store_item_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_item_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
