import type { FriendRequestActionDTO, GetFriendRequestsDTO, SendFriendRequestDTO } from './DTO'
import type { TSuccess } from '@/utils/types'
import { EFriendRequestStatus } from './enums'
import type { TGetFriendRequestsData } from './types'

export interface IFriendController {
   sendFriendRequest: (sendFriendRequestPayload: SendFriendRequestDTO) => Promise<TSuccess>
   friendRequestAction: (
      friendRequestActionPayload: FriendRequestActionDTO,
      action: EFriendRequestStatus
   ) => Promise<TSuccess>
   getFriendRequests: (
      getFriendRequestsPayload: GetFriendRequestsDTO
   ) => Promise<TGetFriendRequestsData[]>
}
