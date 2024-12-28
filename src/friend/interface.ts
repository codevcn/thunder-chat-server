import type { TFriendRequest } from '@/utils/entities/friend.entity'
import type { SendFriendRequestDTO } from './DTO'

export interface IFriendController {
   sendFriendRequest: (sendFriendRequestPayload: SendFriendRequestDTO) => Promise<TFriendRequest>
}
