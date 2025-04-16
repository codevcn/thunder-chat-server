import type { FetchMsgsParamsDTO } from './DTO'
import type { TGetDirectMessagesData } from './types'

export interface IMessageController {
   fetchMessages: (directChatId: FetchMsgsParamsDTO) => Promise<TGetDirectMessagesData>
}
