'use client'
import { useAppContext } from '@/context/app.context'
import { useChangePassword, useGetUserInfo, useUpdateUserInfo } from '@/queries/useUser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect, useRef } from 'react'
import type { User } from '@/types/auth.type'
import { useForm, Controller } from 'react-hook-form'
import { useUploadAvatar } from '@/queries/useUser'
import { Camera } from 'lucide-react'
import { toast } from 'react-toastify'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger
} from '@/components/ui/dialog'
import Image from 'next/image'

export default function Profile() {
   const { userId } = useAppContext()
   const { data } = useGetUserInfo(userId!)
   const userInfo = data?.data.data
   const [isEditing, setIsEditing] = useState(false)
   const { mutate } = useUpdateUserInfo()
   const { mutate: uploadAvatarMutate, isPending: isUploading } = useUploadAvatar()
   const fileInputRef = useRef<HTMLInputElement>(null)
   const { control, handleSubmit, reset, formState } = useForm<User>({
      defaultValues: userInfo || {}
   })

   const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
   const [currentPassword, setCurrentPassword] = useState('')
   const { mutate: changePasswordMutate, isPending: isChangingPassword } = useChangePassword()

   // Extract isDirty from formState to check if form has been modified
   const { isDirty } = formState

   // Reset form when userInfo changes (e.g., after initial data load)
   useEffect(() => {
      if (userInfo) {
         reset(userInfo)
      }
   }, [userInfo, reset])

   if (!userInfo) return null

   const handleEditClick = () => {
      setIsEditing(true)
      reset(userInfo) // Reset form with current user data
   }

   const handleCancelEdit = () => {
      setIsEditing(false)
      reset(userInfo) // Reset form to original values
   }

   const onSubmit = (data: User) => {
      mutate({ ...data, id: userId })
      setIsEditing(false)
   }

   const handleAvatarClick = () => {
      fileInputRef.current?.click()
   }

   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
         // Validate file type
         if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh')
            return
         }
         // Validate file size (e.g., max 5MB)
         if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước ảnh tối đa là 5MB')
            return
         }
         uploadAvatarMutate({ id: userId!, file })
      }
   }

   const handleChangePassword = () => {
      if (!currentPassword.trim()) {
         toast.error('Vui lòng nhập mật khẩu hiện tại')
         return
      }

      changePasswordMutate(
         { id: userId!, currentPassword },
         {
            onSuccess: () => {
               setIsChangePasswordOpen(false)
               setCurrentPassword('')
            }
         }
      )
   }

   return (
      <div className='container py-6 md:py-10'>
         <Card>
            <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
               <CardTitle>Thông tin cá nhân</CardTitle>
               <div className='flex flex-wrap gap-2'>
                  {isEditing ? (
                     <>
                        <Button variant='outline' size='sm' onClick={handleCancelEdit}>
                           <X size={16} className='mr-2' />
                           Hủy
                        </Button>
                        <Button
                           size='sm'
                           onClick={handleSubmit(onSubmit)}
                           disabled={!isDirty} // Disable button if no changes
                           className={!isDirty ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                           Lưu thay đổi
                        </Button>
                     </>
                  ) : (
                     <>
                        <Button
                           variant='outline'
                           size='sm'
                           className='flex items-center gap-2'
                           onClick={handleEditClick}
                        >
                           <Pencil size={16} />
                           Chỉnh sửa
                        </Button>
                        <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                           <DialogTrigger asChild>
                              <Button variant='outline' size='sm'>
                                 Đổi mật khẩu
                              </Button>
                           </DialogTrigger>
                           <DialogContent>
                              <DialogHeader>
                                 <DialogTitle>Đổi mật khẩu</DialogTitle>
                                 <DialogDescription>
                                    Nhập mật khẩu hiện tại của bạn. Chúng tôi sẽ gửi email hướng dẫn đổi mật khẩu mới.
                                 </DialogDescription>
                              </DialogHeader>
                              <div className='space-y-4 py-4'>
                                 <div className='space-y-2'>
                                    <Label htmlFor='current-password'>Mật khẩu hiện tại</Label>
                                    <Input
                                       id='current-password'
                                       type='password'
                                       isPassword
                                       value={currentPassword}
                                       onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                 </div>
                              </div>
                              <DialogFooter>
                                 <Button
                                    variant='outline'
                                    onClick={() => setIsChangePasswordOpen(false)}
                                    disabled={isChangingPassword}
                                 >
                                    Hủy
                                 </Button>
                                 <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                                    {isChangingPassword ? 'Đang xử lý...' : 'Tiếp tục'}
                                 </Button>
                              </DialogFooter>
                           </DialogContent>
                        </Dialog>
                     </>
                  )}
               </div>
            </CardHeader>
            <CardContent>
               <div className='flex flex-col md:flex-row gap-8'>
                  {/* Avatar và thông tin cơ bản */}
                  <div className='w-full md:w-1/3 flex flex-col items-center gap-4 mb-6 md:mb-0'>
                     <div className='relative group rounded-full overflow-hidden'>
                        <Image
                           src={userInfo.picture || 'https://cdn-icons-png.freepik.com/512/3607/3607444.png'}
                           alt=''
                           className='w-32 h-32 md:w-40 md:h-40 rounded-full'
                           width={40}
                           height={40}
                        />
                        {isUploading ? (
                           <div className='absolute inset-0 flex items-center justify-center'>
                              <div className='w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin' />
                           </div>
                        ) : (
                           <button
                              onClick={handleAvatarClick}
                              disabled={isUploading}
                              className='absolute hidden group-hover:flex inset-0 bg-black/20 items-center justify-center'
                           >
                              <Camera size={40} className='text-white' />
                           </button>
                        )}

                        <input
                           ref={fileInputRef}
                           type='file'
                           accept='image/*'
                           className='hidden'
                           onChange={handleFileChange}
                        />
                     </div>
                     <div className='text-center'>
                        <h2 className='text-xl md:text-2xl font-semibold'>
                           {userInfo.surName} {userInfo.lastName}
                        </h2>
                        <p className='text-muted-foreground'>{userInfo.email}</p>
                        <Badge variant={userInfo.active ? 'default' : 'secondary'} className='mt-2'>
                           {userInfo.active ? 'Đang hoạt động' : 'Không hoạt động'}
                        </Badge>
                     </div>
                  </div>

                  {/* Chi tiết thông tin */}
                  <div className='w-full md:w-2/3'>
                     <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6'>
                        {isEditing ? (
                           <>
                              <div className='space-y-2'>
                                 <Label htmlFor='surName'>Họ</Label>
                                 <Controller
                                    name='surName'
                                    control={control}
                                    render={({ field }) => <Input {...field} />}
                                 />
                              </div>
                              <div className='space-y-2'>
                                 <Label htmlFor='lastName'>Tên</Label>
                                 <Controller
                                    name='lastName'
                                    control={control}
                                    render={({ field }) => <Input {...field} />}
                                 />
                              </div>
                              <div className='space-y-2'>
                                 <Label htmlFor='phone'>Số điện thoại</Label>
                                 <Controller
                                    name='phone'
                                    control={control}
                                    render={({ field }) => <Input {...field} />}
                                 />
                              </div>
                              <div className='space-y-2'>
                                 <Label htmlFor='address'>Địa chỉ</Label>
                                 <Controller
                                    name='address'
                                    control={control}
                                    render={({ field }) => <Input {...field} />}
                                 />
                              </div>
                              <div className='space-y-2'>
                                 <Label>Ngày sinh</Label>
                                 <Controller
                                    name='dateOfBirth'
                                    control={control}
                                    render={({ field }) => (
                                       <DatePicker
                                          value={field.value ? new Date(field.value) : undefined}
                                          onChange={(date) => {
                                             if (date) {
                                                // Adjust for timezone to prevent date shift
                                                const localDate = new Date(
                                                   date.getTime() - date.getTimezoneOffset() * 60000
                                                )
                                                field.onChange(localDate.toISOString().split('T')[0])
                                             } else {
                                                field.onChange('')
                                             }
                                          }}
                                       />
                                    )}
                                 />
                              </div>
                              <div className='space-y-2'>
                                 <Label>Giới tính</Label>
                                 <Controller
                                    name='gender'
                                    control={control}
                                    render={({ field }) => (
                                       <Select value={field.value} onValueChange={field.onChange}>
                                          <SelectTrigger>
                                             <SelectValue placeholder='Chọn giới tính' />
                                          </SelectTrigger>
                                          <SelectContent>
                                             <SelectItem value='male'>Nam</SelectItem>
                                             <SelectItem value='female'>Nữ</SelectItem>
                                             <SelectItem value='other'>Khác</SelectItem>
                                          </SelectContent>
                                       </Select>
                                    )}
                                 />
                              </div>
                           </>
                        ) : (
                           <>
                              <InfoItem label='Tên đăng nhập' value={userInfo.userName} />
                              <InfoItem label='Vai trò' value={userInfo.role ? 'Admin' : 'Người dùng'} />
                              <InfoItem label='Số điện thoại' value={userInfo.phone || 'Chưa cập nhật'} />
                              <InfoItem
                                 label='Ngày tham gia'
                                 value={format(new Date(userInfo.createAt), 'dd/MM/yyyy')}
                              />
                              <InfoItem label='Địa chỉ' value={userInfo.address || 'Chưa cập nhật'} />
                              <InfoItem
                                 label='Ngày sinh'
                                 value={
                                    userInfo.dateOfBirth
                                       ? format(new Date(userInfo.dateOfBirth + 'T00:00:00'), 'dd/MM/yyyy')
                                       : 'Chưa cập nhật'
                                 }
                              />
                              <InfoItem
                                 label='Giới tính'
                                 value={
                                    userInfo.gender === 'male' ? 'Nam' : userInfo.gender === 'female' ? 'Nữ' : 'Khác'
                                 }
                              />
                              <InfoItem label='Số lần đăng nhập' value={userInfo.loginTimes.toString()} />
                           </>
                        )}
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
   )
}

function InfoItem({ label, value }: { label: string; value: string }) {
   return (
      <div className='space-y-1 p-3 bg-muted/30 rounded-md'>
         <p className='text-sm text-muted-foreground'>{label}</p>
         <p className='font-medium'>{value}</p>
      </div>
   )
}
