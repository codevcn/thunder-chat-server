import type { TUserId } from '@/gateway/types'
import type { TUser } from '@/utils/entities/user.entity'
import { Exclude, Type } from 'class-transformer'
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

export class LoginUserDTO {
   @IsNotEmpty()
   email: string

   @IsNotEmpty()
   password: string
}

export class CheckAuthDataDTO implements TUser {
   id: number
   createdAt: Date
   email: string
   username: string | null

   @Exclude()
   password: string

   constructor(user: TUser) {
      Object.assign(this, user)
   }
}

export class ClientSocketAuthDTO {
   @IsNumber()
   @Type(() => Number)
   clientId: TUserId

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
