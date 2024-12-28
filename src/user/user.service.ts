import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common'
import type { TCreateUserParams, TSearchUsersData, TSearchProfilesData } from './types'
import { PrismaService } from '../utils/ORM/prisma.service'
import { EProviderTokens } from '@/utils/enums'
import { JWTService } from '@/auth/jwt.service'
import { CredentialService } from '@/auth/credential.service'
import { EAuthMessages } from '@/auth/messages'
import { TUser, TUserWithProfile } from '@/utils/entities/user.entity'
import { TJWTToken } from '@/utils/types'

@Injectable()
export class UserService {
   constructor(
      @Inject(EProviderTokens.PRISMA_CLIENT) private prismaService: PrismaService,
      private jwtService: JWTService,
      private credentialService: CredentialService
   ) {}

   async findById(id: number): Promise<TUser | null> {
      return await this.prismaService.user.findUnique({
         where: { id },
      })
   }

   async findUserWithProfileById(userId: number): Promise<TUserWithProfile | null> {
      return await this.prismaService.user.findUnique({
         where: { id: userId },
         include: {
            Profile: true,
         },
      })
   }

   async registerUser(createUserData: TCreateUserParams): Promise<TJWTToken> {
      const user = await this.createUser(createUserData)
      return this.jwtService.createJWT({ email: user.email, user_id: user.id })
   }

   async createUser({ email, password }: TCreateUserParams): Promise<TUser> {
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
            password: hashedPassword,
         },
      })
   }

   async getUserByEmail(email: string): Promise<TUserWithProfile> {
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

   mergeSimilarUsers(profles: TSearchProfilesData[]): TSearchUsersData[] {
      const users: TSearchUsersData[] = []
      for (const profile of profles) {
         const { User, ...profileInfo } = profile
         const user = { ...User, Profile: profileInfo }
         users.push(user)
      }
      return users
   }

   async searchUsers(keyword: string): Promise<TSearchUsersData[]> {
      // Tìm kiếm các user dựa trên keyword
      const profiles = await this.prismaService.profile.findMany({
         where: {
            OR: [{ fullName: { contains: keyword, mode: 'insensitive' } }],
         },
         select: {
            id: true,
            fullName: true,
            avatar: true,
            User: {
               select: {
                  id: true,
                  email: true,
                  username: true,
               },
            },
         },
      })
      let userFilter: number[] | null = []
      if (profiles && profiles.length > 0) {
         userFilter = profiles.map((profile) => profile.User.id)
      }
      const users = await this.prismaService.user.findMany({
         where: {
            id: { notIn: userFilter },
            OR: [
               { username: { contains: keyword, mode: 'insensitive' } },
               { email: { contains: keyword, mode: 'insensitive' } },
            ],
         },
         select: {
            id: true,
            email: true,
            username: true,
            Profile: {
               select: {
                  id: true,
                  fullName: true,
                  avatar: true,
               },
            },
         },
      })
      const searchResult = users.concat(this.mergeSimilarUsers(profiles))
      return searchResult
   }
}
