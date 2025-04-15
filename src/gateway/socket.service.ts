import { Injectable } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import type { TUserId } from './types'
import { EventsMap } from 'socket.io/dist/typed-events'
import type { TUserWithProfile } from '@/utils/entities/user.entity'
import type { IEmitSocketEvents } from './interfaces'
import { EClientSocketEvents } from './events'

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

   async sendFriendRequest(sender: TUserWithProfile, recipientSocketId: TUserId): Promise<void> {
      const recipientSocket = this.getConnectedClient<IEmitSocketEvents>(recipientSocketId)
      if (recipientSocket) {
         recipientSocket.emit(EClientSocketEvents.send_friend_request, sender)
      }
   }
}
