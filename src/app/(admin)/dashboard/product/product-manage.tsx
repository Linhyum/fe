'use client'
import {
   useCreateProduct,
   useDeleteProductImage,
   useGetAllAdminProduct,
   useGetAllBrand,
   useGetAllCategories,
   useGetAllDiscount,
   useUpdatePrimaryImage,
   useUpdateProduct,
   useUploadProductImage
} from '@/queries/useAdmin'
import React, { useState, useRef, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Paginate from '@/components/paginate'
import Image from 'next/image'
import { decodeHTML, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Edit, Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { CreateProductType } from '@/types/admin.type'
import { useForm, Controller } from 'react-hook-form'
import { ProductType } from '@/types/product.type'
import { toast } from 'react-toastify'

export default function ProductManage() {
   const [currentPage, setCurrentPage] = useState<number>(1)
   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
   const [editingProduct, setEditingProduct] = useState<(CreateProductType & { id: number }) | null>(null)
   const [selectedFiles, setSelectedFiles] = useState<File[]>([])
   const [previewUrls, setPreviewUrls] = useState<string[]>([])
   const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0)
   const [productImages, setProductImages] = useState<{ id: number; imageUrl: string; isPrimary: boolean }[]>([])
   const fileInputRef = useRef<HTMLInputElement>(null)
   // Thêm state để lưu ID của ảnh sẽ được đặt làm ảnh chính
   const [pendingPrimaryImageId, setPendingPrimaryImageId] = useState<number | null>(null)
   const [queryParams, setQueryParams] = useState({
      page: currentPage - 1,
      size: 5,
      sortBy: 'id',
      sortDir: 'asc',
      search: ''
   })
   const [searchTerm, setSearchTerm] = useState('')

   const getAllAdminProduct = useGetAllAdminProduct(queryParams)

   // Cập nhật page trong queryParams khi currentPage thay đổi
   useEffect(() => {
      setQueryParams((prev) => ({
         ...prev,
         page: currentPage - 1
      }))
   }, [currentPage])

   const products = getAllAdminProduct.data?.data.data.content || []
   const totalPages = getAllAdminProduct.data?.data.data.totalPages || 0
   const isLoading = getAllAdminProduct.isLoading

   const getAllCategories = useGetAllCategories({})
   const categories = getAllCategories.data?.data.data.content.filter((item) => item.status) || []

   const getAllDiscount = useGetAllDiscount({})
   const discounts = getAllDiscount.data?.data.data.content || []

   const getAllBrand = useGetAllBrand({})
   const brands = getAllBrand.data?.data.data.content.filter((item) => item.status) || []

   const createProduct = useCreateProduct()
   const uploadProductImage = useUploadProductImage()
   const updateProduct = useUpdateProduct()

   const deleteProductImage = useDeleteProductImage()
   const updatePrimaryImage = useUpdatePrimaryImage()

   const {
      register,
      handleSubmit,
      control,
      reset,
      setValue,
      formState: { errors }
   } = useForm<CreateProductType>({
      defaultValues: {
         status: true,
         stock: 0,
         price: 0,
         weight: 0
      }
   })

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

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
         const newFiles = Array.from(e.target.files)

         // Tạo preview URLs cho các file mới
         const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file))

         setSelectedFiles((prev) => [...prev, ...newFiles])
         setPreviewUrls((prev) => [...prev, ...newPreviewUrls])

         // Reset input để có thể chọn cùng file nhiều lần
         e.target.value = ''
      }
   }

   const handleRemoveFile = (index: number) => {
      // Xóa file khỏi danh sách
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index))

      // Xóa preview URL và giải phóng bộ nhớ
      URL.revokeObjectURL(previewUrls[index])
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index))

      // Cập nhật lại primary image index nếu cần
      if (primaryImageIndex === index) {
         setPrimaryImageIndex(0)
      } else if (primaryImageIndex > index) {
         setPrimaryImageIndex((prev) => prev - 1)
      }
   }

   const handleSetPrimary = (index: number) => {
      setPrimaryImageIndex(index)
   }

   const onSubmit = (data: CreateProductType) => {
      createProduct.mutate(data, {
         onSuccess: async (response) => {
            // Lấy ID sản phẩm vừa tạo từ response
            const productId = response.data.data.id

            // Nếu có file ảnh được chọn, upload từng ảnh
            if (selectedFiles.length > 0) {
               try {
                  // Upload ảnh chính trước
                  if (selectedFiles[primaryImageIndex]) {
                     await uploadProductImage.mutateAsync({
                        id: productId,
                        file: selectedFiles[primaryImageIndex],
                        isPrimary: true // Ảnh đầu tiên luôn là ảnh chính khi tạo mới
                     })
                  }

                  // Upload các ảnh còn lại
                  for (let i = 0; i < selectedFiles.length; i++) {
                     if (i !== primaryImageIndex) {
                        await uploadProductImage.mutateAsync({
                           id: productId,
                           file: selectedFiles[i],
                           isPrimary: false
                        })
                     }
                  }

                  // Reset form và đóng dialog sau khi hoàn tất
                  reset()
                  setSelectedFiles([])
                  setPreviewUrls([])
                  setPrimaryImageIndex(0)
                  setIsAddDialogOpen(false)
                  toast.success('Thêm sản phẩm thành công')
               } catch (error) {
                  // Lỗi đã được xử lý trong hook useUploadProductImage
               }
            } else {
               // Nếu không có ảnh, chỉ đóng dialog
               reset()
               setIsAddDialogOpen(false)
               toast.success('Thêm sản phẩm thành công')
            }
         }
      })
   }

   const handleEditProduct = (product: ProductType) => {
      const detail = product.productDetail

      const formData: CreateProductType & { id: number } = {
         id: product.id,
         categoryId: product.categoryId,
         discountId: product.discountId,
         brandId: product.brandId,
         name: product.name,
         price: product.price,
         description: product.description || '',
         warranty: product.warranty || '',
         weight: product.weight || 0,
         dimensions: product.dimensions || '',
         status: product.status,
         stock: product.stock || 0,
         processor: detail?.processor || '',
         ram: detail?.ram || '',
         storage: detail?.storage || '',
         display: detail?.display || '',
         graphics: detail?.graphics || '',
         battery: detail?.battery || '',
         camera: detail?.camera || '',
         operatingSystem: detail?.operatingSystem || '',
         connectivity: detail?.connectivity || '',
         otherFeatures: detail?.otherFeatures || ''
      }

      setEditingProduct(formData)

      // Lưu danh sách ảnh hiện tại với đầy đủ thông tin
      setProductImages(product.productImages || [])
      // Xóa dòng này: setExistingImages(product.productImages?.map((image) => image.imageUrl) || [])

      // Reset các state liên quan đến ảnh mới
      setSelectedFiles([])
      setPreviewUrls([])
      setPrimaryImageIndex(0)
      // Reset state pendingPrimaryImageId khi mở dialog
      setPendingPrimaryImageId(null)

      Object.entries(formData).forEach(([key, value]) => {
         if (key !== 'id') {
            setValue(key as keyof CreateProductType, value)
         }
      })

      setIsEditDialogOpen(true)
   }

   const onSubmitEdit = (data: CreateProductType) => {
      if (!editingProduct) return

      const updatedProduct = {
         ...data,
         id: editingProduct.id
      }

      updateProduct.mutate(
         { ...updatedProduct, discountId: data.discountId === 0 ? null : data.discountId },
         {
            onSuccess: async () => {
               // Xử lý đặt ảnh chính nếu có
               if (pendingPrimaryImageId !== null) {
                  try {
                     // Gọi API để cập nhật ảnh chính
                     await updatePrimaryImage.mutateAsync(pendingPrimaryImageId)

                     // Đợi một chút để đảm bảo dữ liệu được cập nhật trên server
                     await new Promise((resolve) => setTimeout(resolve, 500))

                     // Refresh dữ liệu sản phẩm để cập nhật trạng thái ảnh
                     await getAllAdminProduct.refetch()

                     // Reset state sau khi đã xử lý
                     setPendingPrimaryImageId(null)
                  } catch (error) {
                     toast.error('Cập nhật ảnh chính thất bại')
                  }
               }

               // Nếu có file ảnh mới được chọn, upload từng ảnh
               if (selectedFiles.length > 0) {
                  try {
                     // Kiểm tra xem đã có ảnh chính chưa (sau khi đã cập nhật ảnh chính ở trên)
                     const hasPrimaryImage = productImages.some((img) => img.isPrimary)

                     // Upload từng ảnh mới
                     for (let i = 0; i < selectedFiles.length; i++) {
                        const shouldBePrimary = i === primaryImageIndex && !hasPrimaryImage

                        await uploadProductImage.mutateAsync({
                           id: editingProduct.id,
                           file: selectedFiles[i],
                           isPrimary: shouldBePrimary
                        })
                     }

                     // Refresh lại dữ liệu sau khi upload ảnh
                     await getAllAdminProduct.refetch()
                  } catch (error) {
                     toast.error('Upload ảnh thất bại')
                  }
               }

               // Đóng dialog và reset form
               setIsEditDialogOpen(false)
               setEditingProduct(null)
               setSelectedFiles([])
               setPreviewUrls([])
               setPendingPrimaryImageId(null)
               reset()

               toast.success('Cập nhật sản phẩm thành công')
            }
         }
      )
   }

   // Cleanup preview URLs khi component unmount
   React.useEffect(() => {
      return () => {
         previewUrls.forEach((url) => URL.revokeObjectURL(url))
      }
   }, [])

   // Thêm hàm xử lý xóa ảnh
   const handleDeleteImage = async (imageId: number) => {
      try {
         await deleteProductImage.mutateAsync(imageId)
         // Cập nhật lại danh sách ảnh sau khi xóa
         setProductImages((prev) => prev.filter((img) => img.id !== imageId))
      } catch (error) {
         toast.error('Xóa ảnh thất bại')
      }
   }

   // Thêm hàm xử lý chọn ảnh làm ảnh chính
   const handleSelectPrimaryImage = (imageId: number) => {
      // Chỉ đánh dấu ảnh này sẽ là ảnh chính, chưa gọi API
      setPendingPrimaryImageId(imageId)

      // Cập nhật UI để hiển thị ảnh được chọn
      // Đảm bảo chỉ có một ảnh được đánh dấu là isPrimary=true
      setProductImages((prev) =>
         prev.map((img) => ({
            ...img,
            isPrimary: img.id === imageId
         }))
      )
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
   return (
      <div className='container p-6'>
         <div className='flex justify-between flex-wrap gap-3 items-center'>
            <h1 className='text-2xl font-bold'>Quản lý sản phẩm</h1>
            <Dialog
               open={isAddDialogOpen}
               onOpenChange={(open) => {
                  setIsAddDialogOpen(open)
                  if (!open) {
                     // Cleanup khi đóng dialog
                     setSelectedFiles([])
                     previewUrls.forEach((url) => URL.revokeObjectURL(url))
                     setPreviewUrls([])
                     setPrimaryImageIndex(0)
                  }
               }}
            >
               <DialogTrigger asChild>
                  <Button>
                     <Plus className='h-4 w-4 mr-2' />
                     Thêm sản phẩm
                  </Button>
               </DialogTrigger>
               <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
                  <DialogHeader>
                     <DialogTitle>Thêm sản phẩm mới</DialogTitle>
                     <DialogDescription>Điền đầy đủ thông tin sản phẩm bên dưới</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                     <div className='grid sm:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                           <Label htmlFor='name'>
                              Tên sản phẩm <span className='text-red-500'>*</span>
                           </Label>
                           <Input
                              id='name'
                              {...register('name', { required: 'Tên sản phẩm là bắt buộc' })}
                              placeholder='Nhập tên sản phẩm'
                           />
                           {errors.name && <p className='text-red-500 text-xs'>{errors.name.message}</p>}
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='price'>
                              Giá <span className='text-red-500'>*</span>
                           </Label>
                           <Input
                              id='price'
                              type='number'
                              {...register('price', {
                                 required: 'Giá là bắt buộc',
                                 min: { value: 0, message: 'Giá không được âm' }
                              })}
                              placeholder='Nhập giá sản phẩm'
                           />
                           {errors.price && <p className='text-red-500 text-xs'>{errors.price.message}</p>}
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='categoryId'>
                              Danh mục <span className='text-red-500'>*</span>
                           </Label>
                           <Controller
                              control={control}
                              name='categoryId'
                              rules={{ required: 'Danh mục là bắt buộc' }}
                              render={({ field }) => (
                                 <Select
                                    value={field.value?.toString()}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                 >
                                    <SelectTrigger>
                                       <SelectValue placeholder='Chọn danh mục' />
                                    </SelectTrigger>
                                    <SelectContent>
                                       {categories.map((category) => (
                                          <SelectItem key={category.id} value={category.id.toString()}>
                                             {category.categoryName}
                                          </SelectItem>
                                       ))}
                                    </SelectContent>
                                 </Select>
                              )}
                           />
                           {errors.categoryId && <p className='text-red-500 text-xs'>{errors.categoryId.message}</p>}
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='brandId'>Thương hiệu</Label>
                           <Controller
                              control={control}
                              name='brandId'
                              render={({ field }) => (
                                 <Select
                                    value={field.value?.toString()}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                 >
                                    <SelectTrigger>
                                       <SelectValue placeholder='Chọn thương hiệu' />
                                    </SelectTrigger>
                                    <SelectContent>
                                       {brands.map((brand) => (
                                          <SelectItem key={brand.id} value={brand.id.toString()}>
                                             {brand.brandName}
                                          </SelectItem>
                                       ))}
                                    </SelectContent>
                                 </Select>
                              )}
                           />
                        </div>
                        {/* <div className='space-y-2'>
                           <Label htmlFor='discountId'>Khuyến mãi</Label>
                           <Controller
                              control={control}
                              name='discountId'
                              render={({ field }) => (
                                 <Select
                                    value={field.value?.toString()}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                 >
                                    <SelectTrigger>
                                       <SelectValue placeholder='Chọn khuyến mãi' />
                                    </SelectTrigger>
                                    <SelectContent>
                                       {discounts.map((discount) => (
                                          <SelectItem key={discount.id} value={discount.id.toString()}>
                                             {discount.name} ({discount.value}%)
                                          </SelectItem>
                                       ))}
                                    </SelectContent>
                                 </Select>
                              )}
                           />
                        </div> */}
                        <div className='space-y-2'>
                           <Label htmlFor='stock'>
                              Số lượng tồn kho <span className='text-red-500'>*</span>
                           </Label>
                           <Input
                              id='stock'
                              type='number'
                              {...register('stock', {
                                 required: 'Số lượng tồn kho là bắt buộc',
                                 min: { value: 0, message: 'Số lượng không được âm' }
                              })}
                              placeholder='Nhập số lượng tồn kho'
                           />
                           {errors.stock && <p className='text-red-500 text-xs'>{errors.stock.message}</p>}
                        </div>
                     </div>

                     <div className='space-y-2'>
                        <Label htmlFor='description'>Mô tả sản phẩm</Label>
                        <Textarea
                           id='description'
                           {...register('description')}
                           placeholder='Nhập mô tả sản phẩm'
                           className='min-h-[100px]'
                        />
                     </div>

                     <div className='grid sm:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                           <Label htmlFor='warranty'>Bảo hành</Label>
                           <Input id='warranty' {...register('warranty')} placeholder='Ví dụ: 12 tháng' />
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='weight'>Trọng lượng (gram)</Label>
                           <Input
                              id='weight'
                              type='number'
                              {...register('weight', { min: 0 })}
                              placeholder='Nhập trọng lượng'
                           />
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='dimensions'>Kích thước</Label>
                           <Input id='dimensions' {...register('dimensions')} placeholder='Ví dụ: 150 x 75 x 8 mm' />
                        </div>
                     </div>

                     <div className='border p-4 rounded-md space-y-4'>
                        <h3 className='font-medium'>Thông số kỹ thuật</h3>
                        <div className='grid sm:grid-cols-2 gap-4'>
                           <div className='space-y-2'>
                              <Label htmlFor='processor'>Vi xử lý</Label>
                              <Input id='processor' {...register('processor')} placeholder='Ví dụ: Apple A15 Bionic' />
                           </div>
                           <div className='space-y-2'>
                              <Label htmlFor='ram'>RAM</Label>
                              <Input id='ram' {...register('ram')} placeholder='Ví dụ: 8GB LPDDR5' />
                           </div>
                           <div className='space-y-2'>
                              <Label htmlFor='storage'>Bộ nhớ trong</Label>
                              <Input id='storage' {...register('storage')} placeholder='Ví dụ: 256GB' />
                           </div>
                           <div className='space-y-2'>
                              <Label htmlFor='display'>Màn hình</Label>
                              <Input
                                 id='display'
                                 {...register('display')}
                                 placeholder='Ví dụ: 6.1 inch Super Retina XDR'
                              />
                           </div>
                           <div className='space-y-2'>
                              <Label htmlFor='graphics'>Card đồ họa</Label>
                              <Input id='graphics' {...register('graphics')} placeholder='Ví dụ: Apple GPU' />
                           </div>
                           <div className='space-y-2'>
                              <Label htmlFor='battery'>Pin</Label>
                              <Input id='battery' {...register('battery')} placeholder='Ví dụ: 3240 mAh' />
                           </div>
                           <div className='space-y-2'>
                              <Label htmlFor='camera'>Camera</Label>
                              <Input id='camera' {...register('camera')} placeholder='Ví dụ: 12MP + 12MP' />
                           </div>
                           <div className='space-y-2'>
                              <Label htmlFor='operatingSystem'>Hệ điều hành</Label>
                              <Input
                                 id='operatingSystem'
                                 {...register('operatingSystem')}
                                 placeholder='Ví dụ: iOS 16'
                              />
                           </div>
                           <div className='space-y-2'>
                              <Label htmlFor='connectivity'>Kết nối</Label>
                              <Input
                                 id='connectivity'
                                 {...register('connectivity')}
                                 placeholder='Ví dụ: 5G, Wi-Fi 6, Bluetooth 5.0'
                              />
                           </div>
                           <div className='space-y-2'>
                              <Label htmlFor='otherFeatures'>Tính năng khác</Label>
                              <Input
                                 id='otherFeatures'
                                 {...register('otherFeatures')}
                                 placeholder='Ví dụ: Face ID, chống nước IP68'
                              />
                           </div>
                        </div>
                     </div>

                     <div className='flex items-center space-x-2'>
                        <Controller
                           control={control}
                           name='status'
                           render={({ field }) => (
                              <Switch
                                 className='data-[state=checked]:bg-secondaryColor'
                                 checked={field.value}
                                 onCheckedChange={field.onChange}
                                 id='status'
                              />
                           )}
                        />
                        <Label htmlFor='status'>Hiển thị sản phẩm</Label>
                     </div>

                     <div className='space-y-2'>
                        <Label htmlFor='productImage'>Hình ảnh sản phẩm</Label>
                        <div
                           className='mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-primaryColor'
                           onDragOver={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                           }}
                           onDrop={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                 const newFiles = Array.from(e.dataTransfer.files)
                                 const imageFiles = newFiles.filter((file) => file.type.startsWith('image/'))

                                 if (imageFiles.length > 0) {
                                    // Tạo preview URLs cho các file mới
                                    const newPreviewUrls = imageFiles.map((file) => URL.createObjectURL(file))

                                    setSelectedFiles((prev) => [...prev, ...imageFiles])
                                    setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
                                 }
                              }
                           }}
                        >
                           <input
                              id='editProductImage'
                              type='file'
                              ref={fileInputRef}
                              accept='image/*'
                              multiple
                              onChange={handleFileChange}
                              className='hidden'
                           />
                           <div className='flex flex-col items-center text-center'>
                              <svg
                                 className='w-12 h-12 text-gray-400 mb-3'
                                 fill='none'
                                 stroke='currentColor'
                                 viewBox='0 0 24 24'
                                 xmlns='http://www.w3.org/2000/svg'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth='2'
                                    d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                                 ></path>
                              </svg>
                              <p className='mb-2 text-sm text-gray-500'>
                                 <span className='font-semibold'>Nhấp để tải lên</span> hoặc kéo và thả
                              </p>
                              <p className='text-xs text-gray-500'>PNG, JPG, GIF (Tối đa 10MB)</p>
                           </div>
                           <Button
                              type='button'
                              variant='outline'
                              onClick={() => fileInputRef.current?.click()}
                              className='mt-4'
                           >
                              Chọn ảnh
                           </Button>
                        </div>
                        {/* Hiển thị preview ảnh */}
                        {previewUrls.length > 0 && (
                           <div className='mt-4'>
                              <p className='text-sm font-medium mb-2'>Đã chọn {selectedFiles.length} ảnh</p>
                              <div className='grid grid-cols-5 gap-4'>
                                 {previewUrls.map((url, index) => (
                                    <div
                                       key={index}
                                       className={`relative aspect-square border rounded-md overflow-hidden cursor-pointer ${
                                          index === primaryImageIndex ? 'ring-2 ring-primaryColor' : ''
                                       }`}
                                       // onClick={() => handleSetPrimary(index)}
                                    >
                                       <Image src={url} alt={`Preview ${index + 1}`} fill className='object-cover' />
                                       {index === primaryImageIndex && (
                                          <div className='absolute top-1 left-1 bg-primaryColor text-white text-xs px-1 rounded'>
                                             Chính
                                          </div>
                                       )}
                                       <button
                                          type='button'
                                          className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1'
                                          onClick={(e) => {
                                             e.stopPropagation()
                                             handleRemoveFile(index)
                                          }}
                                       >
                                          <X className='h-3 w-3' />
                                       </button>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}

                        <p className='text-xs text-gray-500'>
                           Hình ảnh sẽ được tự động upload sau khi tạo sản phẩm thành công. Ảnh đầu tiên sẽ được đặt làm
                           ảnh chính.
                        </p>
                     </div>

                     <div className='flex justify-end gap-2'>
                        <Button
                           type='button'
                           variant='outline'
                           onClick={() => {
                              setIsAddDialogOpen(false)
                              setSelectedFiles([])
                              previewUrls.forEach((url) => URL.revokeObjectURL(url))
                              setPreviewUrls([])
                           }}
                        >
                           Hủy
                        </Button>
                        <Button type='submit' disabled={createProduct.isPending || uploadProductImage.isPending}>
                           {createProduct.isPending || uploadProductImage.isPending ? 'Đang xử lý...' : 'Thêm sản phẩm'}
                        </Button>
                     </div>
                  </form>
               </DialogContent>
            </Dialog>
         </div>
         <div className='flex items-center flex-wrap gap-4 my-5'>
            <div className='flex items-center gap-2'>
               <Input
                  placeholder='Tìm kiếm sản phẩm...'
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
                     <SelectItem value='price-asc'>Giá tăng dần</SelectItem>
                     <SelectItem value='price-desc'>Giá giảm dần</SelectItem>
                     <SelectItem value='name-asc'>Tên A-Z</SelectItem>
                     <SelectItem value='name-desc'>Tên Z-A</SelectItem>
                  </SelectContent>
               </Select>
            </div>
         </div>

         {/* Thêm Dialog chỉnh sửa sản phẩm */}
         <Dialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
               setIsEditDialogOpen(open)
               if (!open) {
                  setEditingProduct(null)
                  setSelectedFiles([])
                  previewUrls.forEach((url) => URL.revokeObjectURL(url))
                  setPreviewUrls([])
                  setPendingPrimaryImageId(null)
                  reset()
               }
            }}
         >
            <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
               <DialogHeader>
                  <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
                  <DialogDescription>Cập nhật thông tin sản phẩm bên dưới</DialogDescription>
               </DialogHeader>
               <form onSubmit={handleSubmit(onSubmitEdit)} className='space-y-6'>
                  <div className='grid grid-cols-2 gap-4'>
                     <div className='space-y-2'>
                        <Label htmlFor='name'>
                           Tên sản phẩm <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                           id='name'
                           {...register('name', { required: 'Tên sản phẩm là bắt buộc' })}
                           placeholder='Nhập tên sản phẩm'
                        />
                        {errors.name && <p className='text-red-500 text-xs'>{errors.name.message}</p>}
                     </div>
                     <div className='space-y-2'>
                        <Label htmlFor='price'>
                           Giá <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                           id='price'
                           type='number'
                           {...register('price', { required: 'Giá là bắt buộc', min: 0 })}
                           placeholder='Nhập giá sản phẩm'
                        />
                        {errors.price && <p className='text-red-500 text-xs'>{errors.price.message}</p>}
                     </div>
                     <div className='space-y-2'>
                        <Label htmlFor='categoryId'>
                           Danh mục <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                           control={control}
                           name='categoryId'
                           rules={{ required: 'Danh mục là bắt buộc' }}
                           render={({ field }) => (
                              <Select
                                 value={field.value?.toString()}
                                 onValueChange={(value) => field.onChange(Number(value))}
                              >
                                 <SelectTrigger>
                                    <SelectValue placeholder='Chọn danh mục' />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {categories.map((category) => (
                                       <SelectItem key={category.id} value={category.id.toString()}>
                                          {category.categoryName}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           )}
                        />
                        {errors.categoryId && <p className='text-red-500 text-xs'>{errors.categoryId.message}</p>}
                     </div>
                     <div className='space-y-2'>
                        <Label htmlFor='brandId'>Thương hiệu</Label>
                        <Controller
                           control={control}
                           name='brandId'
                           render={({ field }) => (
                              <Select
                                 value={field.value?.toString()}
                                 onValueChange={(value) => field.onChange(Number(value))}
                              >
                                 <SelectTrigger>
                                    <SelectValue placeholder='Chọn thương hiệu' />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {brands.map((brand) => (
                                       <SelectItem key={brand.id} value={brand.id.toString()}>
                                          {brand.brandName}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           )}
                        />
                     </div>
                     {/* <div className='space-y-2'>
                        <Label htmlFor='discountId'>Giảm giá</Label>
                        <Controller
                           control={control}
                           name='discountId'
                           render={({ field }) => (
                              <Select
                                 value={field.value?.toString()}
                                 onValueChange={(value) => field.onChange(Number(value))}
                              >
                                 <SelectTrigger>
                                    <SelectValue placeholder='Chọn giảm giá' />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value='0'>Không áp dụng</SelectItem>
                                    {discounts.map((discount) => (
                                       <SelectItem key={discount.id} value={discount.id.toString()}>
                                          {discount.name} ({formatCurrency(discount.value)})
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           )}
                        />
                     </div> */}
                     <div className='space-y-2'>
                        <Label htmlFor='stock'>Số lượng tồn kho</Label>
                        <Input
                           id='stock'
                           type='number'
                           {...register('stock', { min: 0 })}
                           placeholder='Nhập số lượng tồn kho'
                        />
                     </div>
                  </div>

                  <div className='space-y-2'>
                     <Label htmlFor='description'>Mô tả sản phẩm</Label>
                     <Textarea
                        id='description'
                        {...register('description')}
                        placeholder='Nhập mô tả sản phẩm'
                        className='min-h-[100px]'
                     />
                  </div>

                  {/* Các trường kỹ thuật khác giữ nguyên */}
                  <div className='grid grid-cols-2 gap-4'>
                     <div className='space-y-2'>
                        <Label htmlFor='warranty'>Bảo hành</Label>
                        <Input id='warranty' {...register('warranty')} placeholder='Ví dụ: 12 tháng' />
                     </div>
                     <div className='space-y-2'>
                        <Label htmlFor='weight'>Trọng lượng (gram)</Label>
                        <Input
                           id='weight'
                           type='number'
                           {...register('weight', { min: 0 })}
                           placeholder='Nhập trọng lượng'
                        />
                     </div>
                     <div className='space-y-2'>
                        <Label htmlFor='dimensions'>Kích thước</Label>
                        <Input id='dimensions' {...register('dimensions')} placeholder='Ví dụ: 150 x 75 x 8 mm' />
                     </div>
                  </div>

                  <div className='border p-4 rounded-md space-y-4'>
                     <h3 className='font-medium'>Thông số kỹ thuật</h3>
                     <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                           <Label htmlFor='processor'>Vi xử lý</Label>
                           <Input id='processor' {...register('processor')} placeholder='Ví dụ: Apple A15 Bionic' />
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='ram'>RAM</Label>
                           <Input id='ram' {...register('ram')} placeholder='Ví dụ: 8GB LPDDR5' />
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='storage'>Bộ nhớ trong</Label>
                           <Input id='storage' {...register('storage')} placeholder='Ví dụ: 256GB' />
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='display'>Màn hình</Label>
                           <Input
                              id='display'
                              {...register('display')}
                              placeholder='Ví dụ: 6.1 inch Super Retina XDR'
                           />
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='graphics'>Card đồ họa</Label>
                           <Input id='graphics' {...register('graphics')} placeholder='Ví dụ: Apple GPU' />
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='battery'>Pin</Label>
                           <Input id='battery' {...register('battery')} placeholder='Ví dụ: 3240 mAh' />
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='camera'>Camera</Label>
                           <Input id='camera' {...register('camera')} placeholder='Ví dụ: 12MP + 12MP' />
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='operatingSystem'>Hệ điều hành</Label>
                           <Input id='operatingSystem' {...register('operatingSystem')} placeholder='Ví dụ: iOS 16' />
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='connectivity'>Kết nối</Label>
                           <Input
                              id='connectivity'
                              {...register('connectivity')}
                              placeholder='Ví dụ: 5G, Wi-Fi 6, Bluetooth 5.0'
                           />
                        </div>
                        <div className='space-y-2'>
                           <Label htmlFor='otherFeatures'>Tính năng khác</Label>
                           <Input
                              id='otherFeatures'
                              {...register('otherFeatures')}
                              placeholder='Ví dụ: Face ID, chống nước IP68'
                           />
                        </div>
                     </div>
                  </div>

                  <div className='flex items-center space-x-2'>
                     <Controller
                        control={control}
                        name='status'
                        render={({ field }) => (
                           <Switch
                              className='data-[state=checked]:bg-secondaryColor'
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id='status'
                           />
                        )}
                     />
                     <Label htmlFor='status'>Hiển thị sản phẩm</Label>
                  </div>

                  {/* Hiển thị ảnh hiện tại với chức năng xóa và đặt ảnh chính */}
                  <div className='space-y-2'>
                     <Label>Hình ảnh hiện tại</Label>
                     {productImages.length > 0 ? (
                        <div className='grid grid-cols-5 gap-4'>
                           {productImages.map((image) => (
                              <div
                                 key={image.id}
                                 className={`relative aspect-square border rounded-md overflow-hidden cursor-pointer ${
                                    image.isPrimary ? 'ring-2 ring-primaryColor' : ''
                                 }`}
                                 onClick={() => handleSelectPrimaryImage(image.id)}
                              >
                                 <Image src={image.imageUrl} alt='Product image' fill className='object-cover' />
                                 {image.isPrimary && (
                                    <div className='absolute top-1 left-1 bg-primaryColor text-white text-xs px-1 rounded'>
                                       Chính
                                    </div>
                                 )}
                                 <button
                                    type='button'
                                    className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1'
                                    onClick={(e) => {
                                       e.stopPropagation() // Ngăn sự kiện click lan tỏa đến phần tử cha
                                       handleDeleteImage(image.id)
                                    }}
                                 >
                                    <X className='h-3 w-3' />
                                 </button>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <p className='text-sm text-muted-foreground'>Sản phẩm chưa có hình ảnh</p>
                     )}
                  </div>

                  <p className='text-xs text-gray-500 mt-2'>
                     Nhấp vào ảnh để chọn làm ảnh chính. Thay đổi sẽ được áp dụng khi bạn nhấn nút "Cập nhật sản phẩm".
                  </p>

                  <div className='mt-4'>
                     <Label htmlFor='editProductImage'>Thêm hình ảnh mới</Label>
                     <div
                        className='mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-primaryColor'
                        onDragOver={(e) => {
                           e.preventDefault()
                           e.stopPropagation()
                        }}
                        onDrop={(e) => {
                           e.preventDefault()
                           e.stopPropagation()
                           if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                              const newFiles = Array.from(e.dataTransfer.files)
                              const imageFiles = newFiles.filter((file) => file.type.startsWith('image/'))

                              if (imageFiles.length > 0) {
                                 // Tạo preview URLs cho các file mới
                                 const newPreviewUrls = imageFiles.map((file) => URL.createObjectURL(file))

                                 setSelectedFiles((prev) => [...prev, ...imageFiles])
                                 setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
                              }
                           }
                        }}
                     >
                        <input
                           id='editProductImage'
                           type='file'
                           ref={fileInputRef}
                           accept='image/*'
                           multiple
                           onChange={handleFileChange}
                           className='hidden'
                        />
                        <div className='flex flex-col items-center text-center'>
                           <svg
                              className='w-12 h-12 text-gray-400 mb-3'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                              xmlns='http://www.w3.org/2000/svg'
                           >
                              <path
                                 strokeLinecap='round'
                                 strokeLinejoin='round'
                                 strokeWidth='2'
                                 d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                              ></path>
                           </svg>
                           <p className='mb-2 text-sm text-gray-500'>
                              <span className='font-semibold'>Nhấp để tải lên</span> hoặc kéo và thả
                           </p>
                           <p className='text-xs text-gray-500'>PNG, JPG, GIF (Tối đa 10MB)</p>
                        </div>
                        <Button
                           type='button'
                           variant='outline'
                           onClick={() => fileInputRef.current?.click()}
                           className='mt-4'
                        >
                           Chọn ảnh
                        </Button>
                     </div>
                  </div>

                  {/* Hiển thị preview ảnh mới */}
                  {previewUrls.length > 0 && (
                     <div className='mt-4'>
                        <p className='text-sm font-medium mb-2'>Đã chọn {selectedFiles.length} ảnh mới</p>
                        <div className='grid grid-cols-5 gap-4'>
                           {previewUrls.map((url, index) => (
                              <div key={index} className={`relative aspect-square border rounded-md overflow-hidden`}>
                                 <Image src={url} alt={`Preview ${index + 1}`} fill className='object-cover' />
                                 <button
                                    type='button'
                                    className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1'
                                    onClick={(e) => {
                                       e.stopPropagation()
                                       handleRemoveFile(index)
                                    }}
                                 >
                                    <X className='h-3 w-3' />
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  <p className='text-xs text-gray-500'>
                     Hình ảnh mới sẽ được tự động upload sau khi cập nhật sản phẩm thành công.
                     {previewUrls.length > 0 &&
                        productImages.some((img) => img.isPrimary) &&
                        ' Ảnh được đánh dấu là ảnh chính sẽ chỉ được áp dụng nếu sản phẩm chưa có ảnh chính.'}
                  </p>

                  <div className='flex justify-end gap-2'>
                     <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                           setIsEditDialogOpen(false)
                           setEditingProduct(null)
                           setSelectedFiles([])
                           previewUrls.forEach((url) => URL.revokeObjectURL(url))
                           setPreviewUrls([])
                           reset()
                        }}
                     >
                        Hủy
                     </Button>
                     <Button type='submit' disabled={updateProduct.isPending || uploadProductImage.isPending}>
                        {updateProduct.isPending || uploadProductImage.isPending
                           ? 'Đang xử lý...'
                           : 'Cập nhật sản phẩm'}
                     </Button>
                  </div>
               </form>
            </DialogContent>
         </Dialog>

         {/* Phần hiển thị bảng sản phẩm */}
         {isLoading ? (
            <div className='space-y-4'>
               {/* Skeleton loading */}
               <div className='rounded-md border'>
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead className='w-[80px]'>Hình ảnh</TableHead>
                           <TableHead>Tên sản phẩm</TableHead>
                           <TableHead>Danh mục</TableHead>
                           <TableHead>Thương hiệu</TableHead>
                           <TableHead className='text-right'>Giá</TableHead>
                           <TableHead className='text-center'>Tồn kho</TableHead>
                           <TableHead className='text-center'>Trạng thái</TableHead>
                           <TableHead className='text-right'>Thao tác</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {Array(5)
                           .fill(0)
                           .map((_, index) => (
                              <TableRow key={index}>
                                 <TableCell>
                                    <Skeleton className='h-16 w-16 rounded-md' />
                                 </TableCell>
                                 <TableCell>
                                    <Skeleton className='h-4 w-full' />
                                 </TableCell>
                                 <TableCell>
                                    <Skeleton className='h-4 w-20' />
                                 </TableCell>
                                 <TableCell>
                                    <Skeleton className='h-4 w-20' />
                                 </TableCell>
                                 <TableCell>
                                    <Skeleton className='h-4 w-16 ml-auto' />
                                 </TableCell>
                                 <TableCell>
                                    <Skeleton className='h-4 w-8 mx-auto' />
                                 </TableCell>
                                 <TableCell>
                                    <Skeleton className='h-6 w-16 mx-auto rounded-full' />
                                 </TableCell>
                                 <TableCell>
                                    <Skeleton className='h-8 w-24 ml-auto' />
                                 </TableCell>
                              </TableRow>
                           ))}
                     </TableBody>
                  </Table>
               </div>
            </div>
         ) : (
            <>
               <div className='rounded-md border'>
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead className='w-[80px]'>Hình ảnh</TableHead>
                           <TableHead>Tên sản phẩm</TableHead>
                           <TableHead>Danh mục</TableHead>
                           <TableHead>Thương hiệu</TableHead>
                           <TableHead className='text-right'>Giá</TableHead>
                           <TableHead className='text-center'>Tồn kho</TableHead>
                           <TableHead className='text-center'>Trạng thái</TableHead>
                           <TableHead className='text-right'>Thao tác</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {products.length > 0 ? (
                           products.map((product) => (
                              <TableRow key={product.id}>
                                 <TableCell>
                                    <div className='h-16 w-16 relative'>
                                       <Image
                                          src={product.image || '/placeholder.svg'}
                                          alt={decodeHTML(product.name)}
                                          fill
                                          className='object-cover rounded-md'
                                       />
                                    </div>
                                 </TableCell>
                                 <TableCell
                                    title={decodeHTML(product.name)}
                                    className='font-medium max-w-[300px] truncate'
                                 >
                                    {decodeHTML(product.name)}
                                 </TableCell>
                                 <TableCell>{product.categoryName}</TableCell>
                                 <TableCell>{product.brandName || 'N/A'}</TableCell>
                                 <TableCell className='text-right'>
                                    {product.discountedPrice && product.discountedPrice < product.price ? (
                                       <div>
                                          <span className='line-through text-gray-500 text-sm'>
                                             {formatCurrency(product.price)}
                                          </span>
                                          <div className='text-red-500 font-medium'>
                                             {formatCurrency(product.discountedPrice)}
                                          </div>
                                       </div>
                                    ) : (
                                       formatCurrency(product.price)
                                    )}
                                 </TableCell>
                                 <TableCell className='text-center'>
                                    {product.stock > 0 ? (
                                       product.stock <= 5 ? (
                                          <span className='text-amber-500'>{product.stock}</span>
                                       ) : (
                                          <span>{product.stock}</span>
                                       )
                                    ) : (
                                       <span className='text-red-500'>0</span>
                                    )}
                                 </TableCell>
                                 <TableCell className='text-center'>
                                    <Badge variant={product.status ? 'default' : 'destructive'}>
                                       {product.status ? 'Hoạt động' : 'Ẩn'}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className='text-right'>
                                    <Button
                                       variant='outline'
                                       size='icon'
                                       title='Chỉnh sửa'
                                       onClick={() => handleEditProduct(product)}
                                    >
                                       <Edit className='h-4 w-4' />
                                    </Button>
                                 </TableCell>
                              </TableRow>
                           ))
                        ) : (
                           <TableRow>
                              <TableCell colSpan={8} className='text-center py-10 text-muted-foreground'>
                                 Không có sản phẩm nào
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               </div>

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
            </>
         )}
      </div>
   )
}
