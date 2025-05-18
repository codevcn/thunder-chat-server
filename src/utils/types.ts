import type { Request } from 'express'
import { EClientCookieNames } from './enums'
import type { TUser } from './entities/user.entity'
import { HttpStatus } from '@nestjs/common'

export type TRequestWithUser = Request & { user: TUser }

export type THttpErrorResBody = {
   name: string
   message: string
   timestamp: Date
   isUserError: boolean
}

export type TJWTToken = {
   jwt_token: string
}

export type TClientCookie = Record<EClientCookieNames, string>

export type TSuccess = {
   success: boolean // always true
}

export type TSignatureObject = {
   [key: string | number]: any
}

export type TDiscriminatedQueryReturn<S, I, O> = { select?: S } | { include?: I } | { omit?: O }

export type TWsErrorResponse = {
   isError: boolean
   message: string
   httpStatus: HttpStatus
}
