import { Injectable } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { EClientCookieNames } from '@/utils/enums'
import { TClientCookie } from '@/utils/types'
import * as cookie from 'cookie'
import { JwtService } from '@nestjs/jwt'
import type { TClientAuth } from './types'
import { EAuthMessages } from '@/auth/messages'
import { BaseWsException } from './chatting.exception'

@Injectable()
export class ChattingService {
   constructor(private jwtService: JwtService) {}

   validateConnection(server: Server): void {
      server.use(async (socket, next) => {
         const clientCookie = socket.handshake.headers.cookie
         if (!clientCookie) {
            next(new Error(EAuthMessages.INVALID_CREDENTIALS))
            return
         }

         const parsed_cookie = cookie.parse(clientCookie) as TClientCookie
         const jwt = parsed_cookie[EClientCookieNames.JWT_TOKEN_AUTH]

         try {
            await this.jwtService.verifyAsync(jwt, {
               secret: process.env.JWT_SECRET,
            })
         } catch (error) {
            next(new Error(EAuthMessages.AUTHENTICATION_FAILED))
            return
         }

         next()
      })
   }

   validateAuthOfClient(client: Socket): TClientAuth {
      const { clientId } = client.handshake.auth
      if (!clientId) {
         throw new BaseWsException(EAuthMessages.INVALID_CREDENTIALS)
      }
      return { clientId }
   }
}
