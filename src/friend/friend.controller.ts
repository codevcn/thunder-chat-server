import { Controller, Get, Query } from '@nestjs/common'
import { FriendService } from './friend.service'
import { GetFriendsDTO } from './DTO'
import type { IFriendController } from './interface'
import { ERoutes } from '@/utils/enums'

@Controller(ERoutes.FRIEND)
export class FriendController implements IFriendController {
   constructor(private friendService: FriendService) {}

   @Get('get-friends')
   async getFriends(@Query() getFriendsPayload: GetFriendsDTO) {
      return await this.friendService.getFriends(getFriendsPayload)
   }
}
