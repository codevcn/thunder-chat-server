import type { TFriendRequest } from '@/utils/entities/friend.entity'
import { EProviderTokens } from '@/utils/enums'
import { PrismaService } from '@/configs/db/prisma.service'
import type { TSignatureObject } from '@/utils/types'
import { Inject, Injectable } from '@nestjs/common'
import { GetFriendsDTO } from './DTO'
import type { TGetFriendsData } from './types'

@Injectable()
export class FriendService {
   constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService) {}

   async findByIds(userId: number, friendId: number): Promise<TFriendRequest | null> {
      return await this.prismaService.friendRequest.findFirst({
         where: {
            OR: [
               { senderId: userId, recipientId: friendId },
               { senderId: friendId, recipientId: userId },
            ],
         },
      })
   }

   async isFriend(userId: number, friendId: number): Promise<boolean> {
      return !!(await this.findByIds(userId, friendId))
   }

   async getFriends(getFriendsPayload: GetFriendsDTO): Promise<TGetFriendsData[]> {
      const { limit, userId, lastFriendId } = getFriendsPayload
      let cursor: TSignatureObject = {}
      if (lastFriendId) {
         cursor = {
            skip: 1,
            cursor: {
               id: lastFriendId,
            },
         }
      }
      return await this.prismaService.friend.findMany({
         take: limit,
         ...cursor,
         where: {
            OR: [{ recipientId: userId }, { senderId: userId }],
         },
         orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
         select: {
            id: true,
            senderId: true,
            Recipient: {
               include: {
                  Profile: true,
               },
            },
            createdAt: true,
         },
      })
   }
}
