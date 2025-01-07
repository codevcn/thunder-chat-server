import { Type } from 'class-transformer'
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

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
   @IsString()
   token: string

   @IsNotEmpty()
   @IsDate()
   @Type(() => Date)
   timestamp: Date
}

export class ClientSocketAuthDTO {
   @IsNumber()
   @Type(() => Number)
   clientId: number

   @IsOptional()
   @IsDate()
   @Type(() => Date)
   messageOffset?: Date

   @IsOptional()
   @IsNumber()
   @Type(() => Number)
   directChatId?: number

   @IsOptional()
   @IsNumber()
   @Type(() => Number)
   groupId?: number
}
