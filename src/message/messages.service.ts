import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '../utils/ORM/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import type { TMessage } from '@/utils/entities/message.entity'
import type { TMsgToken } from './types'
import { EMsgMessages } from './messages'
import type { TUserId } from '@/gateway/types'

@Injectable()
export class MessageService {
   private uniqueMsgTokens = new Map<TUserId, TMsgToken>()

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

   printOutTokens(): void {
      for (const [key, value] of this.uniqueMsgTokens) {
         console.log(`>>> key: ${key} - something: ${value}`)
      }
   }

   isFirstMessage(userId: TUserId, token: TMsgToken): boolean {
      this.printOutTokens()
      if (this.uniqueMsgTokens.get(userId) === token) {
         return false
      }
      this.uniqueMsgTokens.set(userId, token)
      return true
   }

   removeToken(userId: TUserId): void {
      this.uniqueMsgTokens.delete(userId)
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
