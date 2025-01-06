import {
   ConnectedSocket,
   MessageBody,
   SubscribeMessage,
   WebSocketGateway,
} from '@nestjs/websockets'
import type { OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server } from 'socket.io'
import type { Socket } from 'socket.io'
import { EClientSocketEvents, EInitEvents } from './events'
import { EChattingMessages, ESocketNamespaces } from './enums'
import { HttpStatus, UseFilters, UsePipes } from '@nestjs/common'
import { FriendService } from '@/friend/friend.service'
import { BaseWsException } from '../utils/exceptions/base-ws.exception'
import { EFriendMessages } from '@/friend/messages'
import {
   CatchSocketErrors,
   BaseWsExceptionsFilter,
} from '@/utils/exceptions/base-ws-exception.filter'
import type { TSuccess } from '@/utils/types'
import { MessageService } from '@/message/messages.service'
import type { TClientAuth, TClientSocket } from './types'
import type { IEmitSocketEvents, IGateway } from './interfaces'
import { wsValidationPipe } from './validation'
import { SocketService } from './socket.service'
import { ChattingPayloadDTO } from './DTO'
import { EClientCookieNames } from '@/utils/enums'
import type { TClientCookie } from '@/utils/types'
import * as cookie from 'cookie'
import { EAuthMessages } from '@/auth/messages'
import { JwtService } from '@nestjs/jwt'
import type { TNewMessage1v1 } from '@/message/types'

@WebSocketGateway({
   cors: {
      origin:
         process.env.NODE_ENV === 'production'
            ? process.env.CLIENT_HOST
            : process.env.CLIENT_HOST_DEV,
      credentials: true,
   },
   namespace: ESocketNamespaces.app,
})
@UseFilters(new BaseWsExceptionsFilter())
@UsePipes(wsValidationPipe)
export class AppGateway
   implements
      OnGatewayConnection<TClientSocket>,
      OnGatewayDisconnect<TClientSocket>,
      OnGatewayInit<Server>,
      IGateway
{
   constructor(
      private socketService: SocketService,
      private friendService: FriendService,
      private messageService: MessageService,
      private jwtService: JwtService
   ) {}

   afterInit(server: Server) {
      this.validateConnection(server)
   }

   handleConnection(clientSocket: TClientSocket) {
      console.log('>>> connected socket:', {
         socketId: clientSocket.id,
         auth: clientSocket.handshake.auth,
      })
      const { clientId } = clientSocket.handshake.auth
      if (clientId) {
         this.socketService.addClientSession(clientId, clientSocket)
         clientSocket.emit(EInitEvents.client_connected, 'Connected Sucessfully!')
      } else {
         clientSocket.disconnect(true)
      }
   }

   handleDisconnect(client: TClientSocket): void {
      console.log('>>> discnn socket:', {
         socketId: client.id,
         auth: client.handshake.auth,
      })
      const { clientId } = client.handshake.auth
      this.socketService.removeClientSession(clientId)
   }

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
      this.socketService.setServer(server)
   }

   validateAuthOfClient(client: Socket): TClientAuth {
      const { clientId } = client.handshake.auth
      if (!clientId) {
         throw new BaseWsException(EAuthMessages.INVALID_CREDENTIALS)
      }
      return { clientId }
   }

   @SubscribeMessage(EClientSocketEvents.send_message_1v1)
   @CatchSocketErrors()
   async handleChatting1v1(
      @MessageBody() payload: ChattingPayloadDTO,
      @ConnectedSocket() client: Socket<IEmitSocketEvents>
   ) {
      const { clientId } = this.validateAuthOfClient(client)
      const { message, receiverId } = payload
      const isFriend = await this.friendService.isFriend(clientId, receiverId)
      if (!isFriend) {
         throw new BaseWsException(EFriendMessages.IS_NOT_FRIEND, HttpStatus.BAD_REQUEST)
      }
      const { conversationId, token } = payload
      const newMessage = await this.messageService.createNewMessageHandler(
         token,
         message,
         clientId,
         conversationId
      )
      const newMsg1v1Payload: TNewMessage1v1 = {
         id: newMessage.id,
         authorId: clientId,
         content: message,
         conversationId,
         createdAt: newMessage.createdAt,
      }
      const recipientSocket = this.socketService.getClientSession<IEmitSocketEvents>(receiverId)
      if (recipientSocket) {
         recipientSocket.emit(EClientSocketEvents.send_message_1v1, newMsg1v1Payload)
      }
      client.emit(EClientSocketEvents.send_message_1v1, newMsg1v1Payload)
      return { success: true }
   }
}
