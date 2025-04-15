import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '../configs/db/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import type { TDirectMessage } from '@/utils/entities/direct-message.entity'
import { getDirectMessages } from '@prisma/client/sql'
import { EMessageStatus, ESortTypes } from './enums'
import dayjs from 'dayjs'
import type { TGetDirectMessagesData } from './types'

@Injectable()
export class MessageService {
   constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService) {}

   async findMsgById(msgId: number): Promise<TDirectMessage | null> {
      return await this.prismaService.directMessage.findUnique({
         where: { id: msgId },
      })
   }

   async updateMsg(msgId: number, updates: Partial<TDirectMessage>): Promise<TDirectMessage> {
      const validUpdates = {}
      for (const key of Object.keys(updates)) {
         const value = validUpdates[key]
         if (value) {
            validUpdates[key] = value
         }
      }
      return await this.prismaService.directMessage.update({
         where: { id: msgId },
         data: validUpdates,
      })
   }

   async createNewDirectMessage(
      content: string,
      authorId: number,
      timestamp: Date,
      directChatId: number
   ): Promise<TDirectMessage> {
      return await this.prismaService.directMessage.create({
         data: {
            content,
            authorId,
            createdAt: timestamp,
            directChatId,
            status: EMessageStatus.SENT,
         },
      })
   }

   async findDirectMessagesByOffset(
      messageOffset: Date,
      directChatId: number
   ): Promise<TDirectMessage[]> {
      return await this.prismaService.directMessage.findMany({
         where: {
            createdAt: {
               gt: messageOffset,
            },
            directChatId,
         },
         orderBy: {
            createdAt: 'asc',
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

   async getDirectMessages(
      msgTime: Date,
      directChatId: number,
      limit: number,
      sortType?: ESortTypes
   ): Promise<TGetDirectMessagesData> {
      const messages = (await this.prismaService.$queryRawTyped(
         getDirectMessages(msgTime.toISOString(), directChatId, limit + 1)
      )) as TDirectMessage[]
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
