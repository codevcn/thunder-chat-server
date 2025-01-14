import { UserService } from '@/user/user.service'
import type { TFriendRequest } from '@/utils/entities/friend.entity'
import { EProviderTokens } from '@/utils/enums'
import { PrismaService } from '@/configs/db/prisma.service'
import type { TSignatureObject } from '@/utils/types'
import { Inject, Injectable, BadRequestException } from '@nestjs/common'
import { countMutualFriends } from '@prisma/client/sql'
import { EFriendRequestStatus } from './enums'
import { FriendRequestActionDTO, GetFriendRequestsDTO, GetFriendsDTO } from './DTO'
import { EFriendMessages } from './messages'
import type { TGetFriendRequestsData, TGetFriendsData } from './types'
import { SocketService } from '@/gateway/socket.service'

@Injectable()
export class FriendService {
   constructor(
      @Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService,
      private userService: UserService,
      private socketService: SocketService
   ) {}

   async isFriend(userId: number, personId: number): Promise<boolean> {
      const friendship = await this.prismaService.friend.findFirst({
         where: {
            OR: [
               { senderId: userId, recipientId: personId },
               { senderId: personId, recipientId: userId },
            ],
         },
      })
      return !!friendship
   }

   async create(senderId: number, recipientId: number): Promise<TFriendRequest> {
      return await this.prismaService.friendRequest.create({
         data: {
            status: 'PENDING',
            recipientId,
            senderId,
         },
      })
   }

   async findFriendRequest(senderId: number, recipientId: number): Promise<TFriendRequest | null> {
      return await this.prismaService.friendRequest.findFirst({ where: { senderId, recipientId } })
   }

   async findSentFriendRequest(
      senderId: number,
      recipientId: number
   ): Promise<TFriendRequest | null> {
      return await this.prismaService.friendRequest.findFirst({
         where: {
            senderId: { in: [senderId, recipientId] },
            status: { in: [EFriendRequestStatus.PENDING, EFriendRequestStatus.ACCEPTED] },
         },
      })
   }

   async sendFriendRequest(senderId: number, recipientId: number): Promise<void> {
      if (senderId === recipientId) {
         throw new BadRequestException(EFriendMessages.SEND_TO_MYSELF)
      }
      const existing = await this.findSentFriendRequest(senderId, recipientId)
      if (existing) {
         throw new BadRequestException(EFriendMessages.INVITATION_SENT_BEFORE)
      }
      await this.create(senderId, recipientId)
      const sender = await this.userService.findUserWithProfileById(senderId)
      if (!sender) {
         throw new BadRequestException(EFriendMessages.SENDER_NOT_FOUND)
      }
      await this.socketService.sendFriendRequest(sender, recipientId)
   }

   /**
    * Count how many mutual friends the user have with a person
    * @param userId who is "the user" want to check number of mutual friends
    * @param friendId who is "the person" for "the user" to check
    * @returns number of mutual friends between "the user" and "the person"
    */
   async countMutualFriend(userId: number, personId: number): Promise<number> {
      const res = await this.prismaService.$queryRawTyped(countMutualFriends(userId, personId))
      return Number(res[0].mutualFriends)
   }

   async friendRequestAction(friendRequestPayload: FriendRequestActionDTO): Promise<void> {
      const { friendRequestId, action } = friendRequestPayload
      switch (action) {
         case EFriendRequestStatus.ACCEPTED:
            await this.prismaService.$transaction(async (tx) => {
               const friendRequest = await this.prismaService.friendRequest.update({
                  where: {
                     id: friendRequestId,
                  },
                  data: {
                     status: EFriendRequestStatus.ACCEPTED,
                  },
               })
               await this.prismaService.friend.create({
                  data: {
                     recipientId: friendRequest.recipientId,
                     senderId: friendRequest.senderId,
                  },
               })
            })
            break
         case EFriendRequestStatus.REJECTED:
            await this.prismaService.friendRequest.update({
               where: {
                  id: friendRequestId,
               },
               data: {
                  status: EFriendRequestStatus.REJECTED,
               },
            })
            break
      }
   }

   async getFriendRequests(
      getFriendRequestsPayload: GetFriendRequestsDTO
   ): Promise<TGetFriendRequestsData[]> {
      const { lastFriendRequestId, limit, userId } = getFriendRequestsPayload
      let cursor: TSignatureObject = {}
      if (lastFriendRequestId) {
         cursor = {
            skip: 1,
            cursor: {
               id: lastFriendRequestId,
            },
         }
      }
      return await this.prismaService.friendRequest.findMany({
         take: limit,
         ...cursor,
         where: {
            OR: [{ recipientId: userId }, { senderId: userId }],
         },
         orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
         select: {
            id: true,
            Sender: {
               include: {
                  Profile: true,
               },
            },
            Recipient: {
               include: {
                  Profile: true,
               },
            },
            createdAt: true,
            status: true,
         },
      })
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
