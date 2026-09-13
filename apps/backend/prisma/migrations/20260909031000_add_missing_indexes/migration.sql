-- CreateIndex
CREATE INDEX "expense_category_id_idx" ON "expense"("category_id");

-- CreateIndex
CREATE INDEX "expense_store_id_idx" ON "expense"("store_id");

-- CreateIndex
CREATE INDEX "expense_category_parent_id_idx" ON "expense_category"("parent_id");

-- CreateIndex
CREATE INDEX "expense_item_expense_id_idx" ON "expense_item"("expense_id");

-- CreateIndex
CREATE INDEX "expense_item_item_id_idx" ON "expense_item"("item_id");

-- CreateIndex
CREATE INDEX "income_category_id_idx" ON "income"("category_id");

-- CreateIndex
CREATE INDEX "income_category_parent_id_idx" ON "income_category"("parent_id");

-- CreateIndex
CREATE INDEX "store_item_item_id_idx" ON "store_item"("item_id");

-- CreateIndex
CREATE INDEX "store_item_store_id_idx" ON "store_item"("store_id");

-- CreateIndex
CREATE INDEX "store_item_discount_store_item_id_idx" ON "store_item_discount"("store_item_id");

-- CreateIndex
CREATE INDEX "item_category_parent_id_idx" ON "item_category"("parent_id");

-- CreateIndex
CREATE INDEX "transaction_recorded_at_idx" ON "transaction"("recorded_at");
