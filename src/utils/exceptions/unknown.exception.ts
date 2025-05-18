export class UnknownException extends Error {
   private originalError?: Error

   constructor(message: string, originalError?: Error) {
      super(message)
      this.name = 'Unknown Exception'
      if (originalError) {
         this.originalError = originalError
         this.stack = originalError.stack
      }
   }
}
