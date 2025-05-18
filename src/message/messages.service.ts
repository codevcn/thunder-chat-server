import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '../configs/db/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import type { TDirectMessage } from '@/utils/entities/direct-message.entity'
import { EMessageStatus, EMessageTypes, ESortTypes } from './enums'
import dayjs from 'dayjs'
import type { TGetDirectMessagesData, TMessageOffset } from './types'

@Injectable()
export class MessageService {
   constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private PrismaService: PrismaService) {}

   async findMsgById(msgId: number): Promise<TDirectMessage | null> {
      return await this.PrismaService.directMessage.findUnique({
         where: { id: msgId },
      })
   }

   async updateMsg(msgId: number, updates: Partial<TDirectMessage>): Promise<TDirectMessage> {
      const validUpdates = {}
      for (const key of Object.keys(updates)) {
         const value = updates[key]
         if (value) {
            validUpdates[key] = value
         }
      }
      return await this.PrismaService.directMessage.update({
         where: { id: msgId },
         data: validUpdates,
      })
   }

   async createNewDirectMessage(
      content: string,
      authorId: number,
      timestamp: Date,
      directChatId: number,
      recipientId: number,
      type: EMessageTypes = EMessageTypes.TEXT,
      stickerUrl?: string
   ): Promise<TDirectMessage> {
      return await this.PrismaService.directMessage.create({
         data: {
            content,
            authorId,
            createdAt: timestamp,
            directChatId,
            status: EMessageStatus.SENT,
            type,
            stickerUrl,
            recipientId,
         },
      })
   }

   async getNewerDirectMessages(
      messageOffset: TMessageOffset,
      directChatId: number
   ): Promise<TDirectMessage[]> {
      return await this.PrismaService.directMessage.findMany({
         where: {
            directChatId,
            id: {
               gt: messageOffset,
            },
         },
         orderBy: {
            id: 'asc',
         },
      })
   }

   sortFetchedMessages(messages: TDirectMessage[], sortType: ESortTypes): TDirectMessage[] {
      const msgs = [...messages]
      switch (sortType) {
         case ESortTypes.TIME_ASC:
            msgs.sort(
               (curr, next) => dayjs(curr.createdAt).valueOf() - dayjs(next.createdAt).valueOf()
            )
            return msgs
      }
      return msgs
   }

   async getOlderDirectMessages(
      messageOffset: TMessageOffset,
      directChatId: number,
      limit: number,
      equalOffset: boolean
   ): Promise<TDirectMessage[]> {
      return await this.PrismaService.directMessage.findMany({
         where: {
            id: {
               [equalOffset ? 'lte' : 'lt']: messageOffset,
            },
            directChatId: directChatId,
         },
         orderBy: {
            id: 'desc',
         },
         take: limit,
      })
   }

   async getOlderDirectMessagesHandler(
      messageOffset: TMessageOffset,
      directChatId: number,
      limit: number,
      isFirstTime: boolean = false,
      sortType: ESortTypes = ESortTypes.TIME_ASC
   ): Promise<TGetDirectMessagesData> {
      const messages = await this.getOlderDirectMessages(
         messageOffset,
         directChatId,
         limit + 1,
         isFirstTime
      )
      let sortedMessages: TDirectMessage[] | null = null
      if (messages && messages.length > 0) {
         sortedMessages = messages.slice(0, -1)
         if (sortType) {
            sortedMessages = this.sortFetchedMessages(sortedMessages, sortType)
         }
      }
      return {
         hasMoreMessages: messages.length > limit,
         directMessages: sortedMessages || [],
      }
   }

   async updateMessageStatus(msgId: number, status: EMessageStatus): Promise<TDirectMessage> {
      return await this.updateMsg(msgId, {
         status,
      })
   }
}
