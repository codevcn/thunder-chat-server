import { Module } from '@nestjs/common'
import { ChattingService } from './chatting.service'
import { FriendService } from '@/friend/friend.service'
import { MessageService } from '@/message/messages.service'
import { UserModule } from '@/user/user.module'

@Module({
   imports: [UserModule],
   providers: [ChattingService, FriendService, MessageService],
})
export class ChattingModule {}
