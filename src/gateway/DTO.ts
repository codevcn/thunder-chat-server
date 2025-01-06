import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ChattingPayloadDTO {
   @IsNumber()
   @IsNotEmpty()
   receiverId: number

   @IsNotEmpty()
   message: string

   @IsNumber()
   @IsNotEmpty()
   @Type(() => Number)
   conversationId: number

   @IsNotEmpty()
   @IsString()
   token: string
}
