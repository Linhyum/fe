'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { RegisterBody, RegisterBodyType } from '@/schemaValidations/auth.schema'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { useRegister } from '@/queries/useAuth'

export default function Register() {
   const { mutate, isPending } = useRegister()
   const form = useForm<RegisterBodyType>({
      resolver: zodResolver(RegisterBody),
      defaultValues: {
         email: '',
         password: '',
         userName: '',
         phone: '',
         surName: '',
         lastName: '',
         address: '',
         dateOfBirth: '',
         gender: 'male'
      }
   })

   const onSubmit = async (data: RegisterBodyType) => {
      mutate(data)
   }

   return (
      <div className='flex items-center justify-center min-h-screen p-4'>
         <Card className='w-full max-w-2xl'>
            <CardHeader>
               <CardTitle className='text-2xl'>Đăng ký</CardTitle>
               <CardDescription>Nhập thông tin của bạn để đăng ký tài khoản</CardDescription>
            </CardHeader>
            <CardContent>
               <Form {...form}>
                  <form className='space-y-4' noValidate onSubmit={form.handleSubmit(onSubmit)}>
                     <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <FormField
                           control={form.control}
                           name='surName'
                           render={({ field }) => (
                              <FormItem>
                                 <Label>Họ</Label>
                                 <Input {...field} />
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                        <FormField
                           control={form.control}
                           name='lastName'
                           render={({ field }) => (
                              <FormItem>
                                 <Label>Tên</Label>
                                 <Input {...field} />
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     </div>
                     <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <FormField
                           control={form.control}
                           name='userName'
                           render={({ field }) => (
                              <FormItem>
                                 <Label>Tên đăng nhập</Label>
                                 <Input {...field} />
                                 <FormMessage />
                              </FormItem>
                           )}
                        />

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
                     </div>

                     <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <FormField
                           control={form.control}
                           name='password'
                           render={({ field }) => (
                              <FormItem>
                                 <Label>Mật khẩu</Label>
                                 <Input type='password' isPassword {...field} />
                                 <FormMessage />
                              </FormItem>
                           )}
                        />

                        <FormField
                           control={form.control}
                           name='phone'
                           render={({ field }) => (
                              <FormItem>
                                 <Label>Số điện thoại</Label>
                                 <Input type='tel' {...field} />
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     </div>

                     <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <FormField
                           control={form.control}
                           name='address'
                           render={({ field }) => (
                              <FormItem>
                                 <Label>Địa chỉ</Label>
                                 <Input {...field} />
                                 <FormMessage />
                              </FormItem>
                           )}
                        />

                        <FormField
                           control={form.control}
                           name='dateOfBirth'
                           render={({ field }) => (
                              <FormItem>
                                 <Label>Ngày sinh</Label>
                                 <DatePicker
                                    value={field.value ? new Date(field.value) : undefined}
                                    onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                                 />
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     </div>

                     <FormField
                        control={form.control}
                        name='gender'
                        render={({ field }) => (
                           <FormItem>
                              <Label>Giới tính</Label>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                 <SelectTrigger>
                                    <SelectValue placeholder='Chọn giới tính' />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value='male'>Nam</SelectItem>
                                    <SelectItem value='female'>Nữ</SelectItem>
                                    <SelectItem value='other'>Khác</SelectItem>
                                 </SelectContent>
                              </Select>
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
                              <div className='w-5 h-5 border-4 border-white rounded-full animate-spin border-t-transparent'></div>
                              Đang đăng ký...
                           </div>
                        ) : (
                           'Đăng ký'
                        )}
                     </button>

                     <div className='text-center'>
                        Đã có tài khoản?{' '}
                        <Link className='text-primaryColor hover:underline' href={'/login'}>
                           Đăng nhập
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
