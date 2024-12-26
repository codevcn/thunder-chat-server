import type { TUserWithProfile, TUser } from '@/utils/entities/user.entity'
import type { TCreateUserParams, TSearchUserData } from './types'
import type { TJWTToken, TSuccess } from '@/utils/types'
import type { CreateUserDTO, GetUserByEmailDTO, SearchUsersDTO } from './user.dto'
import type { Response } from 'express'

export interface IUserController {
   register: (createUserPayload: CreateUserDTO, res: Response) => Promise<TSuccess>
   getUserByEmail: (getUserByEmailPayload: GetUserByEmailDTO) => Promise<TUserWithProfile>
   searchUsers: (searchUsersPayload: SearchUsersDTO) => Promise<TSearchUserData[]>
}

export interface IUserService {
   createUser: (createUser: TCreateUserParams) => Promise<TUser>
   getUserByEmail: (email: string) => Promise<TUserWithProfile>
   registerUser: (createUserData: TCreateUserParams) => Promise<TJWTToken>
}
