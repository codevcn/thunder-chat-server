import type { TDirectChat } from '@/utils/entities/direct-chat.entity'
import type { TUserWithProfile } from '@/utils/entities/user.entity'

export type TSearchDirectChatParams = {
   email?: string
   username?: string
   creatorId: number
   nameOfUser?: string
}

export type TStartDirectChatData = TDirectChat & {
   Recipient: TUserWithProfile
}

export type TFindDirectChatData = TStartDirectChatData
