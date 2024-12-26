import { ValidationError, ValidationPipe } from '@nestjs/common'
import { EValidationMessages } from './enums'
import { BaseWsException } from './chatting.exception'

export const wsValidationPipe = new ValidationPipe({
   transform: true,
   exceptionFactory: (errors: ValidationError[]) => {
      console.error('>>> DTO validation errors:', errors)
      return new BaseWsException(EValidationMessages.INVALID_INPUT)
   },
})
