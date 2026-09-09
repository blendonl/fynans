-- AlterTable
ALTER TABLE "users" DROP COLUMN "balance";

-- AlterTable
ALTER TABLE "income" ALTER COLUMN "store_id" DROP NOT NULL,
ADD COLUMN     "description" TEXT;
