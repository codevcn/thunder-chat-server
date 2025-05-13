import { User } from '@/user/user.decorator'
import { CreateDirectChatDTO, SearchDirectChatDTO } from '@/direct-chat/DTO'
import { AuthGuard } from '@/auth/auth.guard'
import { DirectChatService } from '@/direct-chat/direct-chat.service'
import type { TUser } from '@/utils/entities/user.entity'
import { BadRequestException, Body, Controller, Post, Get, UseGuards, Param } from '@nestjs/common'
import { ERoutes } from '@/utils/enums'
import { IDirectChatsController } from './interfaces'

@Controller(ERoutes.DIRECT_CHAT)
@UseGuards(AuthGuard)
export class DirectChatController implements IDirectChatsController {
   constructor(private conversationService: DirectChatService) {}

   @Post('search')
   async searchDirectChat(
      @User() user: TUser,
      @Body() searchDirectChatPayload: SearchDirectChatDTO
   ) {
      const { email, nameOfUser } = searchDirectChatPayload
      if (!email && !nameOfUser) {
         throw new BadRequestException('Query is missing email and nameOfUser')
      }
      // >>> fix this
      // return await this.conversationService.searchDirectChat({
      //    email: email,
      //    nameOfUser: nameOfUser,
      //    creatorId: user.id,
      // })
      return []
   }

   @Post('start')
   async startDirectChat(
      @User() user: TUser,
      @Body() createDirectChatPayload: CreateDirectChatDTO
   ) {
      const { recipientId } = createDirectChatPayload
      return await this.conversationService.startDirectChat(recipientId, user.id)
   }

   @Get('fetch/:conversationId')
   async fetchDirectChat(@Param('conversationId') conversationId: string) {
      return await this.conversationService.findDirectChatById(parseInt(conversationId))
   }
}
