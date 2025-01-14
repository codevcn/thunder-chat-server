import { Type } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { EFriendRequestStatus } from './enums'

export class SendFriendRequestDTO {
   @IsNotEmpty()
   @IsNumber()
   @Type(() => Number)
   senderId: number

   @IsNotEmpty()
   @IsNumber()
   @Type(() => Number)
   recipientId: number
}

export class FriendRequestActionDTO {
   @IsNumber()
   @IsNotEmpty()
   @Type(() => Number)
   friendRequestId: number

   @IsEnum(EFriendRequestStatus)
   @IsNotEmpty()
   action: EFriendRequestStatus
}

export class GetFriendRequestsDTO {
   @IsNotEmpty()
   @IsNumber()
   @Type(() => Number)
   userId: number

   @IsNotEmpty()
   @IsNumber()
   @Type(() => Number)
   limit: number

   @IsOptional()
   @IsNumber()
   @Type(() => Number)
   lastFriendRequestId?: number
}

export class GetFriendsDTO {
   @IsNotEmpty()
   @IsNumber()
   @Type(() => Number)
   userId: number

   @IsNotEmpty()
   @IsNumber()
   @Type(() => Number)
   limit: number

   @IsOptional()
   @IsNumber()
   @Type(() => Number)
   lastFriendId?: number
}
