import { Controller, Get } from '@nestjs/common'
import type { IHealthcheckController } from './interfaces'
import { HealthcheckService } from './healthcheck.service'
import { ERoutes } from '@/utils/enums'

@Controller(ERoutes.HEALTHCHECK)
export class HealthcheckController implements IHealthcheckController {
   constructor(private healthcheckService: HealthcheckService) {}

   @Get()
   async explainQueryGetMessagesIndexed() {
      return await this.healthcheckService.explainQueryGetMessagesIndexed()
   }
}
