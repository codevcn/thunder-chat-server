import { Body, Controller, Get, Param, ParseEnumPipe, Post } from '@nestjs/common'
import { FriendService } from './friend.service'
import { FriendRequestActionDTO, GetFriendRequestsDTO, SendFriendRequestDTO } from './DTO'
import type { IFriendController } from './interface'
import { ERoutes } from '@/utils/enums'
import type { TSuccess } from '@/utils/types'
import { EFriendRequestStatus } from './enums'

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

   @Post('friend-request-action/:action')
   async friendRequestAction(
      @Body()
      friendRequestActionPayload: FriendRequestActionDTO,
      @Param('action', new ParseEnumPipe(EFriendRequestStatus))
      action: EFriendRequestStatus
   ) {
      await this.friendService.friendRequestAction(friendRequestActionPayload, action)
      return { success: true }
   }

   @Get('get-friend-requests')
   async getFriendRequests(@Body() getFriendRequestsPayload: GetFriendRequestsDTO) {
      return await this.friendService.getFriendRequests(getFriendRequestsPayload)
   }
}
