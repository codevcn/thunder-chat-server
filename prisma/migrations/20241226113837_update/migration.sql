-- AlterTable
ALTER TABLE "Friend" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;