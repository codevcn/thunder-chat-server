import { Module } from '@nestjs/common'
import { TestController } from './test.controller'
import { PrismaService } from '@/utils/ORM/prisma.service'

@Module({
   imports: [],
   controllers: [TestController],
   providers: [PrismaService],
   exports: [],
})
export class TestModule {}
