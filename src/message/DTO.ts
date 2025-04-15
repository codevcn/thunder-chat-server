import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { ESortTypes } from './enums'

export class GetDirectMsgsParamsDTO {
   @IsDate()
   @IsNotEmpty()
   @Type(() => Date)
   msgTime: Date

   @IsNumber()
   @IsNotEmpty()
   @Type(() => Number)
   directChatId: number

   @IsNumber()
   @IsNotEmpty()
   @Type(() => Number)
   limit: number

   @IsOptional()
   @IsEnum(ESortTypes)
   sortType?: ESortTypes
}
