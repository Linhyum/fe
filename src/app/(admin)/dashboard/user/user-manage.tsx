'use client'
import { useCreateUser, useGetAllUser, useUpdateUser } from '@/queries/useAdmin'
import type React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Edit, Plus, Search } from 'lucide-react'
import type { UserType } from '@/types/admin.type'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Paginate from '@/components/paginate'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'

export default function UserManage() {
   const [currentPage, setCurrentPage] = useState<number>(1)
   const [queryParams, setQueryParams] = useState({
      page: currentPage - 1,
      size: 10,
      sortBy: 'id',
      sortDir: 'desc',
      search: '',
      role: undefined as boolean | undefined
   })

   const getAllUser = useGetAllUser(queryParams)
   const users = getAllUser.data?.data.data.content || []
   const totalPages = getAllUser.data?.data.data.totalPages || 0

   const updateUser = useUpdateUser()
   const createUser = useCreateUser()

   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
   const [editingUser, setEditingUser] = useState<UserType | null>(null)
   const [newUser, setNewUser] = useState<Partial<UserType & { password: string }>>({
      surName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      userName: '',
      dateOfBirth: '',
      gender: 'male'
   })
   const [searchTerm, setSearchTerm] = useState('')

   // Cập nhật page trong queryParams khi currentPage thay đổi
   useEffect(() => {
      setQueryParams((prev) => ({
         ...prev,
         page: currentPage - 1
      }))
   }, [currentPage])

   const handlePageClick = (e: { selected: number }) => {
      setCurrentPage(e.selected + 1)
   }

   const handleSortChange = (value: string) => {
      const [newSortBy, newSortDir] = value.split('-')
      // Reset về trang 1 khi thay đổi filter
      setCurrentPage(1)
      setQueryParams({
         ...queryParams,
         page: 0,
         sortBy: newSortBy,
         sortDir: newSortDir
      })
   }

   const handlePageSizeChange = (value: string) => {
      const newSize = Number(value)
      // Reset về trang 1 khi thay đổi số lượng hiển thị
      setCurrentPage(1)
      setQueryParams({
         ...queryParams,
         page: 0,
         size: newSize
      })
   }

   const handleRoleFilterChange = (value: string) => {
      let roleValue: boolean | undefined = undefined
      if (value === 'admin') roleValue = true
      if (value === 'user') roleValue = false

      setCurrentPage(1)
      setQueryParams({
         ...queryParams,
         page: 0,
         role: roleValue
      })
   }

   const handleSearch = () => {
      setCurrentPage(1)
      setQueryParams({
         ...queryParams,
         page: 0,
         search: searchTerm.trim()
      })
   }

   const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
         handleSearch()
      }
   }

   const handleClearSearch = () => {
      setSearchTerm('')
      setCurrentPage(1)
      setQueryParams({
         ...queryParams,
         page: 0,
         search: ''
      })
   }

   const openEditDialog = (user: UserType) => {
      setEditingUser({ ...user })
      setIsEditDialogOpen(true)
   }

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      if (editingUser) {
         setEditingUser({
            ...editingUser,
            [name]: value
         })
      }
   }

   const handleNewUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setNewUser({
         ...newUser,
         [name]: value
      })
   }

   const handleRoleChange = (value: string) => {
      if (editingUser) {
         setEditingUser({
            ...editingUser,
            role: value === 'admin'
         })
      }
   }

   const handleNewUserRoleChange = (value: string) => {
      setNewUser({
         ...newUser,
         role: value === 'admin'
      })
   }

   const handleGenderChange = (value: string) => {
      if (editingUser) {
         setEditingUser({
            ...editingUser,
            gender: value
         })
      }
   }

   const handleNewUserGenderChange = (value: string) => {
      setNewUser({
         ...newUser,
         gender: value
      })
   }

   const handleDateOfBirthChange = (date: Date | undefined) => {
      if (editingUser) {
         setEditingUser({
            ...editingUser,
            dateOfBirth: date?.toISOString().split('T')[0] || ''
         })
      }
   }

   const handleNewUserDateOfBirthChange = (date: Date | undefined) => {
      setNewUser({
         ...newUser,
         dateOfBirth: date?.toISOString().split('T')[0] || ''
      })
   }

   const handleStatusChange = (checked: boolean) => {
      if (editingUser) {
         setEditingUser({
            ...editingUser,
            active: checked ? 1 : 0
         })
      }
   }

   const handleNewUserStatusChange = (checked: boolean) => {
      setNewUser({
         ...newUser,
         active: checked ? 1 : 0
      })
   }

   const handleSaveUser = () => {
      if (!editingUser) return

      // Validate required fields
      if (!editingUser.surName?.trim() || !editingUser.lastName?.trim() || !editingUser.email?.trim()) {
         toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
         return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(editingUser.email)) {
         toast.error('Email không hợp lệ')
         return
      }

      // Validate phone format if provided
      if (editingUser.phone && !/^[0-9]{10,11}$/.test(editingUser.phone)) {
         toast.error('Số điện thoại không hợp lệ (10-11 số)')
         return
      }

      updateUser.mutate(editingUser, {
         onSuccess: () => {
            setIsEditDialogOpen(false)
            setEditingUser(null)
            getAllUser.refetch()
         }
      })
   }

   const handleAddUser = () => {
      // Validate required fields
      if (
         !newUser.surName?.trim() ||
         !newUser.lastName?.trim() ||
         !newUser.email?.trim() ||
         !newUser.password?.trim()
      ) {
         toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
         return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!newUser.email || !emailRegex.test(newUser.email)) {
         toast.error('Email không hợp lệ')
         return
      }

      // Validate phone format if provided
      if (newUser.phone && !/^[0-9]{10,11}$/.test(newUser.phone)) {
         toast.error('Số điện thoại không hợp lệ (10-11 số)')
         return
      }

      // Validate password length
      if (!newUser.password || newUser.password.length < 6) {
         toast.error('Mật khẩu phải có ít nhất 6 ký tự')
         return
      }

      createUser.mutate(newUser as UserType, {
         onSuccess: () => {
            setIsAddDialogOpen(false)
            setNewUser({
               surName: '',
               lastName: '',
               email: '',
               phone: '',
               address: '',
               password: '',
               userName: '',
               dateOfBirth: '',
               gender: 'male'
            })
            getAllUser.refetch()
         }
      })
   }

   const formatDate = (dateString: string) => {
      try {
         return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi })
      } catch (error) {
         return 'Không xác định'
      }
   }

   const formatDateOfBirth = (dateString: string) => {
      try {
         return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
      } catch (error) {
         return 'Không xác định'
      }
   }

   const getGenderLabel = (gender: string) => {
      switch (gender) {
         case 'male':
            return 'Nam'
         case 'female':
            return 'Nữ'
         case 'other':
            return 'Khác'
         default:
            return 'Không xác định'
      }
   }

   return (
      <div className='container mx-auto p-6'>
         <div className='flex items-center justify-between flex-wrap gap-3'>
            <h1 className='text-2xl font-bold'>Quản lý người dùng</h1>
            <Button onClick={() => setIsAddDialogOpen(true)}>
               <Plus className='mr-2 h-4 w-4' /> Thêm người dùng
            </Button>
         </div>
         <div className='flex items-center flex-wrap gap-4 my-5'>
            <div className='flex items-center gap-2'>
               <Input
                  placeholder='Tìm kiếm theo tên, email...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className='sm:w-[250px]'
               />
               <Button className='h-10 w-10 flex-shrink-0' onClick={handleSearch} size='icon' variant='outline'>
                  <Search />
               </Button>
               {queryParams.search && (
                  <Button onClick={handleClearSearch} variant='ghost' size='sm'>
                     Xóa
                  </Button>
               )}
            </div>
            <div className='flex items-center gap-2'>
               <span className='text-sm'>Vai trò:</span>
               <Select
                  value={queryParams.role === undefined ? 'all' : queryParams.role ? 'admin' : 'user'}
                  onValueChange={handleRoleFilterChange}
               >
                  <SelectTrigger className='w-[120px]'>
                     <SelectValue placeholder='Tất cả' />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value='all'>Tất cả</SelectItem>
                     <SelectItem value='admin'>Admin</SelectItem>
                     <SelectItem value='user'>Người dùng</SelectItem>
                  </SelectContent>
               </Select>
            </div>
            <div className='flex items-center gap-2'>
               <span className='text-sm'>Hiển thị:</span>
               <Select value={queryParams.size.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className='w-[80px]'>
                     <SelectValue placeholder='10' />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value='5'>5</SelectItem>
                     <SelectItem value='10'>10</SelectItem>
                     <SelectItem value='20'>20</SelectItem>
                     <SelectItem value='50'>50</SelectItem>
                  </SelectContent>
               </Select>
            </div>
            <div className='flex items-center gap-2'>
               <span className='text-sm'>Sắp xếp:</span>
               <Select value={`${queryParams.sortBy}-${queryParams.sortDir}`} onValueChange={handleSortChange}>
                  <SelectTrigger className='w-[180px]'>
                     <SelectValue placeholder='Mới nhất' />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value='id-desc'>Mới nhất</SelectItem>
                     <SelectItem value='id-asc'>Cũ nhất</SelectItem>
                     <SelectItem value='lastName-asc'>Tên A-Z</SelectItem>
                     <SelectItem value='lastName-desc'>Tên Z-A</SelectItem>
                     <SelectItem value='email-asc'>Email A-Z</SelectItem>
                     <SelectItem value='email-desc'>Email Z-A</SelectItem>
                  </SelectContent>
               </Select>
            </div>
         </div>

         {getAllUser.isLoading ? (
            <div className='text-center py-4'>Đang tải...</div>
         ) : (
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className='w-[80px]'>ID</TableHead>
                     <TableHead>Họ tên</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>Vai trò</TableHead>
                     <TableHead>Trạng thái</TableHead>
                     <TableHead>Ngày tạo</TableHead>
                     <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {users.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={7} className='text-center'>
                           Không có người dùng nào
                        </TableCell>
                     </TableRow>
                  ) : (
                     users.map((user) => (
                        <TableRow key={user.id}>
                           <TableCell>{user.id}</TableCell>
                           <TableCell className='font-medium'>
                              {user.surName} {user.lastName}
                           </TableCell>
                           <TableCell>{user.email}</TableCell>
                           <TableCell>
                              {user.role ? (
                                 <span className='px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs'>
                                    Admin
                                 </span>
                              ) : (
                                 <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
                                    Người dùng
                                 </span>
                              )}
                           </TableCell>
                           <TableCell>
                              {user.active ? (
                                 <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                                    Hoạt động
                                 </span>
                              ) : (
                                 <span className='px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs'>Bị khóa</span>
                              )}
                           </TableCell>
                           <TableCell>{formatDate(user.createAt)}</TableCell>
                           <TableCell className='text-right'>
                              <Button
                                 variant='outline'
                                 size='icon'
                                 onClick={() => openEditDialog(user)}
                                 className='mr-2'
                              >
                                 <Edit className='h-4 w-4' />
                              </Button>
                           </TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         )}

         {totalPages > 1 && (
            <div className='mt-4 flex justify-center'>
               <Paginate
                  totalPages={totalPages}
                  handlePageClick={handlePageClick}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
               />
            </div>
         )}

         {/* Dialog thêm người dùng mới */}
         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6'>
               <DialogHeader>
                  <DialogTitle>Thêm người dùng mới</DialogTitle>
               </DialogHeader>
               <div className='grid gap-4 py-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                     <div>
                        <Label htmlFor='newSurName' className='text-sm'>
                           Họ <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                           id='newSurName'
                           name='surName'
                           value={newUser.surName || ''}
                           onChange={handleNewUserInputChange}
                           className='mt-1'
                        />
                     </div>
                     <div>
                        <Label htmlFor='newLastName' className='text-sm'>
                           Tên <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                           id='newLastName'
                           name='lastName'
                           value={newUser.lastName || ''}
                           onChange={handleNewUserInputChange}
                           className='mt-1'
                        />
                     </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                     <div>
                        <Label htmlFor='userName' className='text-sm'>
                           Tên đăng nhập <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                           id='userName'
                           name='userName'
                           type='text'
                           value={newUser.userName || ''}
                           onChange={handleNewUserInputChange}
                           className='mt-1'
                        />
                     </div>

                     <div>
                        <Label htmlFor='newEmail' className='text-sm'>
                           Email <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                           id='newEmail'
                           name='email'
                           type='email'
                           value={newUser.email || ''}
                           onChange={handleNewUserInputChange}
                           className='mt-1'
                        />
                     </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                     <div>
                        <Label htmlFor='newPassword' className='text-sm'>
                           Mật khẩu <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                           id='newPassword'
                           name='password'
                           type='password'
                           isPassword
                           value={newUser.password || ''}
                           onChange={handleNewUserInputChange}
                           className='mt-1'
                        />
                        <p className='text-xs text-gray-500 mt-1'>Mật khẩu phải có ít nhất 6 ký tự</p>
                     </div>

                     <div>
                        <Label htmlFor='newPhone' className='text-sm'>
                           Số điện thoại
                        </Label>
                        <Input
                           id='newPhone'
                           name='phone'
                           value={newUser.phone || ''}
                           onChange={handleNewUserInputChange}
                           className='mt-1'
                        />
                     </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                     <div>
                        <Label htmlFor='newAddress' className='text-sm'>
                           Địa chỉ
                        </Label>
                        <Input
                           id='newAddress'
                           name='address'
                           value={newUser.address || ''}
                           onChange={handleNewUserInputChange}
                           className='mt-1'
                        />
                     </div>

                     <div>
                        <Label className='text-sm'>Ngày sinh</Label>
                        <DatePicker
                           value={newUser.dateOfBirth ? new Date(newUser.dateOfBirth) : undefined}
                           onChange={handleNewUserDateOfBirthChange}
                        />
                     </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                     <div>
                        <Label className='text-sm'>Giới tính</Label>
                        <Select onValueChange={handleNewUserGenderChange} defaultValue={newUser.gender || 'male'}>
                           <SelectTrigger className='mt-1'>
                              <SelectValue placeholder='Chọn giới tính' />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value='male'>Nam</SelectItem>
                              <SelectItem value='female'>Nữ</SelectItem>
                              <SelectItem value='other'>Khác</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className='flex items-center mt-5 gap-2'>
                        <Switch
                           id='newActive'
                           checked={newUser.active === 1}
                           onCheckedChange={handleNewUserStatusChange}
                        />
                        <Label htmlFor='newActive' className='text-sm'>
                           {newUser.active === 1 ? 'Hoạt động' : 'Bị khóa'}
                        </Label>
                     </div>
                  </div>
               </div>

               <DialogFooter>
                  <Button className='sm:mt-0 mt-3' variant='outline' onClick={() => setIsAddDialogOpen(false)}>
                     Hủy
                  </Button>
                  <Button onClick={handleAddUser} disabled={createUser.isPending}>
                     {createUser.isPending ? 'Đang xử lý...' : 'Thêm người dùng'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Dialog chỉnh sửa người dùng */}
         <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-auto'>
               <DialogHeader>
                  <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
               </DialogHeader>

               {editingUser && (
                  <div className='grid gap-4 py-4'>
                     <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                           <Label htmlFor='surName' className='text-sm'>
                              Họ
                           </Label>
                           <Input
                              id='surName'
                              name='surName'
                              value={editingUser.surName || ''}
                              onChange={handleInputChange}
                              className='mt-1'
                           />
                        </div>
                        <div>
                           <Label htmlFor='lastName' className='text-sm'>
                              Tên
                           </Label>
                           <Input
                              id='lastName'
                              name='lastName'
                              value={editingUser.lastName || ''}
                              onChange={handleInputChange}
                              className='mt-1'
                           />
                        </div>
                     </div>

                     <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                           <Label htmlFor='editUserName' className='text-sm'>
                              Tên đăng nhập
                           </Label>
                           <Input
                              id='editUserName'
                              name='userName'
                              value={editingUser.userName || ''}
                              onChange={handleInputChange}
                              className='mt-1'
                           />
                        </div>
                        <div>
                           <Label htmlFor='email' className='text-sm'>
                              Email
                           </Label>
                           <Input
                              id='email'
                              name='email'
                              value={editingUser.email || ''}
                              onChange={handleInputChange}
                              className='mt-1'
                           />
                        </div>
                     </div>

                     <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                           <Label htmlFor='phone' className='text-sm'>
                              Số điện thoại
                           </Label>
                           <Input
                              id='phone'
                              name='phone'
                              value={editingUser.phone || ''}
                              onChange={handleInputChange}
                              className='mt-1'
                           />
                        </div>

                        <div>
                           <Label htmlFor='address' className='text-sm'>
                              Địa chỉ
                           </Label>
                           <Input
                              id='address'
                              name='address'
                              value={editingUser.address || ''}
                              onChange={handleInputChange}
                              className='mt-1'
                           />
                        </div>
                     </div>

                     <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                           <Label className='text-sm'>Ngày sinh</Label>
                           <DatePicker
                              value={editingUser.dateOfBirth ? new Date(editingUser.dateOfBirth) : undefined}
                              onChange={handleDateOfBirthChange}
                           />
                        </div>

                        <div>
                           <Label className='text-sm'>Giới tính</Label>
                           <Select onValueChange={handleGenderChange} defaultValue={editingUser.gender || 'male'}>
                              <SelectTrigger className='mt-1'>
                                 <SelectValue placeholder='Chọn giới tính' />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value='male'>Nam</SelectItem>
                                 <SelectItem value='female'>Nữ</SelectItem>
                                 <SelectItem value='other'>Khác</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                     </div>

                     <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                           <Label className='text-sm'>Vai trò</Label>
                           <Select onValueChange={handleRoleChange} defaultValue={editingUser.role ? 'admin' : 'user'}>
                              <SelectTrigger className='mt-1'>
                                 <SelectValue placeholder='Chọn vai trò' />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value='user'>Người dùng</SelectItem>
                                 <SelectItem value='admin'>Admin</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>

                        <div className='flex items-center gap-2 mt-6'>
                           <Switch
                              id='active'
                              checked={editingUser.active === 1 ? true : false}
                              onCheckedChange={handleStatusChange}
                           />
                           <Label htmlFor='active' className='text-sm'>
                              {editingUser.active ? 'Hoạt động' : 'Bị khóa'}
                           </Label>
                        </div>
                     </div>
                  </div>
               )}

               <DialogFooter>
                  <Button className='sm:mt-0 mt-3' variant='outline' onClick={() => setIsEditDialogOpen(false)}>
                     Hủy
                  </Button>
                  <Button onClick={handleSaveUser} disabled={updateUser.isPending}>
                     {updateUser.isPending ? 'Đang xử lý...' : 'Lưu thay đổi'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   )
}
