import { EProviderTokens } from '@/utils/enums'
import { Body, Controller, Get, Inject, Post } from '@nestjs/common'
import { PrismaService } from '@/configs/db/prisma.service'
import { MessageService } from '@/message/messages.service'
import { EMessageStatus } from '@/message/enums'

@Controller('temp')
export class TempController {
   constructor(
      @Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService,
      private messageService: MessageService 
   ) {}

   @Get('dl-all-msg')
   async deleteAllMessages() {
      await this.prismaService.directMessage.deleteMany()
   }

   @Post('all-msg')
   async getAllMessages(@Body() payload: any) {
      const { msgOffset, directChatId, limit, sortType } = payload
      await this.prismaService.directChat.update({
         where: { id: 1 },
         data: { lastSentMessageId: null },
      })
   }
}
