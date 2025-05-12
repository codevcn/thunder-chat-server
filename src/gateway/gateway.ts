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
   CatchInternalSocketError,
   BaseWsExceptionsFilter,
} from '@/utils/exceptions/base-ws-exception.filter'
import { MessageService } from '@/message/messages.service'
import type { TClientSocket } from './types'
import type { IEmitSocketEvents, IGateway } from './interfaces'
import { wsValidationPipe } from './validation'
import { SocketService } from './socket.service'
import { MarkAsSeenDTO, TypingDTO, SendDirectMessageDTO } from './DTO'
import type { TMessageOffset } from '@/message/types'
import { EMsgMessages } from '@/message/messages'
import { AuthService } from '@/auth/auth.service'
import { MessageTokensManager } from '@/gateway/helpers/message-tokens.helper'
import { EMessageStatus, EMessageTypes } from '@/message/enums'
import { DirectChatService } from '@/direct-chat/direct-chat.service'
import type { TDirectMessage } from '@/utils/entities/direct-message.entity'
import { ConversationTypingManager } from './helpers/conversation-typing.helper'

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
   private readonly convTypingManager: ConversationTypingManager = new ConversationTypingManager()

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
      try {
         const { clientId, messageOffset, directChatId, groupId } =
            await this.authService.validateSocketAuth(client)
         this.socketService.addConnectedClient(clientId, client)
         client.emit(EInitEvents.client_connected, 'Connected Sucessfully!')
         if (messageOffset) {
            await this.recoverMissingMessages(client, messageOffset, directChatId, groupId)
         }
      } catch (error) {
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

   async checkUniqueMessage(token: string, clientId: number): Promise<void> {
      if (!this.messageTokensManager.isUniqueToken(clientId, token)) {
         throw new BaseWsException(EMsgMessages.MESSAGE_OVERLAPS)
      }
   }

   async checkFriendship(clientId: number, receiverId: number): Promise<void> {
      const isFriend = await this.friendService.isFriend(clientId, receiverId)
      if (!isFriend) {
         throw new BaseWsException(EFriendMessages.IS_NOT_FRIEND, HttpStatus.BAD_REQUEST)
      }
   }

   async handleMessage(
      client: { socket: TClientSocket; id: number },
      message: {
         content: string
         timestamp: Date
         directChatId: number
         receiverId: number
         type: EMessageTypes
         stickerUrl?: string
      }
   ): Promise<void> {
      const { id, socket } = client
      const { content, timestamp, directChatId, receiverId, stickerUrl, type } = message
      const newMessage = await this.messageService.createNewDirectMessage(
         content,
         id,
         timestamp,
         directChatId,
         type,
         stickerUrl
      )
      await this.directChatService.addLastSentMessage(directChatId, newMessage.id)
      const recipientSocket = this.socketService.getConnectedClient<IEmitSocketEvents>(receiverId)
      if (recipientSocket) {
         recipientSocket.emit(EClientSocketEvents.send_message_direct, newMessage)
      }
      socket.emit(EClientSocketEvents.send_message_direct, newMessage)
   }

   @SubscribeMessage(EClientSocketEvents.send_message_direct)
   @CatchInternalSocketError()
   async handleSendDirectMessage(
      @MessageBody() payload: SendDirectMessageDTO,
      @ConnectedSocket() client: TClientSocket
   ) {
      const { type, msgPayload } = payload
      const { clientId } = await this.authService.validateSocketAuth(client)
      const { receiverId, token } = msgPayload
      await this.checkUniqueMessage(token, clientId)
      await this.checkFriendship(clientId, receiverId)
      const { directChatId, timestamp, content } = msgPayload
      switch (type) {
         case EMessageTypes.TEXT:
            await this.handleMessage(
               { id: clientId, socket: client },
               {
                  content,
                  timestamp,
                  directChatId,
                  receiverId,
                  type: EMessageTypes.TEXT,
               }
            )
            break
         case EMessageTypes.STICKER:
            await this.handleMessage(
               { id: clientId, socket: client },
               {
                  content: '',
                  timestamp,
                  directChatId,
                  receiverId,
                  type: EMessageTypes.STICKER,
                  stickerUrl: content,
               }
            )
            break
      }
      return { success: true }
   }

   @SubscribeMessage(EClientSocketEvents.message_seen_direct)
   @CatchInternalSocketError()
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
   @CatchInternalSocketError()
   async handleTyping(@MessageBody() data: TypingDTO, @ConnectedSocket() client: TClientSocket) {
      const { clientId } = await this.authService.validateSocketAuth(client)
      const { receiverId, isTyping } = data
      const recipientSocket = this.socketService.getConnectedClient<IEmitSocketEvents>(receiverId)
      if (recipientSocket) {
         recipientSocket.emit(EClientSocketEvents.typing_direct, isTyping)
         if (isTyping) {
            this.convTypingManager.initTyping(clientId, recipientSocket)
         } else {
            this.convTypingManager.removeTyping(clientId)
         }
      }
   }
}
