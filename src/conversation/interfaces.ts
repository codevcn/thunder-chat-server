import type {
   TStartConversationParams,
   TStartConversationData,
   TFindConversationParams,
   TFindConversationData,
   TSearchConversationParams,
} from './types'
import { TUser, TUserWithProfile } from '@/utils/entities/user.entity'
import { CreateConversationDTO, SearchConversationDTO } from './conversation.dto'

export interface IConversationsService {
   searchConversation: ({
      email,
      username,
      creatorId,
   }: TSearchConversationParams) => Promise<TUserWithProfile[]>
   startConversation: ({
      recipientId,
      creatorId,
   }: TStartConversationParams) => Promise<TStartConversationData>
   findConversation: ({
      recipientId,
      creatorId,
   }: TFindConversationParams) => Promise<TFindConversationData | null>
}

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
