import { changePassword, getUserInfo, updateUserInfo, uploadAvatar } from '@/apiRequest/user'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

export const useGetUserInfo = (id: number) => {
   return useQuery({
      queryKey: ['user', id],
      queryFn: () => getUserInfo(id),
      enabled: !!id
   })
}

export const useUpdateUserInfo = () => {
   const queryClient = useQueryClient()
   return useMutation({
      mutationFn: updateUserInfo,
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['user']
         })
         toast.success('Cập nhật thông tin thành công')
      },
      onError: () => {
         toast.error('Cập nhật thông tin thất bại')
      }
   })
}
export const useUploadAvatar = () => {
   const queryClient = useQueryClient()
   return useMutation({
      mutationFn: ({ id, file }: { id: number; file: File }) => uploadAvatar(id, file),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['user']
         })
         toast.success('Cập nhật ảnh đại diện thành công')
      },
      onError: () => {
         toast.error('Cập nhật ảnh đại diện thất bại')
      }
   })
}
export const useChangePassword = () => {
   return useMutation({
      mutationFn: ({ id, currentPassword }: { id: number; currentPassword: string }) =>
         changePassword(id, currentPassword),
      onSuccess: () => {
         toast.success('Yêu cầu đổi mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn để hoàn tất quá trình.')
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
         toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại')
      }
   })
}
