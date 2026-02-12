-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "access_token_expires_at" TIMESTAMP(3),
ADD COLUMN     "scope" TEXT;
