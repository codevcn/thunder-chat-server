import type { FriendRequestActionDTO, GetFriendRequestsDTO, SendFriendRequestDTO } from './DTO'
import type { TSuccess } from '@/utils/types'
import type { EFriendRequestStatus } from './enums'
import type { TGetFriendRequestsData } from './types'
import type { TFriendRequest } from '@/utils/entities/friend.entity'

export interface IFriendRequestController {
   sendFriendRequest: (sendFriendRequestPayload: SendFriendRequestDTO) => Promise<TFriendRequest>
   friendRequestAction: (
      friendRequestActionPayload: FriendRequestActionDTO,
      action: EFriendRequestStatus
   ) => Promise<TSuccess>
   getFriendRequests: (
      getFriendRequestsPayload: GetFriendRequestsDTO
   ) => Promise<TGetFriendRequestsData[]>
}
