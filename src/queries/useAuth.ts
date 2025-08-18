import {
   registerAccount,
   forgotPassword,
   resetPassword,
   loginAccount,
   refreshToken,
   verifyEmail
} from '@/apiRequest/auth'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

export const useRegister = () => {
   return useMutation({
      mutationFn: registerAccount,
      onSuccess: () => {
         toast.success('Đăng ký thành công, vui lòng kiểm tra email để xác nhận tài khoản')
      },
      onError: () => {
         toast.error('Đăng ký thất bại')
      }
   })
}

export const useLogin = () => {
   const router = useRouter()
   return useMutation({
      mutationFn: loginAccount,
      onSuccess: () => {
         toast.success('Đăng nhập thành công')
         router.push('/')
      },
      onError: () => {
         toast.error('Đăng nhập thất bại')
      }
   })
}

export const useForgotPassword = () => {
   return useMutation({
      mutationFn: forgotPassword,
      onSuccess: () => {
         toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu')
      },
      onError: () => {
         toast.error('Gửi yêu cầu thất bại')
      }
   })
}

export const useResetPassword = () => {
   const router = useRouter()
   return useMutation({
      mutationFn: resetPassword,
      onSuccess: () => {
         toast.success('Đặt lại mật khẩu thành công')
         router.push('/login')
      },
      onError: () => {
         toast.error('Đặt lại mật khẩu thất bại')
      }
   })
}

export const useRefreshToken = () => {
   return useMutation({
      mutationFn: refreshToken,
      onSuccess: () => {
         toast.success('refreshToken thành công')
      },
      onError: () => {
         toast.error('refreshToken thất bại')
      }
   })
}

export const useVerifyEmail = (token: string) => {
   return useQuery({
      queryKey: ['verifyEmail', token],
      queryFn: () => verifyEmail(token),
      enabled: !!token
   })
}
