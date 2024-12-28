import { BaseWsException } from '@/chatting/chatting.exception'
import { EChattingMessags } from '@/chatting/messages'
import { UserService } from '@/user/user.service'
import type { TFriendRequest } from '@/utils/entities/friend.entity'
import { EEmitterEvents, EProviderTokens } from '@/utils/enums'
import { PrismaService } from '@/utils/ORM/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import type { EventEmitter2 } from '@nestjs/event-emitter'
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

   async sendFriendRequest(senderId: number, recipientId: number): Promise<TFriendRequest> {
      const friendRequest = await this.prismaService.friendRequest.create({
         data: {
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
         EEmitterEvents.app_gateway_send_friend_request,
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
      console.log('>>> res:', res)
      return 11
   }
}
