import {
   ConnectedSocket,
   MessageBody,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
} from '@nestjs/websockets'
import type { OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server } from 'socket.io'
import type { Socket } from 'socket.io'
import { EClientSocketEvents, EInitEvents } from './events'
import { ChattingService } from '../chatting/chatting.service'
import { ESocketNamespaces } from '../chatting/enums'
import { GatewaySession } from './chatting.sessions'
import { HttpStatus, UseFilters, UsePipes } from '@nestjs/common'
import { ChattingPayloadDTO } from '../chatting/DTO'
import { FriendService } from '@/friend/friend.service'
import { wsValidationPipe } from '../chatting/chatting.validation'
import { BaseWsException } from '../chatting/chatting.exception'
import { EFriendMessages } from '@/friend/messages'
import {
   CatchSocketErrors,
   BaseWsExceptionsFilter,
} from '@/utils/exceptions/base-ws-exception.filter'
import { EChattingMessags } from '../chatting/messages'
import type { TSuccess } from '@/utils/types'
import { MessageService } from '@/message/messages.service'
import type { TUserWithProfile } from '@/utils/entities/user.entity'
import { OnEvent } from '@nestjs/event-emitter'
import { EGatewayInternalEvents } from '@/utils/enums'
import { TClientSocket } from './types'
import { IEmitSocketEvents } from './interfaces'

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
      OnGatewayInit<Server>
{
   @WebSocketServer()
   server: Server

   private readonly gatewaySession = new GatewaySession()

   constructor(
      private chattingService: ChattingService,
      private friendService: FriendService,
      private messageService: MessageService
   ) {}

   afterInit(serverInit: Server) {
      this.chattingService.validateConnection(serverInit)
   }

   handleConnection(client: TClientSocket) {
      console.log('>>> connected socket id:', client.id)
      const { clientId } = client.handshake.auth
      if (clientId) {
         this.gatewaySession.addClient(clientId, client)
         client.emit(EInitEvents.client_connected, 'Connected Sucessfully!')
      } else {
         client.disconnect(true)
      }
   }

   handleDisconnect(client: TClientSocket) {
      console.log('>>> discnn socket id:', client.id)
      const { clientId } = client.handshake.auth
      this.gatewaySession.removeClient(clientId)
   }

   @SubscribeMessage(EClientSocketEvents.send_message_1v1)
   @CatchSocketErrors()
   async handleChatting(
      @MessageBody() payload: ChattingPayloadDTO,
      @ConnectedSocket() client: Socket
   ): Promise<TSuccess> {
      const { clientId } = this.chattingService.validateAuthOfClient(client)
      const { message, receiverId, conversationId } = payload
      console.log('>>> stuff:', { clientId, receiverId })
      const isFriend = await this.friendService.isFriend(clientId, receiverId)
      if (!isFriend) {
         throw new BaseWsException(EFriendMessages.IS_NOT_FRIEND, HttpStatus.BAD_REQUEST)
      }
      const recipientSocket = this.gatewaySession.getClient<IEmitSocketEvents>(
         receiverId.toString()
      )
      if (!recipientSocket) {
         throw new BaseWsException(EChattingMessags.RECIPIENT_NOT_FOUND)
      }
      const newMessage = await this.messageService.createNewMessage(
         message,
         clientId,
         conversationId
      )
      recipientSocket.emit(EClientSocketEvents.send_message_1v1, newMessage)
      return { success: true }
   }

   @OnEvent(EGatewayInternalEvents.send_friend_request, { async: true })
   async sendFriendRequest(
      sender: TUserWithProfile,
      recipientId: number,
      numOfMutualFriends: number
   ): Promise<void> {
      this.gatewaySession.printOut()
      const recipientSocket = this.gatewaySession.getClient<IEmitSocketEvents>(
         recipientId.toString()
      )
      console.log('>>> reci:', {
         recipientSocket: recipientSocket?.handshake.auth,
         userId: recipientSocket?.handshake.auth,
         sender,
         recipientId: recipientId.toString(),
         numOfMutualFriends,
      })
      if (!recipientSocket) {
         throw new BaseWsException(EChattingMessags.RECIPIENT_NOT_FOUND)
      }
      recipientSocket.emit(EClientSocketEvents.send_friend_request, sender, numOfMutualFriends)
   }
}
