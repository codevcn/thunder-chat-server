import type {
   FriendRequestActionDTO,
   GetFriendRequestsDTO,
   GetFriendsDTO,
   SendFriendRequestDTO,
} from './DTO'
import type { TSuccess } from '@/utils/types'
import type { EFriendRequestStatus } from './enums'
import type { TGetFriendRequestsData, TGetFriendsData } from './types'

export interface IFriendController {
   sendFriendRequest: (sendFriendRequestPayload: SendFriendRequestDTO) => Promise<TSuccess>
   friendRequestAction: (
      friendRequestActionPayload: FriendRequestActionDTO,
      action: EFriendRequestStatus
   ) => Promise<TSuccess>
   getFriendRequests: (
      getFriendRequestsPayload: GetFriendRequestsDTO
   ) => Promise<TGetFriendRequestsData[]>
   getFriends: (getFriendsPayload: GetFriendsDTO) => Promise<TGetFriendsData[]>
}
