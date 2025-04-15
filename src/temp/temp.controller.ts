import { EProviderTokens } from '@/utils/enums'
import { Controller, Get, Inject } from '@nestjs/common'
import { PrismaService } from '@/configs/db/prisma.service'

@Controller('temp')
export class TempController {
   constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService) {}

   @Get('dl-all-msg')
   async deleteAllMessages() {
      await this.prismaService.directMessage.deleteMany()
   }
}
