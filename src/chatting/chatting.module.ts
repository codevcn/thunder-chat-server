import { Module } from '@nestjs/common'
import { ChattingService } from './chatting.service'
import { JWTService } from '@/auth/jwt.service'
import { FriendService } from '@/friend/friend.service'
import { MessageService } from '@/message/messages.service'
import { UserService } from '@/user/user.service'

@Module({
   providers: [ChattingService, JWTService, FriendService, MessageService, UserService],
})
export class ChattingModule {}
