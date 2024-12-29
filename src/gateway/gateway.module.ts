import { Module } from '@nestjs/common'
import { AppGateway } from './gateway'
import { FriendService } from '@/friend/friend.service'
import { ChattingService } from '@/chatting/chatting.service'
import { MessageService } from '@/message/messages.service'
import { UserModule } from '@/user/user.module'

@Module({
   imports: [UserModule],
   providers: [AppGateway, FriendService, ChattingService, MessageService],
})
export class GatewayModule {}
