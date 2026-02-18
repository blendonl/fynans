-- CreateEnum
CREATE TYPE "basket_scope" AS ENUM ('PERSONAL', 'FAMILY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "notification_type" ADD VALUE 'BASKET_ITEM_ADDED';
ALTER TYPE "notification_type" ADD VALUE 'BASKET_ITEMS_BOUGHT';

-- CreateTable
CREATE TABLE "basket" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "family_id" TEXT,
    "scope" "basket_scope" NOT NULL DEFAULT 'PERSONAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "basket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basket_item" (
    "id" TEXT NOT NULL,
    "basket_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "price" DECIMAL(65,30),
    "category_id" TEXT,
    "notes" TEXT,
    "added_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "basket_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "basket_user_id_idx" ON "basket"("user_id");

-- CreateIndex
CREATE INDEX "basket_family_id_idx" ON "basket"("family_id");

-- CreateIndex
CREATE UNIQUE INDEX "basket_user_id_scope_key" ON "basket"("user_id", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "basket_family_id_scope_key" ON "basket"("family_id", "scope");

-- CreateIndex
CREATE INDEX "basket_item_basket_id_idx" ON "basket_item"("basket_id");

-- AddForeignKey
ALTER TABLE "basket" ADD CONSTRAINT "basket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket" ADD CONSTRAINT "basket_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket_item" ADD CONSTRAINT "basket_item_basket_id_fkey" FOREIGN KEY ("basket_id") REFERENCES "basket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket_item" ADD CONSTRAINT "basket_item_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "item_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
