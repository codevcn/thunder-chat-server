import { Injectable, OnModuleInit } from '@nestjs/common'
import { Client } from '@elastic/elasticsearch'
import type { TMessageMapping, TUserMapping } from './types'
import { EESIndexes } from './enums'

export const ESClient = new Client({
   cloud: { id: process.env.ELASTIC_CLOUD_ID },
   auth: { apiKey: process.env.ELASTIC_API_KEY },
})

@Injectable()
export class ElasticsearchService implements OnModuleInit {
   async onModuleInit(): Promise<void> {
      await this.pingToESServer()
   }

   async pingToESServer(): Promise<void> {
      try {
         const result = await ESClient.ping()
         console.log('>>> Elasticsearch ping result:', result)
      } catch (error) {
         console.error('>>> Elasticsearch ping failed:', error)
      }
   }

   async createMessage(messageId: number, message: TMessageMapping): Promise<void> {
      await ESClient.index({
         index: EESIndexes.MESSAGES,
         id: messageId.toString(),
         document: message,
         refresh: 'wait_for',
      })
   }

   async createUser(userId: number, user: TUserMapping): Promise<void> {
      await ESClient.index({
         index: EESIndexes.USERS,
         id: userId.toString(),
         document: user,
         refresh: 'wait_for',
      })
   }

   async deleteMessage(messageId: number): Promise<void> {
      await ESClient.delete({
         index: EESIndexes.MESSAGES,
         id: messageId.toString(),
      })
   }

   async deleteUser(userId: number): Promise<void> {
      await ESClient.delete({
         index: EESIndexes.USERS,
         id: userId.toString(),
      })
   }

   async searchDirectMessages(
      keyword: string,
      userId: number,
      limit: number
   ): Promise<TMessageMapping[]> {
      const result = await ESClient.search<TMessageMapping>({
         index: EESIndexes.MESSAGES,
         query: {
            bool: {
               must: [
                  { match: { content: { query: keyword, fuzziness: 'AUTO' } } }, // Tìm kiếm full-text
                  { terms: { valid_user_ids: [userId] } }, // Lọc theo user_ids
               ],
            },
         },
         sort: [{ created_at: { order: 'desc' } }], // Sắp xếp theo created_at giảm dần
         size: limit, // Giới hạn kết quả theo tham số limit
         highlight: {
            fields: {
               content: {}, // Highlight keyword trong content
            },
         },
      })
      return result.hits.hits.map((hit) => hit._source!)
   }

   async searchUsers(keyword: string, limit: number): Promise<TUserMapping[]> {
      const result = await ESClient.search<TUserMapping>({
         index: EESIndexes.USERS,
         query: {
            bool: {
               should: [
                  { match: { username: { query: keyword, fuzziness: 'AUTO' } } },
                  { match: { email: { query: keyword, fuzziness: 'AUTO' } } },
                  { match: { full_name: { query: keyword, fuzziness: 'AUTO' } } },
               ],
               minimum_should_match: 1,
            },
         },
         highlight: {
            fields: {
               username: {},
               email: {},
               full_name: {},
            },
         },
         sort: [{ full_name: { order: 'asc' } }],
         size: limit,
      })
      return result.hits.hits.map((hit) => hit._source!)
   }
}
