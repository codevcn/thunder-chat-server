export type TCreateUserParams = {
   email: string
   password: string
   firstName: string
   lastName: string
   birthday: Date
}

export type TSearchUserData =
   | {
        id: number
        User: {
           id: number
           email: string
           username: string | null
        }
        fullName: string
        avatar: string | null
     }
   | {
        id: number
        email: string
        username: string | null
        Profile: {
           id: number
           fullName: string
           avatar: string | null
           userId: number
        } | null
     }
