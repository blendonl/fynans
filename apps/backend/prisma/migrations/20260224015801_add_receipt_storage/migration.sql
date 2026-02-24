-- CreateTable
CREATE TABLE "receipt" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "family_id" TEXT,
    "expense_id" TEXT,
    "file_name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "receipt_expense_id_key" ON "receipt"("expense_id");

-- CreateIndex
CREATE INDEX "receipt_user_id_idx" ON "receipt"("user_id");

-- CreateIndex
CREATE INDEX "receipt_family_id_idx" ON "receipt"("family_id");

-- CreateIndex
CREATE INDEX "receipt_expense_id_idx" ON "receipt"("expense_id");

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;
