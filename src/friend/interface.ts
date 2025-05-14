import type { GetFriendsDTO } from './DTO'
import type { TGetFriendsData } from './types'

export interface IFriendController {
   getFriends: (getFriendsPayload: GetFriendsDTO) => Promise<TGetFriendsData[]>
}
