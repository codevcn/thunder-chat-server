import { ToBoolean } from '@/utils/validation/transformers'
import { Type } from 'class-transformer'
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsUUID } from 'class-validator'

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

export class TypingDTO {
   @IsNumber()
   @IsNotEmpty()
   receiverId: number

   @IsNotEmpty()
   @IsBoolean()
   @ToBoolean()
   isTyping: boolean
}
