import { Injectable } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import type { TUserId } from './types'
import { EventsMap } from 'socket.io/dist/typed-events'
import type { TUserWithProfile } from '@/utils/entities/user.entity'
import type { IEmitSocketEvents } from './interfaces'
import { EClientSocketEvents } from './events'
import { EFriendRequestStatus } from '@/friend-request/enums'
import type { TGetFriendRequestsData } from '@/friend-request/types'

@Injectable()
export class SocketService {
   private server: Server
   private readonly connectedClients = new Map<TUserId, Socket>()

   setServer(server: Server): void {
      this.server = server
   }

   getServer(): Server {
      return this.server
   }

   addConnectedClient(clientId: TUserId, client: Socket): void {
      this.connectedClients.set(clientId, client)
   }

   getConnectedClient<T extends EventsMap = EventsMap>(clientId: TUserId): Socket<T> | null {
      return this.connectedClients.get(clientId) || null
   }

   removeConnectedClient(clientId: TUserId): void {
      this.connectedClients.delete(clientId)
   }

   printOutSession() {
      for (const [key, value] of this.connectedClients) {
         console.log(`>>> key: ${key} - something: ${value.handshake?.auth.clientId}`)
      }
   }

   sendFriendRequest(
      sender: TUserWithProfile,
      recipientId: TUserId,
      requestData: TGetFriendRequestsData
   ): void {
      const recipientSocket = this.getConnectedClient<IEmitSocketEvents>(recipientId)
      if (recipientSocket) {
         recipientSocket.emit(EClientSocketEvents.send_friend_request, sender, requestData)
      }
   }

   friendRequestAction(senderId: number, requestId: number, action: EFriendRequestStatus): void {
      const senderSocket = this.getConnectedClient<IEmitSocketEvents>(senderId)
      if (senderSocket) {
         senderSocket.emit(EClientSocketEvents.friend_request_action, {
            requestId,
            action,
         })
      }
   }

   checkUserOnlineStatus(userId: TUserId): boolean {
      return this.connectedClients.has(userId)
   }
}
