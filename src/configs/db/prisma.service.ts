import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service'
import { BaseHttpException } from '@/utils/exceptions/base-http.exception'
import { EMessageStatus, EMessageTypes } from '@/message/enums'
import type { TDirectMessage } from '@/utils/entities/direct-message.entity'
import type { TUser } from '@/utils/entities/user.entity'
import type { TProfile } from '@/utils/entities/profile.entity'
import { LoggerService } from '../logger/logger.service'
import { TSignatureObject } from '@/utils/types'
import { UnknownException } from '@/utils/exceptions/unknown.exception'

@Injectable()
export class PrismaService
   extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
   implements OnModuleInit, OnModuleDestroy
{
   private readonly recursiveSyncCounter: TSignatureObject = {}
   private readonly MAX_RETRIES: number = 3

   constructor(
      private readonly esService: ElasticsearchService,
      private readonly logger: LoggerService
   ) {
      super({ log: [{ emit: 'event', level: 'query' }] })
      this.$on('query', async (e) => {
         queueMicrotask(() => {
            console.log('\n>>> SQL Query:')
            console.log(e.query)
            console.log('>>> Params:', e.params)
            console.log('>>> Duration:', `${e.duration}ms`, '\n')
         })
      })
      Object.assign(this, this.createExtendedPrismaClient())
   }

   createExtendedPrismaClient() {
      const recursiveSyncMessage = this.recursiveSyncMessage
      const recursiveDeleteMessage = this.recursiveDeleteMessage
      const recursiveSyncUser = this.recursiveSyncUser
      const recursiveDeleteUser = this.recursiveDeleteUser
      const recursiveSyncProfile = this.recursiveSyncProfile
      const recursiveDeleteProfile = this.recursiveDeleteProfile
      const prismaClient = new PrismaClient()
      return prismaClient.$extends({
         query: {
            directMessage: {
               async create({ args, query }) {
                  const result = (await query(args)) as TDirectMessage
                  if (!result) {
                     throw new BaseHttpException('Create direct chat message failed')
                  }
                  recursiveSyncMessage(prismaClient, result)
                  return result
               },
               async update({ args, query }) {
                  const result = (await query(args)) as TDirectMessage
                  if (!result) {
                     throw new BaseHttpException('Update direct chat message failed')
                  }
                  recursiveSyncMessage(prismaClient, result)
                  return result
               },
               async delete({ args, query }) {
                  const result = (await query(args)) as TDirectMessage
                  if (!result) {
                     throw new BaseHttpException('Delete direct chat message failed')
                  }
                  recursiveDeleteMessage(prismaClient, result)
                  return result
               },
            },
            user: {
               async create({ args, query }) {
                  const result = (await query(args)) as TUser
                  if (!result) {
                     throw new BaseHttpException('Create user failed')
                  }
                  recursiveSyncUser(prismaClient, result)
                  return result
               },
               async update({ args, query }) {
                  const result = (await query(args)) as TUser
                  if (!result) {
                     throw new BaseHttpException('Update user failed')
                  }
                  recursiveSyncUser(prismaClient, result)
                  return result
               },
               async delete({ args, query }) {
                  const result = (await query(args)) as TUser
                  if (!result) {
                     throw new BaseHttpException('Delete user failed')
                  }
                  recursiveDeleteUser(prismaClient, result)
                  return result
               },
            },
            profile: {
               async create({ args, query }) {
                  const result = (await query(args)) as TProfile
                  if (!result) {
                     throw new BaseHttpException('Create profile failed')
                  }
                  recursiveSyncProfile(prismaClient, result)
                  return result
               },
               async update({ args, query }) {
                  const result = (await query(args)) as TProfile
                  if (!result) {
                     throw new BaseHttpException('Update profile failed')
                  }
                  recursiveSyncProfile(prismaClient, result)
                  return result
               },
               async delete({ args, query }) {
                  const result = (await query(args)) as TProfile
                  if (!result) {
                     throw new BaseHttpException('Delete profile failed')
                  }
                  recursiveDeleteProfile(prismaClient, result)
                  return result
               },
            },
         },
      })
   }

   recursiveSyncMessage = async (prismaClient: PrismaClient, result: TDirectMessage) => {
      const id = result.id
      const recursiveId = this.recursiveSyncCounter[id]
      this.recursiveSyncCounter[id] = (recursiveId || 0) + 1
      try {
         const chat = await prismaClient.directChat.findUnique({
            where: {
               id: result.directChatId,
            },
            include: {
               Creator: {
                  include: {
                     Profile: true,
                  },
               },
               Recipient: {
                  include: {
                     Profile: true,
                  },
               },
            },
         })
         if (!chat) {
            throw new BaseHttpException('Find direct chat failed')
         }
         await this.esService.createMessage(result.id, {
            message_id: result.id,
            content: result.content,
            type: result.type as EMessageTypes,
            status: result.status as EMessageStatus,
            created_at: result.createdAt as Date,
            valid_user_ids: [chat.creatorId, chat.recipientId],
            recipient: {
               user_id: chat.recipientId,
               email: chat.Recipient.email,
               full_name: chat.Recipient.Profile?.fullName || '',
               avatar: chat.Recipient.Profile?.avatar || '',
            },
            sender: {
               user_id: chat.creatorId,
               email: chat.Creator.email,
               full_name: chat.Creator.Profile?.fullName || '',
               avatar: chat.Creator.Profile?.avatar || '',
            },
         })
      } catch (error) {
         this.logger.error(new UnknownException('Sync message error', error))
         if (recursiveId && recursiveId > this.MAX_RETRIES) {
            delete this.recursiveSyncCounter[id]
         } else {
            this.recursiveSyncMessage(prismaClient, result)
         }
      }
   }

   recursiveDeleteMessage = async (prismaClient: PrismaClient, result: TDirectMessage) => {
      const id = result.id
      const recursiveId = this.recursiveSyncCounter[id]
      this.recursiveSyncCounter[id] = (recursiveId || 0) + 1
      try {
         await this.esService.deleteMessage(result.id)
      } catch (error) {
         this.logger.error(new UnknownException('Delete message error', error))
         if (recursiveId && recursiveId > this.MAX_RETRIES) {
            delete this.recursiveSyncCounter[id]
         } else {
            this.recursiveDeleteMessage(prismaClient, result)
         }
      }
   }

   recursiveSyncUser = async (prismaClient: PrismaClient, result: TUser) => {
      const id = result.id
      const recursiveId = this.recursiveSyncCounter[id]
      this.recursiveSyncCounter[id] = (recursiveId || 0) + 1
      try {
         const user = await prismaClient.user.findUnique({
            where: {
               id: result.id,
            },
            include: {
               Profile: true,
            },
         })
         if (!user) {
            throw new BaseHttpException('Find user failed')
         }
         await this.esService.createUser(user.id, {
            user_id: user.id,
            full_name: user.Profile?.fullName || '',
            email: user.email,
            avatar: user.Profile?.avatar || '',
         })
      } catch (error) {
         this.logger.error(new UnknownException('Sync user error', error))
         if (recursiveId && recursiveId > this.MAX_RETRIES) {
            delete this.recursiveSyncCounter[id]
         } else {
            this.recursiveSyncUser(prismaClient, result)
         }
      }
   }

   recursiveDeleteUser = async (prismaClient: PrismaClient, result: TUser) => {
      const id = result.id
      const recursiveId = this.recursiveSyncCounter[id]
      this.recursiveSyncCounter[id] = (recursiveId || 0) + 1
      try {
         await this.esService.deleteUser(result.id)
      } catch (error) {
         this.logger.error(new UnknownException('Delete user error', error))
         if (recursiveId && recursiveId > this.MAX_RETRIES) {
            delete this.recursiveSyncCounter[id]
         } else {
            this.recursiveDeleteUser(prismaClient, result)
         }
      }
   }

   recursiveSyncProfile = async (prismaClient: PrismaClient, result: TProfile) => {
      const id = result.userId
      const recursiveId = this.recursiveSyncCounter[id]
      this.recursiveSyncCounter[id] = (recursiveId || 0) + 1
      try {
         const { userId } = result
         const user = await prismaClient.user.findUnique({
            where: {
               id: userId,
            },
            select: {
               email: true,
            },
         })
         if (!user) {
            throw new BaseHttpException('Find user failed')
         }
         await this.esService.createUser(userId, {
            user_id: userId,
            full_name: result.fullName,
            email: user.email,
            avatar: result.avatar || '',
         })
      } catch (error) {
         this.logger.error(new UnknownException('Sync profile error', error))
         if (recursiveId && recursiveId > this.MAX_RETRIES) {
            delete this.recursiveSyncCounter[id]
         } else {
            this.recursiveSyncProfile(prismaClient, result)
         }
      }
   }

   recursiveDeleteProfile = async (prismaClient: PrismaClient, result: TProfile) => {
      const id = result.userId
      const recursiveId = this.recursiveSyncCounter[id]
      this.recursiveSyncCounter[id] = (recursiveId || 0) + 1
      try {
         await this.esService.deleteUser(result.userId)
      } catch (error) {
         this.logger.error(new UnknownException('Delete profile error', error))
         if (recursiveId && recursiveId > this.MAX_RETRIES) {
            delete this.recursiveSyncCounter[id]
         } else {
            this.recursiveDeleteProfile(prismaClient, result)
         }
      }
   }

   async onModuleInit() {
      try {
         await this.$connect()
         console.log('>>> Connect DB successfully')
      } catch (error) {
         console.log('>>> DB connection error >>>', error)
      }
   }

   async onModuleDestroy() {
      try {
         await this.$disconnect()
         console.log('>>> Disconnect DB successfully')
      } catch (error) {
         console.log('>>> DB disconnection error >>>', error)
      }
   }
}
