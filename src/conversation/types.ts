import { TConversation } from '@/utils/entities/conversation.entity'
import { TUserWithProfile } from '@/utils/entities/user.entity'

export type TSearchConversationParams = {
   email?: string
   username?: string
   creatorId: number
   nameOfUser?: string
}

export type TStartConversationParams = {
   recipientId: number
   creatorId: number
}

export type TFindConversationParams = TStartConversationParams

export type TStartConversationData = TConversation & {
   recipient: TUserWithProfile
}

export type TFindConversationData = TStartConversationData
