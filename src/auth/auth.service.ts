import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '@/user/user.service'
import { JWTService } from './jwt.service'
import { CredentialService } from './credential.service'
import { Response } from 'express'
import type { TLoginUserParams } from './types'
import { EAuthMessages } from './messages'

@Injectable()
export class AuthService {
   constructor(
      private jwtService: JWTService,
      private userService: UserService,
      private credentialService: CredentialService
   ) {}

   async loginUser(res: Response, { email, password }: TLoginUserParams): Promise<void> {
      const user = await this.userService.getUserByEmail(email)

      const isMatch = await this.credentialService.compareHashedPassword(password, user.password)
      if (!isMatch) {
         throw new UnauthorizedException(EAuthMessages.INCORRECT_EMAIL_PASSWORD)
      }

      const { jwt_token } = await this.jwtService.createJWT({
         email: user.email,
         user_id: user.id,
      })

      await this.jwtService.sendJWT({
         response: res,
         token: jwt_token,
      })
   }

   async logoutUser(res: Response): Promise<void> {
      await this.jwtService.removeJWT({ response: res })
   }
}
