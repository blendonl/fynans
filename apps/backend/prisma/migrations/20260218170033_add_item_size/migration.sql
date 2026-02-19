-- DropIndex
DROP INDEX "expense_category_name_search_idx";

-- DropIndex
DROP INDEX "income_category_name_search_idx";

-- DropIndex
DROP INDEX "item_name_search_idx";

-- DropIndex
DROP INDEX "store_name_search_idx";

-- AlterTable
ALTER TABLE "item" ADD COLUMN     "name_en" TEXT;

-- AlterTable
ALTER TABLE "store_item" ADD COLUMN     "item_size_id" TEXT;

-- CreateTable
CREATE TABLE "item_size" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_size_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "item_size_item_id_value_unit_key" ON "item_size"("item_id", "value", "unit");

-- AddForeignKey
ALTER TABLE "store_item" ADD CONSTRAINT "store_item_item_size_id_fkey" FOREIGN KEY ("item_size_id") REFERENCES "item_size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_size" ADD CONSTRAINT "item_size_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
