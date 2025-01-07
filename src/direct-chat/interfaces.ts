import type { TStartDirectChatData, TFindDirectChatData } from './types'
import { TUser, TUserWithProfile } from '@/utils/entities/user.entity'
import { CreateDirectChatDTO, SearchDirectChatDTO } from './DTO'

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
