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
import { HttpStatus, UseFilters, UsePipes } from '@nestjs/common'
import { FriendService } from '@/friend/friend.service'
import { BaseWsException } from '../utils/exceptions/base-ws.exception'
import { EFriendMessages } from '@/friend/messages'
import {
   CatchSocketErrors,
   BaseWsExceptionsFilter,
} from '@/utils/exceptions/base-ws-exception.filter'
import { MessageService } from '@/message/messages.service'
import type { TClientSocket } from './types'
import type { IEmitSocketEvents, IGateway } from './interfaces'
import { wsValidationPipe } from './validation'
import { SocketService } from './socket.service'
import { ChattingPayloadDTO, MarkAsSeenDTO, TypingDTO } from './DTO'
import type { TMessageOffset } from '@/message/types'
import { EMsgMessages } from '@/message/messages'
import { AuthService } from '@/auth/auth.service'
import { MessageTokensManager } from '@/gateway/message-tokens'
import { EMessageStatus } from '@/message/enums'
import { DirectChatService } from '@/direct-chat/direct-chat.service'
import { TDirectMessage } from '@/utils/entities/direct-message.entity'

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
   private readonly messageTokensManager = new MessageTokensManager()

   constructor(
      private socketService: SocketService,
      private friendService: FriendService,
      private messageService: MessageService,
      private authService: AuthService,
      private directChatService: DirectChatService
   ) {}

   afterInit(server: Server): void {
      this.authService.validateSocketConnection(server)
      this.socketService.setServer(server)
   }

   async handleConnection(client: TClientSocket): Promise<void> {
      console.log('>>> connected socket:', {
         socketId: client.id,
         auth: client.handshake.auth,
      })
      const { clientId, messageOffset, directChatId, groupId } =
         await this.authService.validateSocketAuth(client)
      if (clientId) {
         this.socketService.addConnectedClient(clientId, client)
         client.emit(EInitEvents.client_connected, 'Connected Sucessfully!')
         if (messageOffset) {
            await this.recoverMissingMessages(client, messageOffset, directChatId, groupId)
         }
      } else {
         client.disconnect(true)
      }
   }

   async handleDisconnect(client: TClientSocket): Promise<void> {
      console.log('>>> discnn socket:', {
         socketId: client.id,
         auth: client.handshake.auth,
      })
      const { clientId } = client.handshake.auth
      if (clientId) {
         this.socketService.removeConnectedClient(clientId)
         this.messageTokensManager.removeAllTokens(clientId)
      }
   }

   async recoverMissingMessages(
      clientSocket: TClientSocket,
      messageOffset: TMessageOffset,
      directChatId?: number,
      groupId?: number
   ): Promise<void> {
      if (directChatId) {
         const messages = await this.messageService.getNewerDirectMessages(
            messageOffset,
            directChatId
         )
         if (messages && messages.length > 0) {
            clientSocket.emit(
               EClientSocketEvents.recovered_connection,
               messages as TDirectMessage[]
            )
         }
      }
   }

   @SubscribeMessage(EClientSocketEvents.send_message_direct)
   @CatchSocketErrors()
   async handleDirectChatting(
      @MessageBody() payload: ChattingPayloadDTO,
      @ConnectedSocket() client: TClientSocket
   ) {
      const { clientId } = await this.authService.validateSocketAuth(client)
      const { message, receiverId, token } = payload
      if (!this.messageTokensManager.isUniqueToken(clientId, token)) {
         throw new BaseWsException(EMsgMessages.MESSAGE_OVERLAPS)
      }
      const isFriend = await this.friendService.isFriend(clientId, receiverId)
      if (!isFriend) {
         throw new BaseWsException(EFriendMessages.IS_NOT_FRIEND, HttpStatus.BAD_REQUEST)
      }
      const { directChatId, timestamp } = payload
      const newMessage = await this.messageService.createNewDirectMessage(
         message,
         clientId,
         timestamp,
         directChatId
      )
      await this.directChatService.addLastSentMessage(directChatId, newMessage.id)
      const recipientSocket = this.socketService.getConnectedClient<IEmitSocketEvents>(receiverId)
      if (recipientSocket) {
         recipientSocket.emit(EClientSocketEvents.send_message_direct, newMessage)
      }
      client.emit(EClientSocketEvents.send_message_direct, newMessage)
      return { success: true }
   }

   @SubscribeMessage(EClientSocketEvents.message_seen_direct)
   @CatchSocketErrors()
   async handleMarkAsSeenInDirectChat(
      @MessageBody() data: MarkAsSeenDTO,
      @ConnectedSocket() client: TClientSocket
   ) {
      const { messageId, receiverId } = data
      await this.messageService.updateMessageStatus(messageId, EMessageStatus.SEEN)
      const recipientSocket = this.socketService.getConnectedClient<IEmitSocketEvents>(receiverId)
      if (recipientSocket) {
         recipientSocket.emit(EClientSocketEvents.message_seen_direct, {
            messageId,
            status: EMessageStatus.SEEN,
         })
      }
   }

   @SubscribeMessage(EClientSocketEvents.typing_direct)
   @CatchSocketErrors()
   async handleTyping(@MessageBody() data: TypingDTO, @ConnectedSocket() client: TClientSocket) {
      console.log('>>> run this 168:', data)
      const { receiverId, isTyping } = data
      const recipientSocket = this.socketService.getConnectedClient<IEmitSocketEvents>(receiverId)
      if (recipientSocket) {
         recipientSocket.emit(EClientSocketEvents.typing_direct, isTyping)
      }
   }
}
