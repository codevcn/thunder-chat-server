import type { TFindDirectChatData, TStartDirectChatData } from './types'
import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '@/configs/db/prisma.service'
import { EProviderTokens } from '@/utils/enums'

@Injectable()
export class DirectChatService {
   constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService) {}

   // async searchDirectChat({
   //    email,
   //    username,
   //    nameOfUser,
   //    creatorId,
   // }: TSearchDirectChatParams): Promise<TUserWithProfile[]> {
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

   async findDirectChat(
      recipientId: number,
      creatorId: number
   ): Promise<TFindDirectChatData | null> {
      return await this.prismaService.directChat.findFirst({
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

   async findDirectChatById(id: number): Promise<TFindDirectChatData | null> {
      return await this.prismaService.directChat.findUnique({
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

   async startDirectChat(recipientId: number, creatorId: number): Promise<TStartDirectChatData> {
      const exist_conversation = await this.findDirectChat(recipientId, creatorId)
      if (exist_conversation) {
         return exist_conversation
      }
      return await this.prismaService.directChat.create({
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
