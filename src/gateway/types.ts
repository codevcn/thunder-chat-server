import { Socket } from 'socket.io'
import type { IEmitSocketEvents } from './interfaces'
import type { TUser } from '@/utils/entities/user.entity'

export type TUserId = TUser['id']

export type TClientSocket = Socket<{}, IEmitSocketEvents>

export type TClientAuth = {
   clientId: number
}

export type TMsgToken = string

export type TConversationTypingFlags = {
   [key: TUserId]: NodeJS.Timeout
}
