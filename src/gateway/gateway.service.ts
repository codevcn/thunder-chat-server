import { Injectable } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { EClientCookieNames } from '@/utils/enums'
import type { TClientCookie } from '@/utils/types'
import * as cookie from 'cookie'
import { JwtService } from '@nestjs/jwt'
import { EAuthMessages } from '@/auth/messages'
import { BaseWsException } from '../utils/exceptions/base-ws.exception'
import type { TClientAuth } from './types'

@Injectable()
export class GatewayService {
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
