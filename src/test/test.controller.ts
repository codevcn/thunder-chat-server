import { PrismaService } from '@/utils/ORM/prisma.service'
import { Controller, Post, Body, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common'

import { Exclude } from 'class-transformer'

class CheckAuthEntity {
   id: number
   createdAt: Date
   email: string
   username: string | null

   @Exclude()
   password: string

   constructor(user: CheckAuthEntity) {
      Object.assign(this, user)
   }
}

type TBody = {
   data: string
}

@Controller('test')
export class TestController {
   constructor(private prismaService: PrismaService) {}

   @UseInterceptors(ClassSerializerInterceptor)
   @Post()
   async testing(@Body() body: TBody): Promise<CheckAuthEntity | null> {
      const user = await this.prismaService.user.findFirst({
         include: {
            Profile: true,
         },
      })
      console.log('>>> user >>>', user)
      if (user) {
         const user_data = new CheckAuthEntity(user)
         console.log('>>> user_data >>>', user_data)
         return user_data
      }
      return null
   }
}
