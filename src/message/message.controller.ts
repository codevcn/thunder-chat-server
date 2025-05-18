import { MessageService } from '@/message/messages.service'
import { ERoutes } from '@/utils/enums'
import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { IMessageController } from './interfaces'
import { FetchMsgsParamsDTO } from './DTO'
import { AuthGuard } from '@/auth/auth.guard'

@Controller(ERoutes.MESSAGE)
@UseGuards(AuthGuard)
export class MessageController implements IMessageController {
   constructor(private messageService: MessageService) {}

   @Get('get-direct-messages')
   async fetchMessages(@Query() params: FetchMsgsParamsDTO) {
      const { directChatId, msgOffset, limit, sortType, isFirstTime } = params
      return await this.messageService.getOlderDirectMessagesHandler(
         msgOffset,
         directChatId,
         limit,
         isFirstTime,
         sortType
      )
   }
}
