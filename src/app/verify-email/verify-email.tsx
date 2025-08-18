'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useVerifyEmail } from '@/queries/useAuth'
import { CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React from 'react'

export default function VerityEmail() {
   const searchParams = useSearchParams()
   const token = searchParams?.get('token')
   const { isError, isLoading } = useVerifyEmail(token!)

   return (
      <div className='min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900'>
         <Card className='w-full max-w-md'>
            {isLoading ? (
               <CardContent className='pt-6'>
                  <div className='flex flex-col items-center justify-center space-y-4'>
                     <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
                     <p className='text-lg font-medium'>Đang xác thực email...</p>
                  </div>
               </CardContent>
            ) : isError ? (
               <>
                  <CardHeader className='space-y-1'>
                     <div className='flex justify-center'>
                        <XCircle className='w-16 h-16 text-destructive' />
                     </div>
                     <CardTitle className='text-2xl text-center text-destructive'>Xác thực thất bại</CardTitle>
                     <CardDescription className='text-center'>
                        Link xác thực không hợp lệ hoặc đã hết hạn
                     </CardDescription>
                  </CardHeader>
                  <CardContent className='flex flex-col items-center space-y-4'>
                     <p className='text-center text-muted-foreground'>
                        Vui lòng kiểm tra lại email hoặc liên hệ hỗ trợ nếu bạn cần giúp đỡ
                     </p>
                     <Button asChild className='w-full'>
                        <Link href='/login'>Quay lại trang đăng nhập</Link>
                     </Button>
                  </CardContent>
               </>
            ) : (
               <>
                  <CardHeader className='space-y-1'>
                     <div className='flex justify-center'>
                        <CheckCircle2 className='w-16 h-16 text-green-500' />
                     </div>
                     <CardTitle className='text-2xl text-center text-green-500'>Xác thực email thành công</CardTitle>
                     <CardDescription className='text-center'>Tài khoản của bạn đã được kích hoạt</CardDescription>
                  </CardHeader>
                  <CardContent className='flex flex-col items-center space-y-4'>
                     <p className='text-center text-muted-foreground'>
                        Bạn có thể đăng nhập và sử dụng tất cả các tính năng của hệ thống
                     </p>
                     <Button asChild className='w-full'>
                        <Link href='/login'>Đăng nhập ngay</Link>
                     </Button>
                  </CardContent>
               </>
            )}
         </Card>
      </div>
   )
}
