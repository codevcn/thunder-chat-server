import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '@/user/user.service'
import { JWTService } from './jwt.service'
import { CredentialService } from './credential.service'
import { Response } from 'express'
import type { TLoginUserParams } from './types'
import { Server } from 'socket.io'
import { EClientCookieNames } from '@/utils/enums'
import type { TClientCookie } from '@/utils/types'
import * as cookie from 'cookie'
import { EAuthMessages } from '@/auth/messages'
import { BaseWsException } from '@/utils/exceptions/base-ws.exception'
import { EValidationMessages } from '@/utils/validation/messages'
import { ClientSocketAuthDTO } from './DTO'
import type { TClientSocket } from '@/gateway/types'
import { plainToInstance } from 'class-transformer'
import { validate, validateSync } from 'class-validator'

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

   async validateSocketConnection(server: Server): Promise<void> {
      server.use(async (socket, next) => {
         const clientCookie = socket.handshake.headers.cookie
         if (!clientCookie) {
            next(new Error(EAuthMessages.INVALID_CREDENTIALS))
            return
         }
         const parsed_cookie = cookie.parse(clientCookie) as TClientCookie
         const jwt = parsed_cookie[EClientCookieNames.JWT_TOKEN_AUTH]
         try {
            await this.jwtService.verifyToken(jwt)
         } catch (error) {
            next(new Error(EAuthMessages.AUTHENTICATION_FAILED))
            return
         }
         next()
      })
   }

   async validateSocketAuth(clientSocket: TClientSocket): Promise<ClientSocketAuthDTO> {
      const socketAuth = plainToInstance(ClientSocketAuthDTO, clientSocket.handshake.auth)
      const errors = await validate(socketAuth)
      if (errors && errors.length > 0) {
         throw new BaseWsException(EValidationMessages.INVALID_INPUT)
      }
      return socketAuth
   }

   validateSocketAuthSync(clientSocket: TClientSocket): ClientSocketAuthDTO {
      const socketAuth = plainToInstance(ClientSocketAuthDTO, clientSocket.handshake.auth)
      const errors = validateSync(socketAuth)
      if (errors && errors.length > 0) {
         throw new BaseWsException(EValidationMessages.INVALID_INPUT)
      }
      return socketAuth
   }
}
