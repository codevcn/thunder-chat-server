/*
  Warnings:

  - You are about to drop the column `last_msg_sent_id` on the `conversations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_last_msg_sent_id_fkey";

-- DropIndex
DROP INDEX "conversations_last_msg_sent_id_key";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "last_msg_sent_id";
