'use client'
import {
   useGetAllFlashSales,
   useCreateFlashSale,
   useUpdateFlashSale,
   useDeleteFlashSale,
   useAddProductToFlashSale,
   useUpdateProductInFlashSale,
   useDeleteProductFromFlashSale,
   useGetAllAdminProduct
} from '@/queries/useAdmin'
import type React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Edit, Plus, Search, Trash2, Eye, Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import type {
   FlashSaleType,
   GetFlashSaleQueryParamsType,
   CreateFlashSaleType,
   UpdateFlashSaleType,
   AddProductToFlashSaleType,
   UpdateProductToFlashSaleType
} from '@/types/admin.type'
import { toast } from 'react-toastify'
import Paginate from '@/components/paginate'
import { decodeHTML } from '@/lib/utils'

export default function FlashSaleManage() {
   const [currentPage, setCurrentPage] = useState<number>(1)
   const [queryParams, setQueryParams] = useState<GetFlashSaleQueryParamsType>({
      page: currentPage - 1,
      size: 5,
      sortBy: 'id',
      sortDir: 'desc',
      search: ''
   })
   const [searchTerm, setSearchTerm] = useState('')

   const [productSearch, setProductSearch] = useState('')
   const getAllFlashSales = useGetAllFlashSales(queryParams)
   const createFlashSale = useCreateFlashSale()
   const updateFlashSale = useUpdateFlashSale()
   const deleteFlashSale = useDeleteFlashSale()
   const addProductToFlashSale = useAddProductToFlashSale()
   const updateProductInFlashSale = useUpdateProductInFlashSale()
   const deleteProductFromFlashSale = useDeleteProductFromFlashSale()
   const getAllAdminProduct = useGetAllAdminProduct({ search: productSearch })
   const products = getAllAdminProduct.data?.data.data.content || []

   const flashSales = getAllFlashSales.data?.data.data.content || []
   const totalPages = getAllFlashSales.data?.data.data.totalPages || 0

   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
   const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
   const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false)

   const [newFlashSale, setNewFlashSale] = useState<CreateFlashSaleType>({
      name: '',
      description: '',
      startTime: '',
      endTime: ''
   })

   const [editingFlashSale, setEditingFlashSale] = useState<UpdateFlashSaleType | null>(null)
   const [viewingFlashSale, setViewingFlashSale] = useState<FlashSaleType | null>(null)
   const [selectedFlashSaleForProduct, setSelectedFlashSaleForProduct] = useState<FlashSaleType | null>(null)

   const [newProduct, setNewProduct] = useState<Omit<AddProductToFlashSaleType, 'id'>>({
      productId: 0,
      flashPrice: 0,
      stockLimit: 0
   })

   const [editingProduct, setEditingProduct] = useState<UpdateProductToFlashSaleType | null>(null)

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

   const formatDateTime = (dateTimeString: string) => {
      if (!dateTimeString) return ''
      const date = new Date(dateTimeString)
      return date.toLocaleString('vi-VN', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      })
   }

   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
         style: 'currency',
         currency: 'VND'
      }).format(amount)
   }

   const getStatusBadge = (flashSale: FlashSaleType) => {
      if (flashSale.isActive) {
         return (
            <Badge variant='default' className='bg-green-100 text-green-800'>
               <CheckCircle className='w-3 h-3 mr-1' />
               Đang diễn ra
            </Badge>
         )
      }
      if (flashSale.isUpcoming) {
         return (
            <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
               <Clock className='w-3 h-3 mr-1' />
               Sắp diễn ra
            </Badge>
         )
      }
      if (flashSale.isPast) {
         return (
            <Badge variant='outline' className='bg-gray-100 text-gray-800'>
               <XCircle className='w-3 h-3 mr-1' />
               Đã kết thúc
            </Badge>
         )
      }
      return null
   }

   const handleAddFlashSale = () => {
      if (!newFlashSale.name.trim()) {
         toast.error('Tên Flash Sale không được để trống')
         return
      }
      if (!newFlashSale.description.trim()) {
         toast.error('Mô tả không được để trống')
         return
      }
      if (!newFlashSale.startTime || !newFlashSale.endTime) {
         toast.error('Vui lòng chọn thời gian bắt đầu và kết thúc')
         return
      }
      if (new Date(newFlashSale.startTime) >= new Date(newFlashSale.endTime)) {
         toast.error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc')
         return
      }

      createFlashSale.mutate(newFlashSale, {
         onSuccess: () => {
            setIsAddDialogOpen(false)
            setNewFlashSale({
               name: '',
               description: '',
               startTime: '',
               endTime: ''
            })
            getAllFlashSales.refetch()
         }
      })
   }

   const handleEditFlashSale = () => {
      if (!editingFlashSale || !editingFlashSale.name.trim()) {
         toast.error('Tên Flash Sale không được để trống')
         return
      }
      if (!editingFlashSale.description.trim()) {
         toast.error('Mô tả không được để trống')
         return
      }
      if (!editingFlashSale.startTime || !editingFlashSale.endTime) {
         toast.error('Vui lòng chọn thời gian bắt đầu và kết thúc')
         return
      }
      if (new Date(editingFlashSale.startTime) >= new Date(editingFlashSale.endTime)) {
         toast.error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc')
         return
      }

      updateFlashSale.mutate(editingFlashSale, {
         onSuccess: () => {
            setIsEditDialogOpen(false)
            setEditingFlashSale(null)
            getAllFlashSales.refetch()
         }
      })
   }

   const handleDeleteFlashSale = (id: number) => {
      deleteFlashSale.mutate(id, {
         onSuccess: () => {
            getAllFlashSales.refetch()
         }
      })
   }

   const handleAddProduct = () => {
      if (!selectedFlashSaleForProduct) return
      if (!newProduct.productId || newProduct.flashPrice <= 0 || newProduct.stockLimit <= 0) {
         toast.error('Vui lòng điền đầy đủ thông tin sản phẩm')
         return
      }

      addProductToFlashSale.mutate(
         {
            id: selectedFlashSaleForProduct.id,
            ...newProduct
         },
         {
            onSuccess: () => {
               setIsProductDialogOpen(false)
               setNewProduct({
                  productId: 0,
                  flashPrice: 0,
                  stockLimit: 0
               })
               getAllFlashSales.refetch()
            }
         }
      )
   }

   const handleEditProduct = () => {
      if (!editingProduct) return
      if (!editingProduct.productId || editingProduct.flashPrice <= 0 || editingProduct.stockLimit <= 0) {
         toast.error('Vui lòng điền đầy đủ thông tin sản phẩm')
         return
      }

      updateProductInFlashSale.mutate(editingProduct, {
         onSuccess: () => {
            setIsEditProductDialogOpen(false)
            setEditingProduct(null)
            getAllFlashSales.refetch()
         }
      })
   }

   const handleDeleteProduct = (itemId: number) => {
      deleteProductFromFlashSale.mutate(itemId, {
         onSuccess: () => {
            getAllFlashSales.refetch()
            setIsViewDialogOpen(false)
         }
      })
   }

   const openEditDialog = (flashSale: FlashSaleType) => {
      setEditingFlashSale({
         id: flashSale.id,
         name: flashSale.name,
         description: flashSale.description,
         startTime: flashSale.startTime,
         endTime: flashSale.endTime
      })
      setIsEditDialogOpen(true)
   }

   const openViewDialog = (flashSale: FlashSaleType) => {
      setViewingFlashSale(flashSale)
      setIsViewDialogOpen(true)
   }

   const openProductDialog = (flashSale: FlashSaleType) => {
      setSelectedFlashSaleForProduct(flashSale)
      setIsProductDialogOpen(true)
   }

   const openEditProductDialog = (item: any) => {
      setEditingProduct({
         id: item.id,
         productId: item.productId,
         flashPrice: item.flashPrice,
         stockLimit: item.stockLimit
      })
      setIsEditProductDialogOpen(true)
   }

   const getSelectedProduct = (productId: number) => {
      return products.find((p) => p.id === productId)
   }

   return (
      <div className='container mx-auto p-6'>
         <div className='flex items-center justify-between flex-wrap gap-3'>
            <h1 className='text-2xl font-bold'>Quản lý Flash Sale</h1>
            <Button onClick={() => setIsAddDialogOpen(true)}>
               <Plus className='mr-2 h-4 w-4' /> Thêm Flash Sale
            </Button>
         </div>

         <div className='flex items-center flex-wrap gap-4 my-5'>
            <div className='flex items-center gap-2'>
               <Input
                  placeholder='Tìm kiếm Flash Sale...'
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
                     <SelectItem value='name-asc'>Tên A-Z</SelectItem>
                     <SelectItem value='name-desc'>Tên Z-A</SelectItem>
                     <SelectItem value='startTime-desc'>Bắt đầu mới nhất</SelectItem>
                     <SelectItem value='startTime-asc'>Bắt đầu cũ nhất</SelectItem>
                  </SelectContent>
               </Select>
            </div>
         </div>

         {getAllFlashSales.isLoading ? (
            <div className='text-center py-4'>Đang tải...</div>
         ) : (
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className='w-[80px]'>ID</TableHead>
                     <TableHead>Tên Flash Sale</TableHead>
                     <TableHead>Thời gian bắt đầu</TableHead>
                     <TableHead>Thời gian kết thúc</TableHead>
                     <TableHead>Mô tả</TableHead>
                     <TableHead>Sản phẩm</TableHead>
                     <TableHead>Trạng thái</TableHead>
                     <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {flashSales.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={7} className='text-center'>
                           Không có Flash Sale nào
                        </TableCell>
                     </TableRow>
                  ) : (
                     flashSales.map((flashSale) => (
                        <TableRow key={flashSale.id}>
                           <TableCell>{flashSale.id}</TableCell>
                           <TableCell className='font-medium'>{flashSale.name}</TableCell>
                           <TableCell className='text-sm'>{formatDateTime(flashSale.startTime)}</TableCell>
                           <TableCell className='text-sm'>{formatDateTime(flashSale.endTime)}</TableCell>
                           <TableCell className='text-sm'>{flashSale.description}</TableCell>
                           <TableCell>
                              <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
                                 {flashSale.items.length} sản phẩm
                              </span>
                           </TableCell>
                           <TableCell>{getStatusBadge(flashSale)}</TableCell>
                           <TableCell className='text-right'>
                              <div className='flex justify-end gap-2'>
                                 <Button variant='outline' size='icon' onClick={() => openViewDialog(flashSale)}>
                                    <Eye className='h-4 w-4' />
                                 </Button>
                                 {flashSale.isUpcoming && (
                                    <Button variant='outline' size='icon' onClick={() => openProductDialog(flashSale)}>
                                       <Package className='h-4 w-4' />
                                    </Button>
                                 )}
                                 {/* <Button variant='outline' size='icon' onClick={() => openEditDialog(flashSale)}>
                                    <Edit className='h-4 w-4' />
                                 </Button> */}
                                 {/* <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={() => handleDeleteFlashSale(flashSale.id)}
                                    className='text-red-600 hover:text-red-700'
                                 >
                                    <Trash2 className='h-4 w-4' />
                                 </Button> */}
                              </div>
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

         {/* Dialog thêm Flash Sale */}
         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className='max-w-lg'>
               <DialogHeader>
                  <DialogTitle>Thêm Flash Sale mới</DialogTitle>
               </DialogHeader>
               <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                     <Label htmlFor='name'>Tên Flash Sale</Label>
                     <Input
                        id='name'
                        value={newFlashSale.name}
                        onChange={(e) => setNewFlashSale({ ...newFlashSale, name: e.target.value })}
                        placeholder='Nhập tên Flash Sale'
                     />
                  </div>
                  <div className='grid gap-2'>
                     <Label htmlFor='description'>Mô tả</Label>
                     <Textarea
                        id='description'
                        value={newFlashSale.description}
                        onChange={(e) => setNewFlashSale({ ...newFlashSale, description: e.target.value })}
                        placeholder='Nhập mô tả Flash Sale'
                        rows={3}
                     />
                  </div>
                  <div className='grid gap-4'>
                     <div className='grid gap-2'>
                        <Label htmlFor='startTime'>Thời gian bắt đầu</Label>
                        <Input
                           id='startTime'
                           type='datetime-local'
                           value={newFlashSale.startTime}
                           onChange={(e) => setNewFlashSale({ ...newFlashSale, startTime: e.target.value })}
                        />
                     </div>
                     <div className='grid gap-2'>
                        <Label htmlFor='endTime'>Thời gian kết thúc</Label>
                        <Input
                           id='endTime'
                           type='datetime-local'
                           value={newFlashSale.endTime}
                           onChange={(e) => setNewFlashSale({ ...newFlashSale, endTime: e.target.value })}
                        />
                     </div>
                  </div>
               </div>
               <DialogFooter>
                  <Button variant='outline' onClick={() => setIsAddDialogOpen(false)}>
                     Hủy
                  </Button>
                  <Button onClick={handleAddFlashSale} disabled={createFlashSale.isPending}>
                     {createFlashSale.isPending ? 'Đang xử lý...' : 'Thêm Flash Sale'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Dialog chỉnh sửa Flash Sale */}
         <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className='max-w-lg'>
               <DialogHeader>
                  <DialogTitle>Chỉnh sửa Flash Sale</DialogTitle>
               </DialogHeader>
               {editingFlashSale && (
                  <div className='grid gap-4 py-4'>
                     <div className='grid gap-2'>
                        <Label htmlFor='editName'>Tên Flash Sale</Label>
                        <Input
                           id='editName'
                           value={editingFlashSale.name}
                           onChange={(e) => setEditingFlashSale({ ...editingFlashSale, name: e.target.value })}
                           placeholder='Nhập tên Flash Sale'
                        />
                     </div>
                     <div className='grid gap-2'>
                        <Label htmlFor='editDescription'>Mô tả</Label>
                        <Textarea
                           id='editDescription'
                           value={editingFlashSale.description}
                           onChange={(e) => setEditingFlashSale({ ...editingFlashSale, description: e.target.value })}
                           placeholder='Nhập mô tả Flash Sale'
                           rows={3}
                        />
                     </div>
                     <div className='grid gap-4'>
                        <div className='grid gap-2'>
                           <Label htmlFor='editStartTime'>Thời gian bắt đầu</Label>
                           <Input
                              id='editStartTime'
                              type='datetime-local'
                              value={editingFlashSale.startTime}
                              onChange={(e) => setEditingFlashSale({ ...editingFlashSale, startTime: e.target.value })}
                           />
                        </div>
                        <div className='grid gap-2'>
                           <Label htmlFor='editEndTime'>Thời gian kết thúc</Label>
                           <Input
                              id='editEndTime'
                              type='datetime-local'
                              value={editingFlashSale.endTime}
                              onChange={(e) => setEditingFlashSale({ ...editingFlashSale, endTime: e.target.value })}
                           />
                        </div>
                     </div>
                  </div>
               )}
               <DialogFooter>
                  <Button variant='outline' onClick={() => setIsEditDialogOpen(false)}>
                     Hủy
                  </Button>
                  <Button onClick={handleEditFlashSale} disabled={updateFlashSale.isPending}>
                     {updateFlashSale.isPending ? 'Đang xử lý...' : 'Cập nhật'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Dialog xem chi tiết Flash Sale */}
         <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className='max-w-4xl'>
               <DialogHeader>
                  <DialogTitle>Chi tiết Flash Sale</DialogTitle>
               </DialogHeader>
               {viewingFlashSale && (
                  <div className='grid gap-6 py-4'>
                     <div className='grid grid-cols-2 gap-4'>
                        <div>
                           <Label className='text-sm font-medium text-gray-500'>Tên Flash Sale</Label>
                           <p className='text-lg font-semibold'>{viewingFlashSale.name}</p>
                        </div>
                        <div>
                           <Label className='text-sm font-medium text-gray-500'>Trạng thái</Label>
                           <div className='mt-1'>{getStatusBadge(viewingFlashSale)}</div>
                        </div>
                     </div>
                     <div>
                        <Label className='text-sm font-medium text-gray-500'>Mô tả</Label>
                        <p className='mt-1'>{viewingFlashSale.description}</p>
                     </div>
                     <div className='grid grid-cols-2 gap-4'>
                        <div>
                           <Label className='text-sm font-medium text-gray-500'>Thời gian bắt đầu</Label>
                           <p className='mt-1'>{formatDateTime(viewingFlashSale.startTime)}</p>
                        </div>
                        <div>
                           <Label className='text-sm font-medium text-gray-500'>Thời gian kết thúc</Label>
                           <p className='mt-1'>{formatDateTime(viewingFlashSale.endTime)}</p>
                        </div>
                     </div>
                     <div>
                        <Label className='text-sm font-medium text-gray-500 mb-3 block'>
                           Sản phẩm ({viewingFlashSale.items.length})
                        </Label>
                        {viewingFlashSale.items.length === 0 ? (
                           <p className='text-gray-500 text-center py-4'>Chưa có sản phẩm nào</p>
                        ) : (
                           <Table>
                              <TableHeader>
                                 <TableRow>
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead>Giá gốc</TableHead>
                                    <TableHead>Giá Flash Sale</TableHead>
                                    <TableHead>Giảm giá</TableHead>
                                    <TableHead>Kho</TableHead>
                                    <TableHead>Đã bán</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {viewingFlashSale.items.map((item) => (
                                    <TableRow key={item.id}>
                                       <TableCell>
                                          <div className='flex items-center gap-3'>
                                             <img
                                                src={item.productImage || '/placeholder.svg?height=40&width=40'}
                                                alt={item.productName}
                                                className='w-10 h-10 rounded object-cover'
                                             />
                                             <span
                                                title={decodeHTML(item.productName)}
                                                className='font-medium max-w-[300px] truncate'
                                             >
                                                {decodeHTML(item.productName)}
                                             </span>
                                          </div>
                                       </TableCell>
                                       <TableCell>{formatCurrency(item.originalPrice)}</TableCell>
                                       <TableCell className='font-semibold text-red-600'>
                                          {formatCurrency(item.flashPrice)}
                                       </TableCell>
                                       <TableCell>
                                          <Badge variant='secondary'>{item.discountPercentage}%</Badge>
                                       </TableCell>
                                       <TableCell>
                                          {item.availableStock}/{item.stockLimit}
                                       </TableCell>
                                       <TableCell>{item.soldCount}</TableCell>
                                       <TableCell>
                                          <div className='flex gap-2'>
                                             {/* <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => openEditProductDialog(item)}
                                             >
                                                <Edit className='h-3 w-3' />
                                             </Button> */}
                                             {/* <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => handleDeleteProduct(item.id)}
                                                className='text-red-600'
                                             >
                                                <Trash2 className='h-3 w-3' />
                                             </Button> */}
                                          </div>
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        )}
                     </div>
                  </div>
               )}
               <DialogFooter>
                  <Button variant='outline' onClick={() => setIsViewDialogOpen(false)}>
                     Đóng
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Dialog thêm sản phẩm vào Flash Sale */}
         <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogContent className='max-w-xl'>
               <DialogHeader>
                  <DialogTitle>Thêm sản phẩm vào Flash Sale</DialogTitle>
               </DialogHeader>
               <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                     <Label htmlFor='productSelect'>Chọn sản phẩm</Label>
                     <div className='space-y-2'>
                        <Input
                           placeholder='Tìm kiếm sản phẩm...'
                           value={productSearch}
                           onChange={(e) => setProductSearch(e.target.value)}
                           className='mb-2'
                        />
                        <Select
                           value={newProduct.productId.toString()}
                           onValueChange={(value) => setNewProduct({ ...newProduct, productId: Number(value) })}
                        >
                           <SelectTrigger>
                              <SelectValue placeholder='Chọn sản phẩm'>
                                 {newProduct.productId > 0 && getSelectedProduct(newProduct.productId) && (
                                    <div className='flex items-center gap-2'>
                                       <img
                                          src={
                                             getSelectedProduct(newProduct.productId)?.image ||
                                             '/placeholder.svg?height=20&width=20'
                                          }
                                          alt=''
                                          className='w-5 h-5 rounded object-cover'
                                       />
                                       <span className='truncate'>
                                          {getSelectedProduct(newProduct.productId)?.name}
                                       </span>
                                    </div>
                                 )}
                              </SelectValue>
                           </SelectTrigger>
                           <SelectContent className='max-h-60'>
                              {products.length === 0 ? (
                                 <div className='p-2 text-center text-gray-500'>
                                    {getAllAdminProduct.isLoading ? 'Đang tải...' : 'Không tìm thấy sản phẩm'}
                                 </div>
                              ) : (
                                 products.map((product) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                       <div className='flex items-center gap-3 py-1'>
                                          <img
                                             src={product.image || '/placeholder.svg?height=32&width=32'}
                                             alt={decodeHTML(product.name)}
                                             className='w-8 h-8 rounded object-cover flex-shrink-0'
                                          />
                                          <div className='flex-1 min-w-0'>
                                             <p className='font-medium truncate max-w-[300px]'>
                                                {decodeHTML(product.name)}
                                             </p>
                                             <p className='text-sm text-gray-500'>
                                                {formatCurrency(product.price)} • ID: {product.id}
                                             </p>
                                          </div>
                                       </div>
                                    </SelectItem>
                                 ))
                              )}
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
                  <div className='grid gap-2'>
                     <Label htmlFor='flashPrice'>Giá Flash Sale</Label>
                     <Input
                        id='flashPrice'
                        type='number'
                        value={newProduct.flashPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, flashPrice: Number(e.target.value) })}
                        placeholder='Nhập giá Flash Sale'
                     />
                  </div>
                  <div className='grid gap-2'>
                     <Label htmlFor='stockLimit'>Giới hạn kho</Label>
                     <Input
                        id='stockLimit'
                        type='number'
                        value={newProduct.stockLimit}
                        onChange={(e) => setNewProduct({ ...newProduct, stockLimit: Number(e.target.value) })}
                        placeholder='Nhập số lượng giới hạn'
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button variant='outline' onClick={() => setIsProductDialogOpen(false)}>
                     Hủy
                  </Button>
                  <Button onClick={handleAddProduct} disabled={addProductToFlashSale.isPending}>
                     {addProductToFlashSale.isPending ? 'Đang xử lý...' : 'Thêm sản phẩm'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Dialog chỉnh sửa sản phẩm trong Flash Sale */}
         <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
            <DialogContent className='max-w-md'>
               <DialogHeader>
                  <DialogTitle>Chỉnh sửa sản phẩm trong Flash Sale</DialogTitle>
               </DialogHeader>
               {editingProduct && (
                  <div className='grid gap-4 py-4'>
                     <div className='grid gap-2'>
                        <Label htmlFor='editProductSelect'>Chọn sản phẩm</Label>
                        <div className='space-y-2'>
                           <Input
                              placeholder='Tìm kiếm sản phẩm...'
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              className='mb-2'
                           />
                           <Select
                              value={editingProduct.productId.toString()}
                              onValueChange={(value) =>
                                 setEditingProduct({ ...editingProduct, productId: Number(value) })
                              }
                           >
                              <SelectTrigger>
                                 <SelectValue placeholder='Chọn sản phẩm'>
                                    {editingProduct.productId > 0 && getSelectedProduct(editingProduct.productId) && (
                                       <div className='flex items-center gap-2'>
                                          <img
                                             src={
                                                getSelectedProduct(editingProduct.productId)?.image ||
                                                '/placeholder.svg?height=20&width=20'
                                             }
                                             alt=''
                                             className='w-5 h-5 rounded object-cover'
                                          />
                                          <span className='truncate'>
                                             {getSelectedProduct(editingProduct.productId)?.name}
                                          </span>
                                       </div>
                                    )}
                                 </SelectValue>
                              </SelectTrigger>
                              <SelectContent className='max-h-60'>
                                 {products.length === 0 ? (
                                    <div className='p-2 text-center text-gray-500'>
                                       {getAllAdminProduct.isLoading ? 'Đang tải...' : 'Không tìm thấy sản phẩm'}
                                    </div>
                                 ) : (
                                    products.map((product) => (
                                       <SelectItem key={product.id} value={product.id.toString()}>
                                          <div className='flex items-center gap-3 py-1'>
                                             <img
                                                src={product.image || '/placeholder.svg?height=32&width=32'}
                                                alt={decodeHTML(product.name)}
                                                className='w-8 h-8 rounded object-cover flex-shrink-0'
                                             />
                                             <div className='flex-1 min-w-0'>
                                                <p className='font-medium truncate'>{decodeHTML(product.name)}</p>
                                                <p className='text-sm text-gray-500'>
                                                   {formatCurrency(product.price)} • ID: {product.id}
                                                </p>
                                             </div>
                                          </div>
                                       </SelectItem>
                                    ))
                                 )}
                              </SelectContent>
                           </Select>
                        </div>
                     </div>
                     <div className='grid gap-2'>
                        <Label htmlFor='editFlashPrice'>Giá Flash Sale</Label>
                        <Input
                           id='editFlashPrice'
                           type='number'
                           value={editingProduct.flashPrice}
                           onChange={(e) =>
                              setEditingProduct({ ...editingProduct, flashPrice: Number(e.target.value) })
                           }
                           placeholder='Nhập giá Flash Sale'
                        />
                     </div>
                     <div className='grid gap-2'>
                        <Label htmlFor='editStockLimit'>Giới hạn kho</Label>
                        <Input
                           id='editStockLimit'
                           type='number'
                           value={editingProduct.stockLimit}
                           onChange={(e) =>
                              setEditingProduct({ ...editingProduct, stockLimit: Number(e.target.value) })
                           }
                           placeholder='Nhập số lượng giới hạn'
                        />
                     </div>
                  </div>
               )}
               <DialogFooter>
                  <Button variant='outline' onClick={() => setIsEditProductDialogOpen(false)}>
                     Hủy
                  </Button>
                  <Button onClick={handleEditProduct} disabled={updateProductInFlashSale.isPending}>
                     {updateProductInFlashSale.isPending ? 'Đang xử lý...' : 'Cập nhật'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   )
}
