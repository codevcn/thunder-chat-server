export type TCreateUserParams = {
   email: string
   password: string
   firstName: string
   lastName: string
   birthday: Date
}

export type TSearchUserData = {
   id: number
   email: string
   username: string | null
   firstName: string
   lastName: string
}
