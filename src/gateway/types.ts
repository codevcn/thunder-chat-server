import { Socket } from 'socket.io'
import type { IEmitSocketEvents } from './interfaces'

export type TUserId = string

export type TClientSocket = Socket<{}, IEmitSocketEvents>
