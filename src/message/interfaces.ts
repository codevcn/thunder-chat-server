import type { GetDirectMsgsParamsDTO } from './DTO'
import type { TGetDirectMessagesData } from './types'

export interface IMessageController {
   fetchMessages: (directChatId: GetDirectMsgsParamsDTO) => Promise<TGetDirectMessagesData>
}
