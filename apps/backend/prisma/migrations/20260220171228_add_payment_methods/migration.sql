-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "payment_method_id" TEXT;

-- CreateTable
CREATE TABLE "payment_method" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366F1',
    "initial_balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "current_balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_method_user_id_idx" ON "payment_method"("user_id");

-- CreateIndex
CREATE INDEX "transaction_payment_method_id_idx" ON "transaction"("payment_method_id");

-- AddForeignKey
ALTER TABLE "payment_method" ADD CONSTRAINT "payment_method_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE SET NULL ON UPDATE CASCADE;
