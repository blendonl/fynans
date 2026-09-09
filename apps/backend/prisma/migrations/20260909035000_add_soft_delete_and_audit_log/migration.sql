-- CreateEnum
CREATE TYPE "audit_entity" AS ENUM ('TRANSACTION', 'EXPENSE', 'INCOME');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'APPROVED', 'REJECTED', 'RESUBMITTED');

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "expense" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "income" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "transaction_deleted_at_idx" ON "transaction"("deleted_at");

-- CreateIndex
CREATE INDEX "expense_deleted_at_idx" ON "expense"("deleted_at");

-- CreateIndex
CREATE INDEX "income_deleted_at_idx" ON "income"("deleted_at");

-- CreateTable
CREATE TABLE "financial_audit_log" (
    "id" TEXT NOT NULL,
    "entity" "audit_entity" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" "audit_action" NOT NULL,
    "actor_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "family_id" TEXT,
    "changes" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "financial_audit_log_entity_entity_id_idx" ON "financial_audit_log"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "financial_audit_log_actor_id_idx" ON "financial_audit_log"("actor_id");

-- CreateIndex
CREATE INDEX "financial_audit_log_transaction_id_idx" ON "financial_audit_log"("transaction_id");

-- CreateIndex
CREATE INDEX "financial_audit_log_family_id_idx" ON "financial_audit_log"("family_id");

-- CreateIndex
CREATE INDEX "financial_audit_log_created_at_idx" ON "financial_audit_log"("created_at");

-- AddForeignKey
ALTER TABLE "financial_audit_log" ADD CONSTRAINT "financial_audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
