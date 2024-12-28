import type { TUserWithProfile } from '@/utils/entities/user.entity'
import type { EClientSocketEvents, EInitEvents } from '../gateway/events'
import type { TMessage } from '@/utils/entities/message.entity'

export interface IInitEvents {
   [EInitEvents.client_connected]: (message: string) => void
}

export interface IClientSocketEvents {
   [EClientSocketEvents.send_message_1v1]: (payload: TMessage) => void
   [EClientSocketEvents.send_friend_request]: (
      payload: TUserWithProfile,
      numOfMutualFriends: number
   ) => void
}
