import { UserService } from '@/user/user.service'
import type { TFriendRequest } from '@/utils/entities/friend.entity'
import { EGatewayInternalEvents, EProviderTokens } from '@/utils/enums'
import { PrismaService } from '@/utils/ORM/prisma.service'
import type { TSignatureObject } from '@/utils/types'
import { Inject, Injectable, BadRequestException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { countMutualFriends } from '@prisma/client/sql'
import { EFriendRequestStatus } from './enums'
import { FriendRequestActionDTO, GetFriendRequestsDTO, GetFriendsDTO } from './DTO'
import { EFriendMessages } from './messages'
import type { TGetFriendRequestsData, TGetFriendsData } from './types'

@Injectable()
export class FriendService {
   constructor(
      @Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService,
      private userService: UserService,
      private eventEmitter: EventEmitter2
   ) {}

   async isFriend(userId: number, personId: number): Promise<boolean> {
      const isFriend = await this.prismaService.friend.findFirst({
         where: { senderId: userId, recipientId: personId },
      })
      if (!isFriend) {
         return false
      }
      return true
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

   async findFriendRequestWithStatus(
      senderId: number,
      recipientId: number,
      status: EFriendRequestStatus
   ): Promise<TFriendRequest | null> {
      return await this.prismaService.friendRequest.findFirst({
         where: { senderId, recipientId, status },
      })
   }

   async sendFriendRequest(senderId: number, recipientId: number): Promise<void> {
      if (senderId === recipientId) {
         throw new BadRequestException(EFriendMessages.SEND_TO_MYSELF)
      }
      const existing = await this.findFriendRequestWithStatus(
         senderId,
         recipientId,
         EFriendRequestStatus.PENDING
      )
      if (existing) {
         throw new BadRequestException(EFriendMessages.INVITATION_SENT_BEFORE)
      }
      await this.create(senderId, recipientId)
      const sender = await this.userService.findUserWithProfileById(senderId)
      if (!sender) {
         throw new BadRequestException(EFriendMessages.SENDER_NOT_FOUND)
      }
      this.eventEmitter.emit(EGatewayInternalEvents.send_friend_request, sender, recipientId)
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
         orderBy: [{ id: 'asc' }, { createdAt: 'desc' }],
         select: {
            id: true,
            Sender: {
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
      const { limit, userId, lastFriendRequestId } = getFriendsPayload
      let cursor: TSignatureObject = {}
      if (lastFriendRequestId) {
         cursor = {
            skip: 1,
            cursor: {
               id: lastFriendRequestId,
            },
         }
      }
      return await this.prismaService.friend.findMany({
         take: limit,
         ...cursor,
         where: {
            senderId: userId,
         },
         orderBy: [{ id: 'asc' }, { createdAt: 'desc' }],
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
