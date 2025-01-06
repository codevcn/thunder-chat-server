import type { TFindConversationData, TStartConversationData } from './types'
import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '@/utils/ORM/prisma.service'
import { EProviderTokens } from '@/utils/enums'

@Injectable()
export class ConversationService {
   constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService) {}

   // async searchConversation({
   //    email,
   //    username,
   //    nameOfUser,
   //    creatorId,
   // }: TSearchConversationParams): Promise<TUserWithProfile[]> {
   //    const user = await this.prismaService.user.findMany({
   //       where: {
   //          OR: [{ email }, { username }],
   //          NOT: {
   //             id: creatorId,
   //          },
   //       },
   //       include: {
   //          Profile: {
   //             where: {
   //                OR: [
   //                   {
   //                      firstName: {
   //                         contains: nameOfUser,
   //                      },
   //                   },
   //                   {
   //                      lastName: {
   //                         contains: nameOfUser,
   //                      },
   //                   },
   //                ],
   //             },
   //          },
   //       },
   //    })

   //    return user
   // }

   async findConversation(
      recipientId: number,
      creatorId: number
   ): Promise<TFindConversationData | null> {
      return await this.prismaService.conversation.findFirst({
         where: {
            creatorId,
            recipientId,
         },
         include: {
            Recipient: {
               include: {
                  Profile: true,
               },
            },
         },
      })
   }

   async findConversationById(id: number): Promise<TFindConversationData | null> {
      return await this.prismaService.conversation.findUnique({
         where: { id },
         include: {
            Recipient: {
               include: {
                  Profile: true,
               },
            },
         },
      })
   }

   async startConversation(
      recipientId: number,
      creatorId: number
   ): Promise<TStartConversationData> {
      const exist_conversation = await this.findConversation(recipientId, creatorId)
      if (exist_conversation) {
         return exist_conversation
      }
      return await this.prismaService.conversation.create({
         data: {
            creatorId,
            recipientId,
         },
         include: {
            Recipient: {
               include: {
                  Profile: true,
               },
            },
         },
      })
   }
}
