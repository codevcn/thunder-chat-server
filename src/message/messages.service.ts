import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '../utils/ORM/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import type { TMessage } from '@/utils/entities/message.entity'
import type { TMsgToken } from './types'
import { EMsgMessages } from './messages'

@Injectable()
export class MessageService {
   private readonly uniqueMsgTokens = new Set<TMsgToken>()

   constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService) {}

   async findMessagesByConversationId(conversationId: number): Promise<TMessage[]> {
      return await this.prismaService.message.findMany({
         where: {
            conversationId,
         },
      })
   }

   async createNewMessage(
      content: string,
      authorId: number,
      conversationId?: number,
      groupId?: number
   ): Promise<TMessage> {
      if (!groupId && !conversationId) {
         throw new BadRequestException(EMsgMessages.CONVERSATION_ID_NOT_FOUND)
      }
      return await this.prismaService.message.create({
         data: {
            content,
            authorId,
            ...(conversationId
               ? {
                    conversationId,
                 }
               : {
                    groupId,
                 }),
         },
      })
   }

   async createNewMessageHandler(
      token: string,
      content: string,
      authorId: number,
      conversationId?: number,
      groupId?: number
   ): Promise<TMessage> {
      if (this.uniqueMsgTokens.has(token)) {
         throw new BadRequestException(EMsgMessages.MESSAGE_OVERLAPS)
      }
      return await this.createNewMessage(content, authorId, conversationId, groupId)
   }
}
