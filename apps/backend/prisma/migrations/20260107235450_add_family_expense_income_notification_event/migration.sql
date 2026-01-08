/*
  Warnings:

  - The values [FAMILY_TRANSACTION_CREATED] on the enum `notification_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "notification_type_new" AS ENUM ('FAMILY_INVITATION_SENT', 'FAMILY_INVITATION_RECEIVED', 'FAMILY_INVITATION_ACCEPTED', 'FAMILY_INVITATION_DECLINED', 'FAMILY_MEMBER_JOINED', 'FAMILY_MEMBER_LEFT', 'FAMILY_EXPENSE_CREATED', 'FAMILY_INCOME_CREATED', 'TRANSACTION_MILESTONE_BUDGET_ALERT', 'TRANSACTION_MILESTONE_SPENDING_LIMIT', 'RECEIPT_PROCESSING_COMPLETE');
ALTER TABLE "notification" ALTER COLUMN "type" TYPE "notification_type_new" USING ("type"::text::"notification_type_new");
ALTER TYPE "notification_type" RENAME TO "notification_type_old";
ALTER TYPE "notification_type_new" RENAME TO "notification_type";
DROP TYPE "public"."notification_type_old";
COMMIT;
