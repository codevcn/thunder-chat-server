import { Body, Controller, Post } from '@nestjs/common'
import { FriendService } from './friend.service'
import type { TFriendRequest } from '@/utils/entities/friend.entity'
import { SendFriendRequestDTO } from './DTO'
import type { IFriendController } from './interface'
import { ERoutes } from '@/utils/enums'

@Controller(ERoutes.FRIEND)
export class FriendController {
   constructor(private friendService: FriendService) {}

   @Post('send-friend-request')
   async sendFriendRequest(
      @Body() sendFriendRequestPayload: SendFriendRequestDTO
   ): Promise<number> {
      const { recipientId, senderId } = sendFriendRequestPayload
      console.log('>>> stuff:', sendFriendRequestPayload)
      // return await this.friendService.sendFriendRequest(senderId, recipientId)
      await this.friendService.countMutualFriend(recipientId, senderId)
      return 111
   }
}
