import { HttpException, HttpStatus } from '@nestjs/common'

// for exceptions by user such as wrong password, wrong credentials, ...
export class ByUserException extends HttpException {
   constructor(response: string, status: HttpStatus) {
      super(response, status)
      this.name = 'User Exception'
   }
}
