'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginBody, LoginBodyType } from '@/schemaValidations/auth.schema'
import Link from 'next/link'
import { useLogin } from '@/queries/useAuth'
import { useAppContext } from '@/context/app.context'
import { Button } from '@/components/ui/button'
import { get } from 'http'
import { getGoogleAuthUrl, getDiscordAuthUrl } from '@/apiRequest/auth'

export default function Login() {
   const { setUserId } = useAppContext()
   const { mutate, isPending } = useLogin()
   const form = useForm<LoginBodyType>({
      resolver: zodResolver(LoginBody),
      defaultValues: {
         userName: '',
         password: ''
      }
   })

   const onSubmit = (data: LoginBodyType) => {
      mutate(data, {
         onSuccess: (res) => {
            setUserId(res.data.data.user.id)
         }
      })
   }

   const handleGoogleLogin = () => {
      window.location.href = getGoogleAuthUrl()
   }

   const handleDiscordLogin = () => {
      window.location.href = getDiscordAuthUrl()
   }

   return (
      <div className='flex items-center justify-center h-screen'>
         <Card className='w-[400px]'>
            <CardHeader>
               <CardTitle className='text-2xl'>Đăng nhập</CardTitle>
               <CardDescription>Nhập tên đăng nhập và mật khẩu của bạn để đăng nhập vào hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
               <Form {...form}>
                  <form className='space-y-3' noValidate onSubmit={form.handleSubmit(onSubmit)}>
                     <FormField
                        control={form.control}
                        name='userName'
                        render={({ field }) => (
                           <FormItem>
                              <div className='grid gap-2'>
                                 <Label htmlFor='userName'>Tên đăng nhập</Label>
                                 <Input id='userName' type='text' required {...field} />
                                 <FormMessage />
                              </div>
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                           <FormItem>
                              <div className='grid gap-2'>
                                 <Label htmlFor='password'>Mật khẩu</Label>
                                 <Input id='password' type='password' isPassword required {...field} />
                                 <FormMessage />
                              </div>
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
                              Đang đăng nhập...
                           </div>
                        ) : (
                           'Đăng nhập'
                        )}
                     </button>

                     <div className='relative'>
                        <div className='absolute inset-0 flex items-center'>
                           <span className='w-full border-t' />
                        </div>
                        <div className='relative flex justify-center text-xs uppercase'>
                           <span className='bg-background px-2 text-muted-foreground'>Hoặc đăng nhập với</span>
                        </div>
                     </div>

                     <div className='grid grid-cols-2 gap-3'>
                        <Button
                           type='button'
                           variant={'outline'}
                           className='flex items-center justify-center gap-2 h-9 px-4 border rounded '
                           onClick={handleGoogleLogin}
                        >
                           <svg className='w-4 h-4' viewBox='0 0 48 48'>
                              <path
                                 fill='#FFC107'
                                 d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'
                              />
                              <path
                                 fill='#FF3D00'
                                 d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'
                              />
                              <path
                                 fill='#4CAF50'
                                 d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'
                              />
                              <path
                                 fill='#1976D2'
                                 d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'
                              />
                           </svg>
                           Google
                        </Button>

                        <Button
                           type='button'
                           variant={'outline'}
                           className='flex items-center justify-center gap-2 h-9 px-4 border rounded'
                           onClick={handleDiscordLogin}
                        >
                           <svg
                              viewBox='0 0 256 199'
                              width='1em'
                              height='1em'
                              xmlns='http://www.w3.org/2000/svg'
                              preserveAspectRatio='xMidYMid'
                           >
                              <path
                                 d='M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z'
                                 fill='#5865F2'
                              />
                           </svg>
                           Discord
                        </Button>
                     </div>

                     <div className='text-center text-sm'>
                        Chưa có tài khoản?{' '}
                        <Link className='text-primaryColor hover:underline' href={'/register'}>
                           Đăng ký
                        </Link>{' '}
                        |{' '}
                        <Link className='text-primaryColor hover:underline' href={'/forgot-password'}>
                           Quên mật khẩu
                        </Link>
                     </div>
                  </form>
               </Form>
            </CardContent>
         </Card>
      </div>
   )
}
