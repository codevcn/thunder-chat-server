import { MessageController } from '@/message/message.controller'
import { MessageService } from '@/message/messages.service'
import { UserModule } from '@/user/user.module'
import { Module } from '@nestjs/common'

@Module({
   imports: [UserModule],
   providers: [MessageService],
   controllers: [MessageController],
   exports: [MessageService],
})
export class MessageModule {}
