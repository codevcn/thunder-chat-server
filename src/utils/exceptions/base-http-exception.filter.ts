import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import type { Response } from 'express'
import type { THttpErrorResBody } from '@/utils/types'
import { EValidationMessages } from '../messages'
import { ByUserException } from '@/user/user.exception'

@Catch(HttpException)
export class BaseHttpExceptionFilter implements ExceptionFilter<HttpException> {
   catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp()
      const response = ctx.getResponse<Response<THttpErrorResBody>>()

      const formattedException = this.formatException(exception)

      response.status(formattedException.status).json({
         name: formattedException.name,
         message: formattedException.message,
         timestamp: new Date(),
         trace: formattedException.stack,
         isUserException: formattedException.isUserException,
      })
   }

   private formatException(exception: HttpException) {
      return {
         message: this.getExceptionMessage(exception.getResponse()),
         name: exception.name,
         stack: exception.stack || EValidationMessages.NO_TRACE,
         status: exception.getStatus(),
         isUserException: this.checkIsUserException(exception),
      }
   }

   private getExceptionMessage(exception_response: string | object) {
      if (typeof exception_response === 'object') {
         if ('message' in exception_response) {
            const message = exception_response.message

            if (Array.isArray(message)) {
               return message.join(', ')
            } else if (typeof message === 'string') {
               return message
            }

            return EValidationMessages.SOMETHING_WENT_WRONG
         }
         return EValidationMessages.SOMETHING_WENT_WRONG
      }
      return exception_response
   }

   private checkIsUserException(exception: HttpException) {
      return exception instanceof ByUserException
   }
}