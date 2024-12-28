import { IsNotEmpty, IsNumber } from 'class-validator'

export class SendFriendRequestDTO {
   @IsNotEmpty()
   @IsNumber()
   senderId: number

   @IsNotEmpty()
   @IsNumber()
   recipientId: number
}
