import { Socket } from 'socket.io'
import { EventsMap } from 'socket.io/dist/typed-events'

export class ChattingSession {
   private readonly connectedClients = new Map<string, Socket>()

   addClient(clientId: string, client: Socket): void {
      this.connectedClients.set(clientId, client)
   }

   getClient<T extends EventsMap>(clientId: string): Socket<T> | null {
      return this.connectedClients.get(clientId) || null
   }
}
