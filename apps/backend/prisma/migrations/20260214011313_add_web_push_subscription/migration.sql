-- CreateTable
CREATE TABLE "web_push_subscription" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "web_push_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "web_push_subscription_endpoint_key" ON "web_push_subscription"("endpoint");

-- CreateIndex
CREATE INDEX "web_push_subscription_user_id_idx" ON "web_push_subscription"("user_id");

-- CreateIndex
CREATE INDEX "web_push_subscription_endpoint_idx" ON "web_push_subscription"("endpoint");

-- AddForeignKey
ALTER TABLE "web_push_subscription" ADD CONSTRAINT "web_push_subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
