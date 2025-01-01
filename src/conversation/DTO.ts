import { IsEmail, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class SearchConversationDTO {
   @IsEmail()
   @IsOptional()
   email: string

   @IsOptional()
   username: string

   @IsOptional()
   nameOfUser: string
}

export class CreateConversationDTO {
   @IsNotEmpty()
   @IsNumber()
   @Type(() => Number)
   recipientId: number
}

export class FetchConversationDTO {
   @IsNotEmpty()
   @IsNumber()
   @Type(() => Number)
   conversationId: number
}
