import { Module } from '@nestjs/common'
import { AppGateway } from './gateway'
import { FriendService } from '@/friend/friend.service'
import { UserModule } from '@/user/user.module'
import { SocketModule } from './socket.module'
import { MessageModule } from '@/message/message.module'

@Module({
   imports: [UserModule, SocketModule, MessageModule],
   providers: [AppGateway, FriendService],
})
export class GatewayModule {}
