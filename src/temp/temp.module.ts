import { Module } from '@nestjs/common'
import { TempController } from './temp.controller'
import { MessageService } from '@/message/messages.service'

@Module({
   controllers: [TempController],
   providers: [MessageService],
})
export class TempModule {}
