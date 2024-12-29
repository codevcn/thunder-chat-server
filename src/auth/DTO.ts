import { TUser } from '@/utils/entities/user.entity'
import { Exclude } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

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
