import type { TUserWithProfile } from '@/utils/entities/user.entity'
import type { EClientSocketEvents, EInitEvents } from '../gateway/events'
import type { TWsErrorResponse } from '@/utils/exceptions/types'
import type { TNewDirectMessage } from '@/message/types'
import type { TSuccess } from '@/utils/types'
import { ChattingPayloadDTO } from './DTO'
import { Socket } from 'socket.io'

export interface IEmitSocketEvents {
   [EInitEvents.client_connected]: (message: string) => void
   [EClientSocketEvents.send_message_direct]: (payload: TNewDirectMessage) => void
   [EClientSocketEvents.send_friend_request]: (payload: TUserWithProfile) => void
   [EClientSocketEvents.error]: (error: TWsErrorResponse) => void
   [EClientSocketEvents.recovered_connection]: (messages: TNewDirectMessage[]) => void
}

export interface IGateway {
   handleDirectChatting: (
      payload: ChattingPayloadDTO,
      client: Socket<IEmitSocketEvents>
   ) => Promise<TSuccess>
}
