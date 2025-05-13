import { IsEmail, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class SearchDirectChatDTO {
   @IsEmail()
   @IsOptional()
   email: string

   @IsOptional()
   nameOfUser: string
}

export class CreateDirectChatDTO {
   @IsNotEmpty()
   @IsNumber()
   @Type(() => Number)
   recipientId: number
}

export class FetchDirectChatDTO {
   @IsNotEmpty()
   @IsNumber()
   @Type(() => Number)
   conversationId: number
}
