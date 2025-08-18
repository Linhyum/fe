'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { z } from 'zod'
import { useForgotPassword } from '@/queries/useAuth'

const ForgotPasswordSchema = z.object({
   email: z.string().email('Email không hợp lệ')
})

type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPassword() {
   const { mutate, isPending } = useForgotPassword()
   const form = useForm<ForgotPasswordType>({
      resolver: zodResolver(ForgotPasswordSchema),
      defaultValues: {
         email: ''
      }
   })

   const onSubmit = (data: ForgotPasswordType) => {
      mutate(data.email)
   }

   return (
      <div className='flex items-center justify-center min-h-screen p-4'>
         <Card className='w-full max-w-md'>
            <CardHeader>
               <CardTitle className='text-2xl'>Quên mật khẩu</CardTitle>
               <CardDescription>Nhập email của bạn để đặt lại mật khẩu</CardDescription>
            </CardHeader>
            <CardContent>
               <Form {...form}>
                  <form className='space-y-4' noValidate onSubmit={form.handleSubmit(onSubmit)}>
                     <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                           <FormItem>
                              <Label>Email</Label>
                              <Input type='email' {...field} />
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
                              Đang gửi...
                           </div>
                        ) : (
                           'Gửi yêu cầu'
                        )}
                     </button>

                     <div className='text-center'>
                        <Link className='text-primaryColor hover:underline' href={'/login'}>
                           Quay lại đăng nhập
                        </Link>
                     </div>
                  </form>
               </Form>
            </CardContent>
         </Card>
      </div>
   )
}
