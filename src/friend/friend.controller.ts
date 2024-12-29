import { Body, Controller, Post } from '@nestjs/common'
import { FriendService } from './friend.service'
import { SendFriendRequestDTO } from './DTO'
import type { IFriendController } from './interface'
import { ERoutes } from '@/utils/enums'
import { TSuccess } from '@/utils/types'

@Controller(ERoutes.FRIEND)
export class FriendController implements IFriendController {
   constructor(private friendService: FriendService) {}

   @Post('send-friend-request')
   async sendFriendRequest(
      @Body() sendFriendRequestPayload: SendFriendRequestDTO
   ): Promise<TSuccess> {
      const { recipientId, senderId } = sendFriendRequestPayload
      console.log('>>> stuff:', sendFriendRequestPayload)
      await this.friendService.sendFriendRequest(senderId, recipientId)
      return { success: true }
   }
}
