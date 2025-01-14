import type { TStartDirectChatData, TFindDirectChatData } from './types'
import type { TUser, TUserWithProfile } from '@/utils/entities/user.entity'
import type { CreateDirectChatDTO, SearchDirectChatDTO } from './DTO'

export interface IDirectChatsController {
   searchDirectChat: (
      user: TUser,
      searchDirectChatPayload: SearchDirectChatDTO
   ) => Promise<TUserWithProfile[]>
   startDirectChat: (
      user: TUser,
      createDirectChatPayload: CreateDirectChatDTO
   ) => Promise<TStartDirectChatData>
   fetchDirectChat: (conversationId: string) => Promise<TFindDirectChatData | null>
}
