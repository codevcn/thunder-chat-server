import type { TStartConversationData, TFindConversationData } from './types'
import { TUser, TUserWithProfile } from '@/utils/entities/user.entity'
import { CreateConversationDTO, SearchConversationDTO } from './DTO'

export interface IConversationsController {
   searchConversation: (
      user: TUser,
      searchConversationPayload: SearchConversationDTO
   ) => Promise<TUserWithProfile[]>
   startConversation: (
      user: TUser,
      createConversationPayload: CreateConversationDTO
   ) => Promise<TStartConversationData>
   fetchConversation: (conversationId: string) => Promise<TFindConversationData | null>
}
