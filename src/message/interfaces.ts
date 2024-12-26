import { TMessage } from '@/utils/entities/message.entity'

export interface IMessageController {
   fetchMessages: (conversationId: string) => Promise<TMessage[]>
}
