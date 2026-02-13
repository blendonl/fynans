-- CreateTable
CREATE TABLE "user_expense_category" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_expense_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_income_category" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_income_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_store" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_item" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_store_item" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "store_item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_store_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_item_category" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_item_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_expense_category_user_id_idx" ON "user_expense_category"("user_id");

-- CreateIndex
CREATE INDEX "user_expense_category_category_id_idx" ON "user_expense_category"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_expense_category_user_id_category_id_key" ON "user_expense_category"("user_id", "category_id");

-- CreateIndex
CREATE INDEX "user_income_category_user_id_idx" ON "user_income_category"("user_id");

-- CreateIndex
CREATE INDEX "user_income_category_category_id_idx" ON "user_income_category"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_income_category_user_id_category_id_key" ON "user_income_category"("user_id", "category_id");

-- CreateIndex
CREATE INDEX "user_store_user_id_idx" ON "user_store"("user_id");

-- CreateIndex
CREATE INDEX "user_store_store_id_idx" ON "user_store"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_store_user_id_store_id_key" ON "user_store"("user_id", "store_id");

-- CreateIndex
CREATE INDEX "user_item_user_id_idx" ON "user_item"("user_id");

-- CreateIndex
CREATE INDEX "user_item_item_id_idx" ON "user_item"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_item_user_id_item_id_key" ON "user_item"("user_id", "item_id");

-- CreateIndex
CREATE INDEX "user_store_item_user_id_idx" ON "user_store_item"("user_id");

-- CreateIndex
CREATE INDEX "user_store_item_store_item_id_idx" ON "user_store_item"("store_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_store_item_user_id_store_item_id_key" ON "user_store_item"("user_id", "store_item_id");

-- CreateIndex
CREATE INDEX "user_item_category_user_id_idx" ON "user_item_category"("user_id");

-- CreateIndex
CREATE INDEX "user_item_category_category_id_idx" ON "user_item_category"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_item_category_user_id_category_id_key" ON "user_item_category"("user_id", "category_id");

-- AddForeignKey
ALTER TABLE "user_expense_category" ADD CONSTRAINT "user_expense_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_expense_category" ADD CONSTRAINT "user_expense_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_income_category" ADD CONSTRAINT "user_income_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_income_category" ADD CONSTRAINT "user_income_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "income_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_store" ADD CONSTRAINT "user_store_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_store" ADD CONSTRAINT "user_store_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_item" ADD CONSTRAINT "user_item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_item" ADD CONSTRAINT "user_item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_store_item" ADD CONSTRAINT "user_store_item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_store_item" ADD CONSTRAINT "user_store_item_store_item_id_fkey" FOREIGN KEY ("store_item_id") REFERENCES "store_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_item_category" ADD CONSTRAINT "user_item_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_item_category" ADD CONSTRAINT "user_item_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "item_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
