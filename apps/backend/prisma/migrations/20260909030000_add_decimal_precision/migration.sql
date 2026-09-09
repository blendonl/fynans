-- AlterTable
ALTER TABLE "basket_item" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(12,3),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "expense_item" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "discount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(12,3);

-- AlterTable
ALTER TABLE "family" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "family_member" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "payment_method" ALTER COLUMN "initial_balance" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "current_balance" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "store_item" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "item_size" ALTER COLUMN "value" SET DATA TYPE DECIMAL(12,3);

-- AlterTable
ALTER TABLE "store_item_discount" ALTER COLUMN "discount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "transaction" ALTER COLUMN "value" SET DATA TYPE DECIMAL(12,2);
