import { PrismaService } from '@/configs/db/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import { Inject, Injectable } from '@nestjs/common'
import { explainStatement } from '@prisma/client/sql'

@Injectable()
export class HealthcheckService {
   constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService) {}

   async explainQueryGetMessagesIndexed() {
      // const res = await this.prismaService.$queryRawTyped(explainStatement())
      // console.log('>>> res of explain query:', res)
   }
}
