import type { SendFriendRequestDTO } from './DTO'
import { TSuccess } from '@/utils/types'

export interface IFriendController {
   sendFriendRequest: (sendFriendRequestPayload: SendFriendRequestDTO) => Promise<TSuccess>
}
