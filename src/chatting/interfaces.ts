import type { EChattingEvent, EInitEvent } from './events'
import type { Server } from 'socket.io'
import type { TMessage } from '@/utils/entities/message.entity'

export interface IInitEvents {
   [EInitEvent.client_connected]: (message: string) => void
}

export interface IChattingService {
   validateConnection: (server: Server) => void
}

export interface IChattingEvents {
   [EChattingEvent.send_message_1v1]: (payload: TMessage) => void
}
