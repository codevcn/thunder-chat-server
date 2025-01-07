import {
   ConnectedSocket,
   MessageBody,
   SubscribeMessage,
   WebSocketGateway,
} from '@nestjs/websockets'
import type { OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { EClientSocketEvents, EInitEvents } from './events'
import { ESocketNamespaces } from './enums'
import { HttpStatus, UseFilters, UseGuards, UsePipes } from '@nestjs/common'
import { FriendService } from '@/friend/friend.service'
import { BaseWsException } from '../utils/exceptions/base-ws.exception'
import { EFriendMessages } from '@/friend/messages'
import {
   CatchSocketErrors,
   BaseWsExceptionsFilter,
} from '@/utils/exceptions/base-ws-exception.filter'
import { MessageService } from '@/message/messages.service'
import type { TClientAuth, TClientSocket } from './types'
import type { IEmitSocketEvents, IGateway } from './interfaces'
import { wsValidationPipe } from './validation'
import { SocketService } from './socket.service'
import { ChattingPayloadDTO } from './DTO'
import { JwtService } from '@nestjs/jwt'
import type { TNewDirectMessage } from '@/message/types'
import { ClientSocketAuthGuard } from './gateway.guard'
import { EMsgMessages } from '@/message/messages'
import { AuthService } from '@/auth/auth.service'

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
      private authService: AuthService
   ) {}

   afterInit(server: Server): void {
      this.authService.validateSocketConnection(server)
      this.socketService.setServer(server)
   }

   async handleConnection(clientSocket: TClientSocket): Promise<void> {
      console.log('>>> connected socket:', {
         socketId: clientSocket.id,
         auth: clientSocket.handshake.auth,
      })
      const { clientId, messageOffset, directChatId, groupId } =
         await this.authService.validateSocketAuth(clientSocket)
      if (clientId) {
         this.socketService.addClientSession(clientId, clientSocket)
         clientSocket.emit(EInitEvents.client_connected, 'Connected Sucessfully!')
         if (messageOffset) {
            await this.recoverMissingMessages(clientSocket, messageOffset, directChatId, groupId)
         }
      } else {
         clientSocket.disconnect(true)
      }
   }

   async handleDisconnect(client: TClientSocket): Promise<void> {
      console.log('>>> discnn socket:', {
         socketId: client.id,
         auth: client.handshake.auth,
      })
      const { clientId } = client.handshake.auth
      if (clientId) {
         this.socketService.removeClientSession(clientId)
         this.messageService.removeToken(clientId)
      }
   }

   async recoverMissingMessages(
      clientSocket: TClientSocket,
      messageOffset: Date,
      directChatId?: number,
      groupId?: number
   ): Promise<void> {
      if (directChatId) {
         const messages = await this.messageService.findDirectMessagesByOffset(
            messageOffset,
            directChatId
         )
         console.log('>>> recover messages:', messages)
         if (messages && messages.length > 0) {
            clientSocket.emit(
               EClientSocketEvents.recovered_connection,
               messages as TNewDirectMessage[]
            )
         }
      }
   }

   @SubscribeMessage(EClientSocketEvents.send_message_direct)
   @UseGuards(ClientSocketAuthGuard)
   @CatchSocketErrors()
   async handleChattingDirect(
      @MessageBody() payload: ChattingPayloadDTO,
      @ConnectedSocket() client: TClientSocket
   ) {
      const { clientId } = client.handshake.auth
      console.log('>>> stuff:', { ...payload, clientId })
      const { message, receiverId, token } = payload
      if (!this.messageService.isFirstMessage(clientId, token)) {
         throw new BaseWsException(EMsgMessages.MESSAGE_OVERLAPS)
      }
      const isFriend = await this.friendService.isFriend(clientId, receiverId)
      if (!isFriend) {
         throw new BaseWsException(EFriendMessages.IS_NOT_FRIEND, HttpStatus.BAD_REQUEST)
      }
      const { directChatId, timestamp } = payload
      const newMessage = await this.messageService.createNewMessage(
         message,
         clientId,
         timestamp,
         directChatId
      )
      const newMsgDirectPayload: TNewDirectMessage = {
         id: newMessage.id,
         authorId: clientId,
         content: message,
         directChatId,
         createdAt: newMessage.createdAt,
      }
      const recipientSocket = this.socketService.getClientSession<IEmitSocketEvents>(receiverId)
      if (recipientSocket) {
         recipientSocket.emit(EClientSocketEvents.send_message_direct, newMsgDirectPayload)
      }
      client.emit(EClientSocketEvents.send_message_direct, newMsgDirectPayload)
      return { success: true }
   }
}
