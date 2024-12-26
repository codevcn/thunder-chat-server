import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common'
import type { IUserService } from './interfaces'
import type { TCreateUserParams, TSearchUserData } from './types'
import { PrismaService } from '../utils/ORM/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import { JWTService } from '@/auth/jwt.service'
import { CredentialService } from '@/auth/credential.service'
import { EAuthMessages } from '@/auth/messages'

@Injectable()
export class UserService implements IUserService {
   constructor(
      @Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService,
      private jwtService: JWTService,
      private credentialService: CredentialService
   ) {}

   async findById(id: number) {
      return await this.prismaService.user.findUnique({
         where: { id },
      })
   }

   async registerUser(createUserData: TCreateUserParams) {
      const user = await this.createUser(createUserData)

      return this.jwtService.createJWT({ email: user.email, user_id: user.id })
   }

   async createUser({ email, firstName, lastName, birthday, password }: TCreateUserParams) {
      const hashedPassword = await this.credentialService.getHashedPassword(password)
      const exist_user = await this.prismaService.user.findUnique({
         where: { email },
      })
      if (exist_user) {
         throw new ConflictException(EAuthMessages.USER_EXISTED)
      }

      return await this.prismaService.user.create({
         data: {
            email: email,
            firstName: firstName,
            lastName: lastName,
            password: hashedPassword,
            birthday: birthday,
         },
      })
   }

   async getUserByEmail(email: string) {
      const user = await this.prismaService.user.findUnique({
         where: {
            email: email,
         },
         include: {
            Profile: true,
         },
      })
      if (!user) {
         throw new NotFoundException(EAuthMessages.USER_NOT_FOUND)
      }

      return user
   }

   async searchUsers(keyword: string): Promise<TSearchUserData[]> {
      // Tìm kiếm các user dựa trên keyword
      const users = await this.prismaService.user.findMany({
         where: {
            OR: [
               { username: { contains: keyword, mode: 'insensitive' } },
               { email: { contains: keyword, mode: 'insensitive' } },
               { firstName: { contains: keyword, mode: 'insensitive' } },
               { lastName: { contains: keyword, mode: 'insensitive' } },
            ],
         },
         select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
         },
      })
      return users
   }
}
