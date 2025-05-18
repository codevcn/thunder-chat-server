import type { EMessageStatus, EMessageTypes } from '@/message/enums'

export type TUserMapping = {
   user_id: number
   email: string
   full_name?: string
   avatar?: string
}

export type TMessageMapping = {
   message_id: number
   content: string
   created_at: Date
   status: EMessageStatus
   type: EMessageTypes
   valid_user_ids: number[]
   sender: TUserMapping
   recipient: TUserMapping
}
