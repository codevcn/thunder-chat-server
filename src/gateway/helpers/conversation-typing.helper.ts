import type { TClientSocket, TConversationTypingFlags, TUserId } from '../types'
import { EClientSocketEvents } from '../events'

export class ConversationTypingManager {
   private readonly flags: TConversationTypingFlags = {}
   private readonly TYPING_TIME_OUT: number = 5000

   initTyping(senderId: TUserId, recipientSocket: TClientSocket): void {
      if (this.flags[senderId]) {
         this.removeTyping(senderId)
      }
      this.flags[senderId] = setTimeout(() => {
         recipientSocket.emit(EClientSocketEvents.typing_direct, false)
      }, this.TYPING_TIME_OUT)
   }

   removeTyping(senderId: TUserId): void {
      clearTimeout(this.flags[senderId])
      delete this.flags[senderId]
   }
}
