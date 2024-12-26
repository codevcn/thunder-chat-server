import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ChattingPayloadDTO {
   @IsNumber()
   @IsNotEmpty()
   receiverId: number

   @IsNotEmpty()
   message: string

   @IsNumber()
   @IsNotEmpty()
   conversationId: number
}
