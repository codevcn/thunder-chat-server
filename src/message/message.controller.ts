import { MessageService } from '@/message/messages.service'
import { ERoutes } from '@/utils/enums'
import { Controller, Get, Param } from '@nestjs/common'
import { IMessageController } from './interfaces'

@Controller(ERoutes.MESSAGE)
export class MessageController implements IMessageController {
   constructor(private messageService: MessageService) {}

   @Get('messages/:directChatId')
   async fetchMessages(@Param('directChatId') directChatId: string) {
      return await this.messageService.findMessagesByDirectChatId(parseInt(directChatId, 10))
   }
}
