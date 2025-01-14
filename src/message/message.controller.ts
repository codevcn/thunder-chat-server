import { MessageService } from '@/message/messages.service'
import { ERoutes } from '@/utils/enums'
import { Controller, Get, Query } from '@nestjs/common'
import { IMessageController } from './interfaces'
import { GetDirectMsgsParamsDTO } from './DTO'

@Controller(ERoutes.MESSAGE)
export class MessageController implements IMessageController {
   constructor(private messageService: MessageService) {}

   @Get('get-direct-messages')
   async fetchMessages(@Query() params: GetDirectMsgsParamsDTO) {
      const { directChatId, msgTime, limit, sortType } = params
      return await this.messageService.getDirectMessages(msgTime, directChatId, limit, sortType)
   }
}
