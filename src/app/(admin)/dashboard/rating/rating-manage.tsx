'use client'
import { useGetAllRating } from '@/queries/useAdmin'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RatingQueryParamsType } from '@/types/rating.type'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import ProductRating from '@/components/product-rating'
import ReactPaginate from 'react-paginate'
import Link from 'next/link'
import { generateNameId } from '@/lib/utils'

export default function RatingManage() {
   const [currentPage, setCurrentPage] = useState(1)
   const [searchTerm, setSearchTerm] = useState('')
   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
   const [selectedRating, setSelectedRating] = useState<any>(null)
   const [queryParams, setQueryParams] = useState<RatingQueryParamsType & { search?: string }>({
      page: 0,
      size: 10,
      sortBy: 'createAt',
      sortDir: 'desc',
      search: ''
   })

   // Lấy dữ liệu đánh giá
   const getAllRating = useGetAllRating(queryParams)
   const ratings = getAllRating.data?.data.data.content || []
   const totalPages = getAllRating.data?.data.data.totalPages || 0

   // Cập nhật page trong queryParams khi currentPage thay đổi
   useEffect(() => {
      setQueryParams((prev) => ({
         ...prev,
         page: currentPage - 1
      }))
   }, [currentPage])

   // Xử lý tìm kiếm
   const handleSearch = () => {
      setCurrentPage(1)
      setQueryParams((prev) => ({
         ...prev,
         search: searchTerm.trim(),
         page: 0
      }))
   }

   // Xử lý khi nhấn Enter trong ô tìm kiếm
   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
         handleSearch()
      }
   }

   // Xử lý thay đổi sắp xếp
   const handleSortChange = (value: string) => {
      const [sortBy, sortDir] = value.split('-')
      setQueryParams((prev) => ({
         ...prev,
         sortBy,
         sortDir,
         page: 0
      }))
      setCurrentPage(1)
   }

   // Xử lý phân trang
   const handlePageClick = (e: { selected: number }) => {
      setCurrentPage(e.selected + 1)
   }

   // Xem chi tiết đánh giá
   const handleViewRating = (rating: any) => {
      setSelectedRating(rating)
      setIsViewDialogOpen(true)
   }

   return (
      <div className='container mx-auto p-4'>
         <Card>
            <CardHeader>
               <CardTitle>
                  <h1 className='text-2xl font-bold'>Quản lý đánh giá</h1>
               </CardTitle>
            </CardHeader>
            <CardContent>
               {/* Thanh công cụ */}
               <div className='flex flex-col md:flex-row gap-4 mb-6'>
                  <div className='flex gap-2 flex-1'>
                     <Input
                        placeholder='Tìm kiếm theo tên người dùng hoặc nội dung...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                     />
                     <Button onClick={handleSearch}>Tìm kiếm</Button>
                  </div>
                  <div className='flex items-center gap-2'>
                     <span className='text-sm whitespace-nowrap'>Sắp xếp theo:</span>
                     <Select value={`${queryParams.sortBy}-${queryParams.sortDir}`} onValueChange={handleSortChange}>
                        <SelectTrigger className='w-[180px]'>
                           <SelectValue placeholder='Sắp xếp theo' />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value='createAt-desc'>Mới nhất</SelectItem>
                           <SelectItem value='createAt-asc'>Cũ nhất</SelectItem>
                           <SelectItem value='rating-desc'>Đánh giá cao nhất</SelectItem>
                           <SelectItem value='rating-asc'>Đánh giá thấp nhất</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               {/* Danh sách đánh giá */}
               {getAllRating.isLoading ? (
                  <div className='space-y-4'>
                     {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className='flex gap-4 p-4 border rounded-lg'>
                           <Skeleton className='h-12 w-12 rounded-full' />
                           <div className='space-y-2 flex-1'>
                              <Skeleton className='h-4 w-1/4' />
                              <Skeleton className='h-4 w-full' />
                              <Skeleton className='h-4 w-3/4' />
                           </div>
                        </div>
                     ))}
                  </div>
               ) : ratings.length > 0 ? (
                  <div className='space-y-4'>
                     {ratings.map((rating) => (
                        <div key={rating.id} className='flex flex-col md:flex-row gap-4 p-4 border rounded-lg'>
                           <div className='flex items-start gap-3 flex-1'>
                              <Avatar className='h-10 w-10'>
                                 <AvatarImage src={rating.userPicture} alt={rating.userName} />
                                 <AvatarFallback>{rating.userName?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className='flex-1'>
                                 <div className='flex items-center gap-2'>
                                    <span className='font-medium'>{rating.userName}</span>
                                    <span className='text-xs text-gray-500'>
                                       {rating.createAt &&
                                          format(new Date(rating.createAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </span>
                                 </div>
                                 <div className='flex items-center gap-2 my-1'>
                                    <ProductRating
                                       rating={rating.rating}
                                       classNameStar1='w-4 h-4 fill-yellow-300 text-yellow-300'
                                       classNameStar2='w-4 h-4 fill-current text-gray-300'
                                    />
                                 </div>
                                 <p className='mt-1 line-clamp-2'>{rating.comment}</p>

                                 {/* Hiển thị số lượng hình ảnh và phản hồi */}
                                 <div className='flex items-center gap-4 mt-2 text-sm text-gray-500'>
                                    {rating.imageUrls && rating.imageUrls.length > 0 && (
                                       <span>{rating.imageUrls.length} hình ảnh</span>
                                    )}
                                    {rating.replies && rating.replies.length > 0 && (
                                       <span>{rating.replies.length} phản hồi</span>
                                    )}
                                 </div>
                              </div>
                           </div>
                           <div className='flex items-center gap-2 self-end md:self-center'>
                              <Button variant='outline' size='sm' onClick={() => handleViewRating(rating)}>
                                 Xem chi tiết
                              </Button>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className='text-center py-10 text-gray-500'>
                     <p>Không tìm thấy đánh giá nào</p>
                  </div>
               )}

               {/* Phân trang */}
               {totalPages > 1 && (
                  <div className='flex justify-center mt-6'>
                     <ReactPaginate
                        previousLabel={'←'}
                        nextLabel={'→'}
                        breakLabel={'...'}
                        pageCount={totalPages}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={handlePageClick}
                        containerClassName={'flex gap-2 items-center'}
                        pageClassName={'border rounded hover:bg-gray-50'}
                        pageLinkClassName={'flex items-center justify-center w-8 h-8'}
                        previousClassName={'border rounded hover:bg-gray-50'}
                        previousLinkClassName={'flex items-center justify-center w-8 h-8'}
                        nextClassName={'border rounded hover:bg-gray-50'}
                        nextLinkClassName={'flex items-center justify-center w-8 h-8'}
                        breakClassName={'flex items-center justify-center'}
                        activeClassName={'bg-primaryColor text-white hover:bg-primaryColor/90'}
                        forcePage={currentPage - 1}
                     />
                  </div>
               )}
            </CardContent>
         </Card>

         {/* Dialog xem chi tiết đánh giá */}
         <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
               <DialogHeader>
                  <DialogTitle>Chi tiết đánh giá</DialogTitle>
                  <DialogDescription>Thông tin chi tiết về đánh giá và phản hồi</DialogDescription>
               </DialogHeader>

               {selectedRating && (
                  <div className='space-y-4'>
                     {/* Thông tin người đánh giá */}
                     <div className='flex items-start gap-3'>
                        <Avatar className='h-10 w-10'>
                           <AvatarImage src={selectedRating.userPicture} alt={selectedRating.userName} />
                           <AvatarFallback>{selectedRating.userName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                           <div className='flex items-center gap-2'>
                              <span className='font-medium'>{selectedRating.userName}</span>
                              <span className='text-xs text-gray-500'>
                                 {selectedRating.createAt &&
                                    format(new Date(selectedRating.createAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                              </span>
                           </div>
                           <div className='flex items-center gap-2 my-1'>
                              <ProductRating
                                 rating={selectedRating.rating}
                                 classNameStar1='w-4 h-4 fill-yellow-300 text-yellow-300'
                                 classNameStar2='w-4 h-4 fill-current text-gray-300'
                              />
                           </div>
                        </div>
                     </div>

                     {/* Nội dung đánh giá */}
                     <div>
                        <h3 className='font-medium mb-2'>Nội dung đánh giá:</h3>
                        <p className='whitespace-pre-line'>{selectedRating.comment}</p>
                     </div>

                     {/* Hình ảnh đánh giá */}
                     {selectedRating.imageUrls && selectedRating.imageUrls.length > 0 && (
                        <div>
                           <h3 className='font-medium mb-2'>Hình ảnh:</h3>
                           <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
                              {selectedRating.imageUrls.map((imageUrl: string, idx: number) => (
                                 <div key={idx} className='relative aspect-square rounded-md overflow-hidden border'>
                                    <Image src={imageUrl} alt={`Rating image ${idx}`} fill className='object-cover' />
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Thông tin sản phẩm */}
                     <div>
                        <h3 className='font-medium mb-2'>Sản phẩm:</h3>
                        <Link
                           href={`/${generateNameId({
                              name: selectedRating.productName,
                              id: selectedRating.productId
                           })}`}
                           target='_blank'
                           className='flex items-center gap-3 p-3 border rounded-md'
                        >
                           {selectedRating.productImage && (
                              <div className='relative w-16 h-16 rounded overflow-hidden'>
                                 <Image
                                    src={selectedRating.productImage}
                                    alt={selectedRating.productName || 'Product image'}
                                    fill
                                    className='object-cover'
                                 />
                              </div>
                           )}
                           <div>
                              <p className='font-medium'>{selectedRating.productName}</p>
                              <p className='text-sm text-gray-500'>ID: {selectedRating.productId}</p>
                           </div>
                        </Link>
                     </div>

                     {/* Phản hồi */}
                     {selectedRating.replies && selectedRating.replies.length > 0 && (
                        <div>
                           <Separator className='my-4' />
                           <h3 className='font-medium mb-2'>Phản hồi ({selectedRating.replies.length}):</h3>
                           <div className='space-y-4 pl-4 border-l-2 border-gray-200'>
                              {selectedRating.replies.map((reply: any) => (
                                 <div key={reply.id} className='pt-3'>
                                    <div className='flex items-start gap-3'>
                                       <Avatar className='h-8 w-8'>
                                          <AvatarImage src={reply.userPicture} alt={reply.userName} />
                                          <AvatarFallback>{reply.userName?.charAt(0) || 'U'}</AvatarFallback>
                                       </Avatar>
                                       <div className='flex-1'>
                                          <div className='flex items-center gap-2'>
                                             <span className='font-medium'>{reply.userName}</span>
                                             <span className='text-xs text-gray-500'>
                                                {reply.createAt &&
                                                   format(new Date(reply.createAt), 'dd/MM/yyyy HH:mm', {
                                                      locale: vi
                                                   })}
                                             </span>
                                          </div>
                                          <p className='mt-1'>{reply.comment}</p>

                                          {/* Hình ảnh của phản hồi */}
                                          {reply.imageUrls && reply.imageUrls.length > 0 && (
                                             <div className='grid grid-cols-3 gap-2 mt-2'>
                                                {reply.imageUrls.map((imageUrl: string, idx: number) => (
                                                   <div
                                                      key={idx}
                                                      className='relative aspect-square rounded-md overflow-hidden border'
                                                   >
                                                      <Image
                                                         src={imageUrl}
                                                         alt={`Reply image ${idx}`}
                                                         fill
                                                         className='object-cover'
                                                      />
                                                   </div>
                                                ))}
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               )}
            </DialogContent>
         </Dialog>
      </div>
   )
}
