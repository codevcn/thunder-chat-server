import { TMessage } from '@/utils/entities/message.entity'

export interface IMessageController {
   fetchMessages: (directChatId: string) => Promise<TMessage[]>
}
