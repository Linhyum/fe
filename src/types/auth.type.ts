import { ResponseData } from '@/types/utils.type'

export type LoginResType = ResponseData<Data>
export interface Data {
   token: string
   refreshToken: string
   user: User
}

export interface User {
   id: number
   role: boolean
   userName: string
   email: string
   phone: string
   surName: string
   lastName: string
   active: number
   picture: string
   createAt: string
   loginTimes: number
   address: string
   dateOfBirth: string
   gender: string
}
