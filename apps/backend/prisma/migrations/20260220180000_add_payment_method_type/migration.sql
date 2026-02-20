-- CreateEnum
CREATE TYPE "payment_method_type" AS ENUM ('CASH', 'DEBIT_CARD');

-- AlterTable
ALTER TABLE "payment_method" ADD COLUMN "type" "payment_method_type" NOT NULL DEFAULT 'CASH';
