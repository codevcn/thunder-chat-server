import { EProviderTokens } from '@/utils/enums'
import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { PrismaService } from '@/configs/db/prisma.service'
import { MessageService } from '@/message/messages.service'
import { ElasticsearchService } from '@/configs/elasticsearch/elasticsearch.service'
import { parseTxtFileToObject } from './helpers'

@Controller('temp')
export class TempController {
   constructor(
      @Inject(EProviderTokens.PRISMA_CLIENT) private PrismaService: PrismaService,
      private messageService: MessageService,
      private elasticsearchService: ElasticsearchService
   ) {}

   @Get('dl-all-msg')
   async deleteAllMessages() {
      await this.PrismaService.directMessage.deleteMany()
   }

   @Post('all-msg')
   async getAllMessages(@Body() payload: any) {
      const { msgOffset, directChatId, limit, sortType } = payload
      const res = await this.messageService.getOlderDirectMessagesHandler(
         msgOffset,
         directChatId,
         limit,
         false,
         sortType
      )
      console.log('>>> res:', res)
   }

   @Get('todo')
   async todo(@Query() query: any) {
      // sync users to elasticsearch
      const obj = await parseTxtFileToObject('./temp.txt')
      const { key: objKey } = obj
      const { key: queryKey } = query
      if (!objKey || !queryKey || queryKey !== objKey) {
         return
      }
      const users = await this.PrismaService.user.findMany({ include: { Profile: true } })
      for (const user of users) {
         console.log('>>> user:', user)
         await this.elasticsearchService.createUser(user.id, {
            user_id: user.id,
            full_name: user.Profile?.fullName,
            avatar: user.Profile?.avatar || undefined,
            email: user.email,
         })
         console.log('>>> run this create new doc successfully')
      }
   }
}
