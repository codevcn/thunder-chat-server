import type { TQueueIsProcessingTasks, TQueueAsyncTask, TUserId } from './types'

export class MessagesQueue {
   private readonly queues = new Map<TUserId, [TQueueIsProcessingTasks, TQueueAsyncTask[]]>()

   printQueues(): void {
      for (const [key, value] of this.queues.entries()) {
         console.log(`>>> key: ${key} - somthing: ${value[1].length}`)
      }
   }

   /**
    * Add a new async function to the queue
    * @param userId The id of user
    * @param task A function that returns a Promise
    */
   async addExecution(userId: TUserId, task: TQueueAsyncTask): Promise<void> {
      const queue = this.queues.get(userId)
      if (queue) {
         queue[1].push(task)
         if (!queue[0]) {
            this.processQueue(userId)
         }
      } else {
         this.queues.set(userId, [false, [task]])
         this.processQueue(userId)
      }
   }

   /**
    * Process the queue using recursion
    */
   private async processQueue(userId: TUserId): Promise<void> {
      const userQueue = this.queues.get(userId)
      if (userQueue) {
         if (userQueue[1].length === 0) {
            userQueue[0] = false
            return
         }
         userQueue[0] = true
         const task = userQueue[1].shift()
         if (task) {
            try {
               await task()
            } catch (error) {
               console.log('>>> error:', error)
            }
         }
         await this.processQueue(userId)
      }
   }
}
