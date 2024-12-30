import type { FriendRequestActionDTO, GetFriendRequestsDTO, SendFriendRequestDTO } from './DTO'
import type { TSuccess } from '@/utils/types'
import { EFriendRequestStatus } from './enums'
import type { TFriendRequest } from '@/utils/entities/friend.entity'

export interface IFriendController {
   sendFriendRequest: (sendFriendRequestPayload: SendFriendRequestDTO) => Promise<TSuccess>
   friendRequestAction: (
      friendRequestActionPayload: FriendRequestActionDTO,
      action: EFriendRequestStatus
   ) => Promise<TSuccess>
   getFriendRequests: (getFriendRequestsPayload: GetFriendRequestsDTO) => Promise<TFriendRequest[]>
}
