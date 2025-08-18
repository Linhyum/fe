'use client'
import { useCreateCategory, useGetAllCategories, useUpdateCategory } from '@/queries/useAdmin'
import type React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Edit, Plus, Search } from 'lucide-react'
import type { CategoryType, GetCategoryQueryParamsType } from '@/types/admin.type'
import { toast } from 'react-toastify'
import Paginate from '@/components/paginate'
import Image from 'next/image'

export default function CategoryManage() {
   const [currentPage, setCurrentPage] = useState<number>(1)
   const [queryParams, setQueryParams] = useState<GetCategoryQueryParamsType>({
      page: currentPage - 1,
      size: 10,
      sortBy: 'id',
      sortDir: 'desc',
      search: ''
   })
   const [searchTerm, setSearchTerm] = useState('')

   const createCategory = useCreateCategory()
   const updateCategory = useUpdateCategory()
   const getAllCategories = useGetAllCategories(queryParams)
   const categories = getAllCategories.data?.data.data.content || []
   const totalPages = getAllCategories.data?.data.data.totalPages || 0

   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
   const [newCategory, setNewCategory] = useState<CategoryType>({ id: 0, categoryName: '', status: true })
   const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null)
   const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null)
   const [editingCategoryImage, setEditingCategoryImage] = useState<File | null>(null)
   const [newCategoryImagePreview, setNewCategoryImagePreview] = useState<string | null>(null)
   const [editingCategoryImagePreview, setEditingCategoryImagePreview] = useState<string | null>(null)

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

   const handleAddCategory = () => {
      if (!newCategory.categoryName.trim()) {
         toast.error('Tên danh mục không được để trống')
         return
      }

      const formData = new FormData()
      formData.append(
         'category',
         JSON.stringify({
            categoryName: newCategory.categoryName,
            status: newCategory.status
         })
      )

      if (newCategoryImage) {
         formData.append('image', newCategoryImage)
      }

      //@ts-ignore
      createCategory.mutate(formData, {
         onSuccess: () => {
            setIsAddDialogOpen(false)
            setNewCategory({ id: 0, categoryName: '', status: true })
            setNewCategoryImage(null)
            // Clean up preview URL
            if (newCategoryImagePreview) {
               URL.revokeObjectURL(newCategoryImagePreview)
               setNewCategoryImagePreview(null)
            }
            getAllCategories.refetch()
         }
      })
   }

   const handleEditCategory = () => {
      if (!editingCategory || !editingCategory.categoryName.trim()) {
         toast.error('Tên danh mục không được để trống')
         return
      }

      const formData = new FormData()
      formData.append(
         'category',
         JSON.stringify({
            categoryName: editingCategory.categoryName,
            status: editingCategory.status
         })
      )

      if (editingCategoryImage) {
         formData.append('image', editingCategoryImage)
      }
      //@ts-ignore
      updateCategory.mutate(
         { body: formData as any, id: editingCategory.id },
         {
            onSuccess: () => {
               setIsEditDialogOpen(false)
               setEditingCategory(null)
               setEditingCategoryImage(null)
               // Clean up preview URL
               if (editingCategoryImagePreview) {
                  URL.revokeObjectURL(editingCategoryImagePreview)
                  setEditingCategoryImagePreview(null)
               }
               getAllCategories.refetch()
            }
         }
      )
   }

   const openEditDialog = (category: CategoryType) => {
      setEditingCategory({ ...category })
      setEditingCategoryImage(null)
      // Clean up any existing preview
      if (editingCategoryImagePreview) {
         URL.revokeObjectURL(editingCategoryImagePreview)
         setEditingCategoryImagePreview(null)
      }
      setIsEditDialogOpen(true)
   }

   return (
      <div className='container mx-auto p-6'>
         <div className='flex items-center justify-between flex-wrap gap-3'>
            <h1 className='text-2xl font-bold'>Quản lý danh mục</h1>
            <Button onClick={() => setIsAddDialogOpen(true)}>
               <Plus className='mr-2 h-4 w-4' /> Thêm danh mục
            </Button>
         </div>
         <div className='flex items-center flex-wrap gap-4 my-5'>
            <div className='flex items-center gap-2'>
               <Input
                  placeholder='Tìm kiếm danh mục...'
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
               <span className='text-sm'>Hiển thị:</span>
               <Select value={(queryParams.size ?? 10).toString()} onValueChange={handlePageSizeChange}>
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
                     <SelectItem value='categoryName-asc'>Tên A-Z</SelectItem>
                     <SelectItem value='categoryName-desc'>Tên Z-A</SelectItem>
                  </SelectContent>
               </Select>
            </div>
         </div>

         {getAllCategories.isLoading ? (
            <div className='text-center py-4'>Đang tải...</div>
         ) : (
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className='w-[100px]'>ID</TableHead>
                     <TableHead className='w-[100px]'>Hình ảnh</TableHead>
                     <TableHead>Tên danh mục</TableHead>
                     <TableHead>Trạng thái</TableHead>
                     <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {categories.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={4} className='text-center'>
                           Không có danh mục nào
                        </TableCell>
                     </TableRow>
                  ) : (
                     categories.map((category) => (
                        <TableRow key={category.id}>
                           <TableCell>{category.id}</TableCell>
                           <TableCell>
                              {/* @ts-ignore */}
                              <Image
                                 src={category.imageUrl || '/placeholder.svg'}
                                 alt={category.categoryName}
                                 width={40}
                                 height={40}
                              />
                           </TableCell>
                           <TableCell>{category.categoryName}</TableCell>
                           <TableCell>
                              {category.status ? (
                                 <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                                    Hoạt động
                                 </span>
                              ) : (
                                 <span className='px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs'>
                                    Không hoạt động
                                 </span>
                              )}
                           </TableCell>
                           <TableCell className='text-right'>
                              <Button
                                 variant='outline'
                                 size='icon'
                                 onClick={() => openEditDialog(category)}
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

         {/* Dialog thêm danh mục */}
         <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
               setIsAddDialogOpen(open)
               if (!open) {
                  // Clean up preview when dialog closes
                  if (newCategoryImagePreview) {
                     URL.revokeObjectURL(newCategoryImagePreview)
                     setNewCategoryImagePreview(null)
                  }
               }
            }}
         >
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Thêm danh mục mới</DialogTitle>
               </DialogHeader>
               <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                     <Label htmlFor='categoryName'>Tên danh mục</Label>
                     <Input
                        id='categoryName'
                        value={newCategory.categoryName}
                        onChange={(e) => setNewCategory({ ...newCategory, categoryName: e.target.value })}
                        placeholder='Nhập tên danh mục'
                     />
                  </div>
                  <div className='grid gap-2'>
                     <Label htmlFor='categoryImage'>Hình ảnh danh mục</Label>
                     <Input
                        id='categoryImage'
                        type='file'
                        accept='image/*'
                        onChange={(e) => {
                           const file = e.target.files?.[0] || null
                           setNewCategoryImage(file)

                           // Clean up previous preview URL
                           if (newCategoryImagePreview) {
                              URL.revokeObjectURL(newCategoryImagePreview)
                           }

                           // Create new preview URL
                           if (file) {
                              const previewUrl = URL.createObjectURL(file)
                              setNewCategoryImagePreview(previewUrl)
                           } else {
                              setNewCategoryImagePreview(null)
                           }
                        }}
                     />
                     {newCategoryImage && (
                        <div className='text-sm text-muted-foreground'>Đã chọn: {newCategoryImage.name}</div>
                     )}
                     {newCategoryImagePreview && (
                        <div className='mt-2'>
                           <Label>Xem trước:</Label>
                           <div className='mt-1 border rounded-lg p-2 bg-gray-50'>
                              <Image
                                 src={newCategoryImagePreview || '/placeholder.svg'}
                                 alt='Preview'
                                 width={200}
                                 height={200}
                                 className='rounded-lg object-cover mx-auto'
                              />
                           </div>
                        </div>
                     )}
                  </div>
                  <div className='flex items-center justify-between'>
                     <div className='space-y-0.5'>
                        <Label htmlFor='status'>Trạng thái</Label>
                        <div className='text-sm text-muted-foreground'>
                           {newCategory.status ? 'Hoạt động' : 'Không hoạt động'}
                        </div>
                     </div>
                     <Switch
                        id='status'
                        checked={newCategory.status}
                        onCheckedChange={(checked) => setNewCategory({ ...newCategory, status: checked })}
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button variant='outline' onClick={() => setIsAddDialogOpen(false)}>
                     Hủy
                  </Button>
                  <Button onClick={handleAddCategory} disabled={createCategory.isPending}>
                     {createCategory.isPending ? 'Đang xử lý...' : 'Thêm danh mục'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Dialog chỉnh sửa danh mục */}
         <Dialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
               setIsEditDialogOpen(open)
               if (!open) {
                  // Clean up preview when dialog closes
                  if (editingCategoryImagePreview) {
                     URL.revokeObjectURL(editingCategoryImagePreview)
                     setEditingCategoryImagePreview(null)
                  }
               }
            }}
         >
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
               </DialogHeader>
               {editingCategory && (
                  <div className='grid gap-4 py-4'>
                     <div className='grid gap-2'>
                        <Label htmlFor='editCategoryName'>Tên danh mục</Label>
                        <Input
                           id='editCategoryName'
                           value={editingCategory.categoryName}
                           onChange={(e) => setEditingCategory({ ...editingCategory, categoryName: e.target.value })}
                           placeholder='Nhập tên danh mục'
                        />
                     </div>
                     <div className='grid gap-2'>
                        <Label htmlFor='editCategoryImage'>Hình ảnh danh mục</Label>
                        <Input
                           id='editCategoryImage'
                           type='file'
                           accept='image/*'
                           onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              setEditingCategoryImage(file)

                              // Clean up previous preview URL
                              if (editingCategoryImagePreview) {
                                 URL.revokeObjectURL(editingCategoryImagePreview)
                              }

                              // Create new preview URL
                              if (file) {
                                 const previewUrl = URL.createObjectURL(file)
                                 setEditingCategoryImagePreview(previewUrl)
                              } else {
                                 setEditingCategoryImagePreview(null)
                              }
                           }}
                        />
                        {editingCategoryImage && (
                           <div className='text-sm text-muted-foreground'>Đã chọn: {editingCategoryImage.name}</div>
                        )}

                        {/* Show current image if available */}
                        {/* @ts-ignore */}
                        {editingCategory?.imageUrl && !editingCategoryImagePreview && (
                           <div className='mt-2'>
                              <Label>Hình ảnh hiện tại:</Label>
                              <div className='mt-1 border rounded-lg p-2 bg-gray-50'>
                                 <Image
                                    /* @ts-ignore */
                                    src={editingCategory.imageUrl || '/placeholder.svg'}
                                    alt={editingCategory.categoryName}
                                    width={200}
                                    height={200}
                                    className='rounded-lg object-cover mx-auto'
                                 />
                              </div>
                           </div>
                        )}

                        {/* Show preview of new image */}
                        {editingCategoryImagePreview && (
                           <div className='mt-2'>
                              <Label>Xem trước hình ảnh mới:</Label>
                              <div className='mt-1 border rounded-lg p-2 bg-gray-50'>
                                 <Image
                                    src={editingCategoryImagePreview || '/placeholder.svg'}
                                    alt='Preview'
                                    width={200}
                                    height={200}
                                    className='rounded-lg object-cover mx-auto'
                                 />
                              </div>
                           </div>
                        )}
                     </div>
                     <div className='flex items-center justify-between'>
                        <div className='space-y-0.5'>
                           <Label htmlFor='editStatus'>Trạng thái</Label>
                           <div className='text-sm text-muted-foreground'>
                              {editingCategory.status ? 'Hoạt động' : 'Không hoạt động'}
                           </div>
                        </div>
                        <Switch
                           id='editStatus'
                           checked={editingCategory.status}
                           onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, status: checked })}
                        />
                     </div>
                  </div>
               )}
               <DialogFooter>
                  <Button variant='outline' onClick={() => setIsEditDialogOpen(false)}>
                     Hủy
                  </Button>
                  <Button onClick={handleEditCategory} disabled={updateCategory.isPending}>
                     {updateCategory.isPending ? 'Đang xử lý...' : 'Cập nhật'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   )
}
