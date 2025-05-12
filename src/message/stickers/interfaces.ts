import type { TSticker, TStickerCategory } from '@/utils/entities/sticker.entity'
import type { GetStickersDTO } from './DTO'

export interface IStickerController {
   getStickers(payload: GetStickersDTO): Promise<TSticker[]>
   getAllStickerCategories(): Promise<TStickerCategory[]>
}
