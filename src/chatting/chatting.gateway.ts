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
import type { IChattingEvents, IInitEvents } from './interfaces'
import { EChattingEvent, EInitEvent } from './events'
import { ChattingService } from './chatting.service'
import { ESocketNamespaces } from './enums'
import { ChattingSession } from './chatting.sessions'
import { HttpStatus, UseFilters, UsePipes } from '@nestjs/common'
import { ChattingPayloadDTO } from './chatting.dto'
import { FriendService } from '@/friend/friend.service'
import { wsValidationPipe } from './chatting.validation'
import { BaseWsException } from './chatting.exception'
import { EFriendMessages } from '@/friend/messages'
import {
   CatchSocketErrors,
   BaseWsExceptionsFilter,
} from '@/utils/exceptions/base-ws-exception.filter'
import { EChattingMessags } from './messages'
import type { TSuccess } from '@/utils/types'
import { MessageService } from '@/message/messages.service'

@WebSocketGateway({
   cors: {
      origin:
         process.env.NODE_ENV === 'production'
            ? process.env.CLIENT_HOST
            : process.env.CLIENT_HOST_DEV,
      credentials: true,
   },
   namespace: ESocketNamespaces.Chatting,
})
@UseFilters(new BaseWsExceptionsFilter())
@UsePipes(wsValidationPipe)
export class ChattingGateway
   implements
      OnGatewayConnection<Socket<IInitEvents>>,
      OnGatewayDisconnect<Socket<IInitEvents>>,
      OnGatewayInit<Server>
{
   @WebSocketServer()
   server: Server

   private readonly chattingSession = new ChattingSession()

   constructor(
      private chattingService: ChattingService,
      private friendService: FriendService,
      private messageService: MessageService
   ) {}

   afterInit(serverInit: Server) {
      this.chattingService.validateConnection(serverInit)
   }

   handleConnection(client: Socket<IInitEvents>) {
      console.log('>>> connected socket id:', client.id)
      const { clientId } = client.handshake.auth
      if (clientId) {
         this.chattingSession.addClient(client.handshake.auth.clientId, client)
         client.emit(EInitEvent.client_connected, 'Connected Sucessfully!')
      } else {
         client.disconnect(true)
      }
   }

   handleDisconnect(client: Socket<IInitEvents>) {
      console.log('>>> discnn socket id:', client.id)
   }

   @SubscribeMessage(EChattingEvent.send_message_1v1)
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
      const recipientSocket = this.chattingSession.getClient<IChattingEvents>(receiverId.toString())
      if (!recipientSocket) {
         throw new BaseWsException(EChattingMessags.RECIPIENT_NOT_FOUND)
      }
      const newMessage = await this.messageService.createNewMessage(
         message,
         clientId,
         conversationId
      )
      recipientSocket.emit(EChattingEvent.send_message_1v1, newMessage)
      return { success: true }
   }
}
