import type { TConversation } from '@/utils/entities/conversation.entity'
import type { TUserWithProfile } from '@/utils/entities/user.entity'

export type TSearchConversationParams = {
   email?: string
   username?: string
   creatorId: number
   nameOfUser?: string
}

export type TStartConversationData = TConversation & {
   Recipient: TUserWithProfile
}

export type TFindConversationData = TStartConversationData
