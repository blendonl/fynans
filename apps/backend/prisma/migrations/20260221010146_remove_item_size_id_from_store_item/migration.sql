/*
  Warnings:

  - You are about to drop the column `item_size_id` on the `store_item` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "store_item" DROP CONSTRAINT "store_item_item_size_id_fkey";

-- AlterTable
ALTER TABLE "store_item" DROP COLUMN "item_size_id";
