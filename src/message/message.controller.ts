import { MessageService } from '@/message/messages.service'
import { ERoutes } from '@/utils/enums'
import { Controller, Get, Param } from '@nestjs/common'
import { IMessageController } from './interfaces'

@Controller(ERoutes.MESSAGE)
export class MessageController implements IMessageController {
   constructor(private messageService: MessageService) {}

   @Get('messages/:conversationId')
   async fetchMessages(@Param('conversationId') conversationId: string) {
      return await this.messageService.findMessagesByConversationId(parseInt(conversationId, 10))
   }
}
