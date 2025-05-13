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

   async create(senderId: number, recipientId: number): Promise<TFriendRequest> {
      return await this.prismaService.friendRequest.create({
         data: {
            status: 'PENDING',
            recipientId,
            senderId,
         },
      })
   }

   async update(
      requestId: number,
      senderId: number,
      recipientId: number,
      status: EFriendRequestStatus
   ): Promise<TFriendRequest> {
      return await this.prismaService.friendRequest.update({
         where: {
            id: requestId,
         },
         data: {
            status,
            senderId,
            recipientId,
            updatedAt: new Date(),
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
      const relatedUsers = [senderId, recipientId]
      return await this.prismaService.friendRequest.findFirst({
         where: {
            senderId: { in: relatedUsers },
            recipientId: { in: relatedUsers },
         },
      })
   }

   async sendFriendRequest(senderId: number, recipientId: number): Promise<void> {
      if (senderId === recipientId) {
         throw new BadRequestException(EFriendMessages.SEND_TO_MYSELF)
      }
      const existing = await this.findSentFriendRequest(senderId, recipientId)
      if (existing) {
         if (
            existing.status === EFriendRequestStatus.PENDING ||
            existing.status === EFriendRequestStatus.ACCEPTED
         ) {
            throw new BadRequestException(EFriendMessages.INVITATION_SENT_BEFORE)
         }
         await this.update(existing.id, senderId, recipientId, EFriendRequestStatus.PENDING)
      }
      await this.create(senderId, recipientId)
      const sender = await this.userService.findUserWithProfileById(senderId)
      if (!sender) {
         throw new BadRequestException(EFriendMessages.SENDER_NOT_FOUND)
      }
      await this.socketService.sendFriendRequest(sender, recipientId)
   }

   /**
    * Count how many mutual friends the user have with a friend
    * @param userId who is "the user" want to check number of mutual friends
    * @param friendId who is "the opponent" for "the user" to check
    * @returns number of mutual friends between "the user" and "the opponent"
    */
   async countMutualFriend(userId: number, friendId: number): Promise<number> {
      const res = await this.prismaService.$queryRawTyped(countMutualFriends(userId, friendId))
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
         orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
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
