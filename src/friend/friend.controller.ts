import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { FriendService } from './friend.service'
import {
   FriendRequestActionDTO,
   GetFriendRequestsDTO,
   GetFriendsDTO,
   SendFriendRequestDTO,
} from './DTO'
import type { IFriendController } from './interface'
import { ERoutes } from '@/utils/enums'
import type { TSuccess } from '@/utils/types'

@Controller(ERoutes.FRIEND)
export class FriendController implements IFriendController {
   constructor(private friendService: FriendService) {}

   @Post('send-friend-request')
   async sendFriendRequest(
      @Body() sendFriendRequestPayload: SendFriendRequestDTO
   ): Promise<TSuccess> {
      const { recipientId, senderId } = sendFriendRequestPayload
      await this.friendService.sendFriendRequest(senderId, recipientId)
      return { success: true }
   }

   @Post('friend-request-action')
   async friendRequestAction(@Body() friendRequestActionPayload: FriendRequestActionDTO) {
      await this.friendService.friendRequestAction(friendRequestActionPayload)
      return { success: true }
   }

   @Get('get-friend-requests')
   async getFriendRequests(@Query() getFriendRequestsPayload: GetFriendRequestsDTO) {
      return await this.friendService.getFriendRequests(getFriendRequestsPayload)
   }

   @Get('get-friends')
   async getFriends(@Query() getFriendsPayload: GetFriendsDTO) {
      return await this.friendService.getFriends(getFriendsPayload)
   }
}
