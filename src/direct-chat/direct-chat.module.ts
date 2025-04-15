import { DirectChatController } from '@/direct-chat/direct-chat.controller'
import { DirectChatService } from './direct-chat.service'
import { Module } from '@nestjs/common'
import { JWTService } from '@/auth/jwt.service'
import { UserService } from '@/user/user.service'
import { CredentialService } from '@/auth/credential.service'

@Module({
   imports: [],
   controllers: [DirectChatController],
   providers: [DirectChatService, JWTService, UserService, CredentialService],
})
export class DirectChatsModule {}
