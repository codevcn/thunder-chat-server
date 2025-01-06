import { Injectable } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import type { TUserId } from './types'
import { SocketSession } from './socket.session'
import { EventsMap } from 'socket.io/dist/typed-events'
import type { TUserWithProfile } from '@/utils/entities/user.entity'
import type { IEmitSocketEvents } from './interfaces'
import { EClientSocketEvents } from './events'

@Injectable()
export class SocketService {
   private server: Server
   private readonly socketSession = new SocketSession()

   setServer(server: Server): void {
      this.server = server
   }

   getServer(): Server {
      return this.server
   }

   addClientSession(clientId: TUserId, client: Socket): void {
      this.socketSession.addClient(clientId, client)
   }

   removeClientSession(clientId: TUserId): void {
      this.socketSession.removeClient(clientId)
   }

   getClientSession<T extends EventsMap>(clientId: TUserId): Socket<T> | null {
      return this.socketSession.getClient<T>(clientId)
   }

   async sendFriendRequest(sender: TUserWithProfile, recipientSocketId: TUserId): Promise<void> {
      const recipientSocket = this.socketSession.getClient<IEmitSocketEvents>(recipientSocketId)
      if (recipientSocket) {
         recipientSocket.emit(EClientSocketEvents.send_friend_request, sender)
      }
   }
}
