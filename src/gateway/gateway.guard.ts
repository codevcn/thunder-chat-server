import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import type { TClientSocket } from './types'
import { AuthService } from '@/auth/auth.service'

@Injectable()
export class ClientSocketAuthGuard implements CanActivate {
   constructor(private authService: AuthService) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const clientSocket = context.switchToWs().getClient<TClientSocket>()
      return !!(await this.authService.validateSocketAuth(clientSocket))
   }
}
