import http from '@/lib/http'
import { User } from '@/types/auth.type'
import { ResponseData } from '@/types/utils.type'
export const getUserInfo = (id: number) => http.get<ResponseData<User>>('/users/' + id)

export const updateUserInfo = (body: Partial<User>) => http.put('/users/' + body.id, body)
export const uploadAvatar = (id: number, file: File) => {
   const formData = new FormData()
   formData.append('file', file)
   return http.post<ResponseData<string>>(`/users/${id}/upload-avatar`, formData, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
   })
}
export const changePassword = (id: number, currentPassword: string) => {
   return http.post<ResponseData<string>>(`/users/${id}/change-password`, {
      currentPassword
   })
}
