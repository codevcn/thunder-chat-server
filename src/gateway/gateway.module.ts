import { Module } from '@nestjs/common'
import { AppGateway } from './gateway'
import { FriendService } from '@/friend/friend.service'
import { MessageService } from '@/message/messages.service'
import { UserModule } from '@/user/user.module'
import { GatewayService } from './gateway.service'

@Module({
   imports: [UserModule],
   providers: [AppGateway, FriendService, MessageService, GatewayService],
})
export class GatewayModule {}
