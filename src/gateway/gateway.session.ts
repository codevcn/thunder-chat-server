import { Socket } from 'socket.io'
import { EventsMap } from 'socket.io/dist/typed-events'
import type { TUserId } from './types'

export class GatewaySession {
   private readonly connectedClients = new Map<TUserId, Socket>()

   addClient(clientId: TUserId, client: Socket): void {
      this.connectedClients.set(clientId, client)
   }

   getClient<T extends EventsMap = EventsMap>(clientId: TUserId): Socket<T> | null {
      return this.connectedClients.get(clientId) || null
   }

   removeClient(clientId: TUserId): void {
      this.connectedClients.delete(clientId)
   }

   printOut() {
      for (const [key, value] of this.connectedClients) {
         console.log(`>>> ${key}: ${value.handshake?.auth.clientId}`)
      }
   }
}
