import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '../utils/ORM/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import type { TMessage } from '@/utils/entities/message.entity'

@Injectable()
export class MessageService {
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
      conversationId: number
   ): Promise<TMessage> {
      return await this.prismaService.message.create({
         data: {
            content,
            author: {
               connect: { id: authorId }, // Kết nối với user author
            },
            conversation: {
               connect: { id: conversationId }, // Kết nối với conversation
            },
         },
         include: {
            author: true, // Bao gồm thông tin về author trong kết quả trả về
            conversation: true, // Bao gồm thông tin về conversation trong kết quả trả về
         },
      })
   }
}
