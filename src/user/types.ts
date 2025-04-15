export type TCreateUserParams = {
   email: string
   password: string
   firstName: string
   lastName: string
   birthday: Date
}

export type TSearchProfilesData = {
   id: number
   User: {
      id: number
      email: string
      username: string | null
   }
   fullName: string
   avatar: string | null
}

export type TSearchUsersData = {
   id: number
   email: string
   username: string | null
   Profile: {
      id: number
      fullName: string
      avatar: string | null
   } | null
}
