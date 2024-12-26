import { BaseWsException } from '@/chatting/chatting.exception'
import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common'
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'
import type { TWsErrorResponse } from './types'

@Catch(WsException)
export class BaseWsExceptionsFilter extends BaseWsExceptionFilter {
   catch(exception: WsException, host: ArgumentsHost) {
      const clientSocket = host.switchToWs().getClient<Socket>()
      const formattedException = this.formatException(exception)
      clientSocket.emit('error', formattedException)
      super.catch(exception, host)
   }

   private formatException(exception: WsException) {
      const toReturn = {
         message: exception.message,
         status: HttpStatus.INTERNAL_SERVER_ERROR,
      }
      if (exception instanceof BaseWsException) {
         toReturn.status = exception.status
      }
      return toReturn
   }
}

// catch socket exceptions at methods level
export function CatchSocketErrors() {
   return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value

      descriptor.value = async function (...args: any[]): Promise<TWsErrorResponse> {
         try {
            // call original function
            return await originalMethod.apply(this, args)
         } catch (error) {
            if (!(error instanceof BaseWsException)) {
               throw error
            }
            // return error data to client
            return {
               isError: true,
               message: error.message || 'Unknow Error',
            }
         }
      }

      return descriptor
   }
}
