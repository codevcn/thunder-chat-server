import type { TFindDirectChatData } from './types'

export interface IDirectChatsController {
   fetchDirectChat: (conversationId: string) => Promise<TFindDirectChatData | null>
}
