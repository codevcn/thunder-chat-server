import { MessageController } from '@/message/message.controller'
import { MessageService } from '@/message/messages.service'
import { Module } from '@nestjs/common'

@Module({
   providers: [MessageService],
   controllers: [MessageController],
   exports: [MessageService],
})
export class MessageModule {}
