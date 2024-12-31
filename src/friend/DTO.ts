import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

export class SendFriendRequestDTO {
   @IsNotEmpty()
   @IsNumber()
   senderId: number

   @IsNotEmpty()
   @IsNumber()
   recipientId: number
}

export class FriendRequestActionDTO {
   @IsNumber()
   @IsNotEmpty()
   friendRequestId: number

   @IsNotEmpty()
   @IsNumber()
   senderId: number

   @IsNotEmpty()
   @IsNumber()
   recipientId: number
}

export class GetFriendRequestsDTO {
   @IsNotEmpty()
   @IsNumber()
   userId: number

   @IsNotEmpty()
   @IsNumber()
   limit: number

   @IsOptional()
   @IsNumber()
   lastFriendRequestId?: number
}
