import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '../utils/ORM/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import type { TMessage } from '@/utils/entities/message.entity'
import { EMsgMessages } from './messages'

@Injectable()
export class MessageService {
   constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService) {}

   async findMessagesByDirectChatId(directChatId: number): Promise<TMessage[]> {
      return await this.prismaService.message.findMany({
         where: {
            directChatId,
         },
      })
   }

   async createNewMessage(
      content: string,
      authorId: number,
      timestamp: Date,
      directChatId?: number,
      groupId?: number
   ): Promise<TMessage> {
      if (!groupId && !directChatId) {
         throw new BadRequestException(EMsgMessages.CONVERSATION_ID_NOT_FOUND)
      }
      return await this.prismaService.message.create({
         data: {
            content,
            authorId,
            createdAt: timestamp,
            ...(directChatId
               ? {
                    directChatId,
                 }
               : {
                    groupId,
                 }),
         },
      })
   }

   async findDirectMessagesByOffset(
      messageOffset: Date,
      directChatId: number
   ): Promise<TMessage[]> {
      return await this.prismaService.message.findMany({
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
}
