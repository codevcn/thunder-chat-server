import { Type } from 'class-transformer'
import { IsDate, IsNotEmpty, IsNumber, IsUUID } from 'class-validator'

export class ChattingPayloadDTO {
   @IsNumber()
   @IsNotEmpty()
   receiverId: number

   @IsNotEmpty()
   message: string

   @IsNumber()
   @IsNotEmpty()
   @Type(() => Number)
   directChatId: number

   @IsNotEmpty()
   @IsUUID()
   token: string

   @IsNotEmpty()
   @IsDate()
   @Type(() => Date)
   timestamp: Date
}

export class MarkAsSeenDTO {
   @IsNumber()
   @IsNotEmpty()
   messageId: number
   
   @IsNumber()
   @IsNotEmpty()
   receiverId: number
}
