import { HttpStatus } from '@nestjs/common'

export type TWsErrorResponse = {
   isError: boolean
   message: string
   httpStatus: HttpStatus
}
