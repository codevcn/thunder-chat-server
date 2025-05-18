import { Module } from '@nestjs/common'
import { TempController } from './temp.controller'
import { MessageService } from '@/message/messages.service'
import { ElasticsearchModule } from '@/configs/elasticsearch/elasticsearch.module'

@Module({
   imports: [ElasticsearchModule],
   controllers: [TempController],
   providers: [MessageService],
})
export class TempModule {}
