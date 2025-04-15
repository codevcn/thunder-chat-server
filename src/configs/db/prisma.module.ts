import { PrismaService } from '@/configs/db/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import { Global, Module, Provider } from '@nestjs/common'

const prisma_provider: Provider = {
   provide: EProviderTokens.PRISMA_CLIENT,
   useClass: PrismaService,
}

@Global()
@Module({
   providers: [prisma_provider],
   exports: [prisma_provider],
})
export class PrismaModule {}
