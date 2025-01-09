import { Socket } from 'socket.io'
import type { IEmitSocketEvents } from './interfaces'

export type TUserId = number

export type TClientSocket = Socket<{}, IEmitSocketEvents>

export type TClientAuth = {
   clientId: number
}

export type TMsgToken = string

export type TQueueIsProcessingTasks = boolean

export type TQueueAsyncTask = () => Promise<void>
