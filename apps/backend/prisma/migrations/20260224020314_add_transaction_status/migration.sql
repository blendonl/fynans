-- CreateEnum
CREATE TYPE "transaction_status" AS ENUM ('CONFIRMED', 'PENDING', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "notification_type" ADD VALUE 'TRANSACTION_PENDING_CREATED';
ALTER TYPE "notification_type" ADD VALUE 'TRANSACTION_APPROVED';
ALTER TYPE "notification_type" ADD VALUE 'TRANSACTION_REJECTED';

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "status" "transaction_status" NOT NULL DEFAULT 'CONFIRMED';

-- CreateIndex
CREATE INDEX "transaction_status_idx" ON "transaction"("status");

-- CreateIndex
CREATE INDEX "transaction_user_id_status_idx" ON "transaction"("user_id", "status");
