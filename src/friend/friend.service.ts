import { EProviderTokens } from '@/utils/enums'
import { PrismaService } from '@/utils/ORM/prisma.service'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class FriendService {
   constructor(@Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService) {}

   async isFriend(selfId: number, otherId: number): Promise<boolean> {
      const isFriend = await this.prismaService.friend.findFirst({
         where: { senderId: selfId, recipientId: otherId },
      })
      if (!isFriend) {
         return false
      }
      return true
   }
}
