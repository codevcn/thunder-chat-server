import type { TUser } from '@/utils/entities/user.entity'
import type { GlobalSearchPayloadDTO } from './DTO'
import type { TGlobalSearchData } from './types'

export interface ISearchController {
   searchGlobally(searchPayload: GlobalSearchPayloadDTO, user: TUser): Promise<TGlobalSearchData>
}
