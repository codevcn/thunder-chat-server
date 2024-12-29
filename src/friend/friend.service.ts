import { BaseWsException } from '@/chatting/chatting.exception'
import { EChattingMessags } from '@/chatting/messages'
import { UserService } from '@/user/user.service'
import type { TFriendRequest } from '@/utils/entities/friend.entity'
import { EGatewayInternalEvents, EProviderTokens } from '@/utils/enums'
import { PrismaService } from '@/utils/ORM/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { countMutualFriends } from '@prisma/client/sql'

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

   async findFriendRequest(senderId: number, recipientId: number): Promise<TFriendRequest | null> {
      return await this.prismaService.friendRequest.findFirst({ where: { senderId, recipientId } })
   }

   async sendFriendRequest(senderId: number, recipientId: number): Promise<TFriendRequest> {
      const existing = await this.findFriendRequest(senderId, recipientId)
      if (existing) {
         return existing
      }
      const friendRequest = await this.prismaService.friendRequest.upsert({
         where: {
            id: 1,
            AND: [{ recipientId }, { senderId }],
         },
         update: {},
         create: {
            status: 'PENDING',
            recipientId,
            senderId,
         },
      })
      const sender = await this.userService.findUserWithProfileById(senderId)
      if (!sender) {
         throw new BaseWsException(EChattingMessags.RECIPIENT_NOT_FOUND)
      }
      const numOfMutualFriends = await this.countMutualFriend(recipientId, senderId)
      this.eventEmitter.emit(
         EGatewayInternalEvents.send_friend_request,
         sender,
         recipientId,
         numOfMutualFriends
      )
      return friendRequest
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
}
