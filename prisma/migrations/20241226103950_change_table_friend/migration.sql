/*
  Warnings:

  - You are about to drop the column `receiverId` on the `Friend` table. All the data in the column will be lost.
  - Added the required column `recipientId` to the `Friend` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Friend" DROP CONSTRAINT "Friend_receiverId_fkey";

-- AlterTable
ALTER TABLE "Friend" DROP COLUMN "receiverId",
ADD COLUMN     "recipientId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
