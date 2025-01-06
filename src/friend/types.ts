import type { TUserWithProfile } from '@/utils/entities/user.entity'
import { $Enums } from '@prisma/client'

export type TGetFriendRequestsData = {
   id: number
   Sender: TUserWithProfile
   Recipient: TUserWithProfile
   createdAt: Date
   status: $Enums.FriendRequestsStatus
}

export type TGetFriendsData = {
   id: number
   senderId: number
   createdAt: Date
   Recipient: TUserWithProfile
}
