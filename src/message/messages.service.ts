import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '../configs/db/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import type { TDirectMessage } from '@/utils/entities/direct-message.entity'
import { getDirectMessages } from '@prisma/client/sql'
import { ESortTypes } from './enums'
import dayjs from 'dayjs'
import type { TGetDirectMessagesData } from './types'

@Injectable()
export class MessageService {
   constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService) {}

   async createNewDirectMessage(
      content: string,
      authorId: number,
      timestamp: Date,
      directChatId: number
   ): Promise<TDirectMessage> {
      return await this.prismaService.directMessage.create({
         data: { content, authorId, createdAt: timestamp, directChatId },
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
         getDirectMessages(new Date(msgTime), directChatId, limit + 1)
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
}
