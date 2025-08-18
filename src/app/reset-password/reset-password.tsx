'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useResetPassword } from '@/queries/useAuth'
import { useSearchParams } from 'next/navigation'

const ResetPasswordSchema = z
   .object({
      newPassword: z
         .string()
         .min(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự' })
         .max(100, { message: 'Mật khẩu không được quá 100 kí tự' }),
      confirmPassword: z.string()
   })
   .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Mật khẩu không khớp',
      path: ['confirmPassword']
   })

type ResetPasswordType = z.infer<typeof ResetPasswordSchema>

export default function ResetPassword() {
   const searchParams = useSearchParams()
   const token = searchParams?.get('token')
   const { mutate, isPending } = useResetPassword()

   const form = useForm<ResetPasswordType>({
      resolver: zodResolver(ResetPasswordSchema),
      defaultValues: {
         newPassword: '',
         confirmPassword: ''
      }
   })

   const onSubmit = (data: ResetPasswordType) => {
      if (!token) return
      mutate({ token, newPassword: data.newPassword })
   }

   if (!token) {
      return (
         <div className='flex items-center justify-center min-h-screen p-4'>
            <Card className='w-full max-w-md'>
               <CardHeader>
                  <CardTitle className='text-2xl text-red-500'>Lỗi</CardTitle>
                  <CardDescription>Token không hợp lệ</CardDescription>
               </CardHeader>
            </Card>
         </div>
      )
   }

   return (
      <div className='flex items-center justify-center min-h-screen p-4'>
         <Card className='w-full max-w-md'>
            <CardHeader>
               <CardTitle className='text-2xl'>Đặt lại mật khẩu</CardTitle>
               <CardDescription>Nhập mật khẩu mới của bạn</CardDescription>
            </CardHeader>
            <CardContent>
               <Form {...form}>
                  <form className='space-y-4' noValidate onSubmit={form.handleSubmit(onSubmit)}>
                     <FormField
                        control={form.control}
                        name='newPassword'
                        render={({ field }) => (
                           <FormItem>
                              <Label>Mật khẩu mới</Label>
                              <Input type='password' isPassword {...field} />
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name='confirmPassword'
                        render={({ field }) => (
                           <FormItem>
                              <Label>Xác nhận mật khẩu</Label>
                              <Input type='password' isPassword {...field} />
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     <button
                        disabled={isPending}
                        type='submit'
                        className='w-full bg-primaryColor text-white h-9 rounded button-primary'
                     >
                        {isPending ? (
                           <div className='flex items-center justify-center gap-2'>
                              <div className='w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent'></div>
                              Đang xử lý...
                           </div>
                        ) : (
                           'Đặt lại mật khẩu'
                        )}
                     </button>
                  </form>
               </Form>
            </CardContent>
         </Card>
      </div>
   )
}
