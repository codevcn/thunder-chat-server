/*
  Warnings:

  - You are about to drop the column `conversation_id` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `group_id` on the `messages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_group_id_fkey";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "conversation_id",
DROP COLUMN "group_id",
ADD COLUMN     "direct_chat_id" INTEGER,
ADD COLUMN     "group_chat_id" INTEGER;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_direct_chat_id_fkey" FOREIGN KEY ("direct_chat_id") REFERENCES "direct_chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_group_chat_id_fkey" FOREIGN KEY ("group_chat_id") REFERENCES "group_chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
