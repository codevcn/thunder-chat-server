import { HttpException, HttpStatus } from '@nestjs/common'

export class BaseHttpException extends HttpException {
   isUserError: boolean

   constructor(message: string, status: HttpStatus, isUserError: boolean = false) {
      super(message, status)
      if (isUserError) {
         this.isUserError = isUserError
         this.name = 'User Exception'
      }
   }
}
