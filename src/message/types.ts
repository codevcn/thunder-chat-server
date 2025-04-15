import type { EMessageStatus } from './enums'

export type TDirectMessage = {
   id: number
   content: string
   authorId: number
   directChatId: number
   createdAt: Date
}

export type TNewGroupMessage = {
   id: number
   content: string
   authorId: number
   directChatId: number
   createdAt: Date
}

export type TGetDirectMessagesData = {
   hasMoreMessages: boolean
   directMessages: TDirectMessage[]
}

export type TMsgStatusPayload = {
   messageId: number
   status: EMessageStatus
}
