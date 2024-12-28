import { Module } from '@nestjs/common'
import { AppGateway } from './gateway'
import { FriendService } from '@/friend/friend.service'
import { ChattingService } from '@/chatting/chatting.service'
import { MessageService } from '@/message/messages.service'
import { UserService } from '@/user/user.service'

@Module({
   providers: [AppGateway, FriendService, ChattingService, MessageService, UserService],
})
export class GatewayModule {}
