'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { handleOAuth2Redirect } from '@/apiRequest/auth'
import { useAppContext } from '@/context/app.context'
import { toast } from 'react-toastify'
import { http } from '@/lib/http'

export default function OAuth2Callback() {
   const router = useRouter()
   const searchParams = useSearchParams()
   const { setUserId } = useAppContext()
   const [isProcessing, setIsProcessing] = useState(false)

   useEffect(() => {
      if (isProcessing) return

      const token = searchParams?.get('token')
      const refreshToken = searchParams?.get('refreshToken')
      const error = searchParams?.get('error')

      if (!token || !refreshToken) {
         if (error) {
            toast.error(decodeURIComponent(error))
         }
         router.push('/login')
         return
      }

      setIsProcessing(true)

      // Cập nhật token trong http instance
      http.setAccessToken(token)
      http.setRefreshToken(refreshToken)

      // Gọi API để lấy thông tin người dùng
      handleOAuth2Redirect(token, refreshToken)
         .then((response) => {
            // Kiểm tra cấu trúc phản hồi
            if (response.data.data) {
               setUserId(response.data.data.user.id)
               toast.success('Đăng nhập thành công')
               router.push('/')
            } else {
               toast.error(response.data.message || 'Đăng nhập thất bại')
               router.push('/login')
            }
         })
         .catch((error) => {
            console.error('OAuth login error:', error)
            toast.error('Đăng nhập thất bại')
            router.push('/login')
         })
   }, [searchParams, router, setUserId, isProcessing])

   return (
      <div className='flex items-center justify-center min-h-screen'>
         <div className='text-center'>
            <h1 className='text-2xl font-bold mb-4'>Đang xử lý đăng nhập...</h1>
            <p>Vui lòng đợi trong giây lát.</p>
            <div className='mt-4 w-12 h-12 border-4 border-primaryColor border-t-transparent rounded-full animate-spin mx-auto'></div>
         </div>
      </div>
   )
}
