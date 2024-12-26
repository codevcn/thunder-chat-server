import { ChattingGateway } from '@/chatting/chatting.gateway'
import { Module } from '@nestjs/common'
import { ChattingService } from './chatting.service'
import { JWTService } from '@/auth/jwt.service'
import { FriendService } from '@/friend/friend.service'
import { MessageService } from '@/message/messages.service'

@Module({
   providers: [ChattingGateway, ChattingService, JWTService, FriendService, MessageService],
})
export class ChattingModule {}
