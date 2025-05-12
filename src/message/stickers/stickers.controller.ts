import { Controller, Get, Query } from '@nestjs/common'
import { StickersService } from './stickers.service'
import { GetStickersDTO } from './DTO'
import { ERoutes } from '@/utils/enums'
import { IStickerController } from './interfaces'

@Controller(ERoutes.STICKER)
export class StickerController implements IStickerController {
   constructor(private stickersService: StickersService) {}

   @Get('get-stickers')
   async getStickers(@Query() payload: GetStickersDTO) {
      const { categoryId, offsetId } = payload
      return await this.stickersService.getStickersByCategoryId(categoryId, offsetId)
   }

   @Get('get-all-categories')
   async getAllStickerCategories() {
      return await this.stickersService.getAllStickerCategories()
   }
}
