-- AlterTable
ALTER TABLE "user"
  ADD COLUMN "role" TEXT NOT NULL DEFAULT 'admin',
  ADD COLUMN "banned" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "banReason" TEXT,
  ADD COLUMN "banExpires" TIMESTAMP(3);

-- Existing accounts retain the single administrative access level.
UPDATE "user" SET "role" = 'admin';

-- AlterTable
ALTER TABLE "session" ADD COLUMN "impersonatedBy" TEXT;
