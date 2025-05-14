import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { FriendRequestActionDTO, GetFriendRequestsDTO, SendFriendRequestDTO } from './DTO'
import { FriendRequestService } from './friend-request.service'
import type { IFriendRequestController } from './interface'
import { ERoutes } from '@/utils/enums'

@Controller(ERoutes.FRIEND_REQUEST)
export class FriendRequestController implements IFriendRequestController {
   constructor(private friendRequestService: FriendRequestService) {}

   @Post('send-friend-request')
   async sendFriendRequest(@Body() sendFriendRequestPayload: SendFriendRequestDTO) {
      const { recipientId, senderId } = sendFriendRequestPayload
      return await this.friendRequestService.sendFriendRequest(senderId, recipientId)
   }

   @Post('friend-request-action')
   async friendRequestAction(@Body() friendRequestActionPayload: FriendRequestActionDTO) {
      await this.friendRequestService.friendRequestAction(friendRequestActionPayload)
      return { success: true }
   }

   @Get('get-friend-requests')
   async getFriendRequests(@Query() getFriendRequestsPayload: GetFriendRequestsDTO) {
      return await this.friendRequestService.getFriendRequests(getFriendRequestsPayload)
   }
}
