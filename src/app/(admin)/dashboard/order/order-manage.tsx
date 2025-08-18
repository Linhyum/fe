'use client'
import { useGetAllAdminOrder, useUpdateOrderPayment, useUpdateOrderStatus } from '@/queries/useAdmin'
import type React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, Search } from 'lucide-react'
import Paginate from '@/components/paginate'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { GetOrderQueryParamsType, OrderType } from '@/types/admin.type'
import { ORDER_STATUS, PAYMENT_STATUS } from '@/types/order.type'
import { renderOrderStatusBadge, renderPaymentStatusBadge } from '@/lib/order-utils'
import { Skeleton } from '@/components/ui/skeleton'
import { decodeHTML } from '@/lib/utils'

export default function OrderManage() {
   const [currentPage, setCurrentPage] = useState<number>(1)
   const [queryParams, setQueryParams] = useState<GetOrderQueryParamsType>({
      page: currentPage - 1,
      size: 10,
      sortBy: 'id',
      sortDir: 'desc',
      search: ''
   })
   const [searchTerm, setSearchTerm] = useState('')
   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
   const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)
   const [isMobile, setIsMobile] = useState(false)

   const getAllAdminOrder = useGetAllAdminOrder(queryParams)
   const orders = getAllAdminOrder.data?.data.data.content || []
   const totalPages = getAllAdminOrder.data?.data.data.totalPages || 0

   const updateOrderStatus = useUpdateOrderStatus()
   const updateOrderPayment = useUpdateOrderPayment()

   useEffect(() => {
      const checkIfMobile = () => {
         setIsMobile(window.innerWidth < 640)
      }

      // Kiểm tra khi component mount
      checkIfMobile()

      // Thêm event listener
      window.addEventListener('resize', checkIfMobile)

      // Cleanup
      return () => {
         window.removeEventListener('resize', checkIfMobile)
      }
   }, [])

   // Update page in queryParams when currentPage changes
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
      // Reset to page 1 when changing filter
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
      // Reset to page 1 when changing display count
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

   const openViewDialog = (order: OrderType) => {
      setSelectedOrder(order)
      setIsViewDialogOpen(true)
   }

   // Xử lý cập nhật trạng thái đơn hàng
   const handleUpdateOrderStatus = (id: number, status: number) => {
      updateOrderStatus.mutate(
         { id, status },
         {
            onSuccess: () => {
               // Refresh dữ liệu sau khi cập nhật
               getAllAdminOrder.refetch()

               // Cập nhật trạng thái trong dialog nếu đang mở
               if (selectedOrder && selectedOrder.id === id) {
                  setSelectedOrder((prev) => {
                     if (!prev) return null
                     return {
                        ...prev,
                        orderStatus: status,
                        orderStatusText: getStatusTextFromCode(status)
                     }
                  })
               }
            }
         }
      )
   }

   // Xử lý cập nhật trạng thái thanh toán
   const handleUpdatePaymentStatus = (id: number, paymentStatus: string) => {
      updateOrderPayment.mutate(
         { id, paymentStatus },
         {
            onSuccess: () => {
               // Refresh dữ liệu sau khi cập nhật
               getAllAdminOrder.refetch()

               // Cập nhật trạng thái trong dialog nếu đang mở
               if (selectedOrder && selectedOrder.id === id) {
                  setSelectedOrder((prev) => {
                     if (!prev) return null
                     return {
                        ...prev,
                        paymentStatus
                     }
                  })
               }
            }
         }
      )
   }

   // Chuyển đổi mã trạng thái thành text
   const getStatusTextFromCode = (statusCode: number): string => {
      switch (statusCode) {
         case ORDER_STATUS.PENDING:
            return 'Pending'
         case ORDER_STATUS.PROCESSING:
            return 'Processing'
         case ORDER_STATUS.SHIPPED:
            return 'Shipped'
         case ORDER_STATUS.DELIVERED:
            return 'Delivered'
         case ORDER_STATUS.COMPLETED:
            return 'Completed'
         case ORDER_STATUS.CANCELLED:
            return 'Cancelled'
         default:
            return 'Unknown'
      }
   }

   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
   }

   const formatDate = (dateString: string) => {
      try {
         return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
      } catch (error) {
         return dateString
      }
   }

   return (
      <div className='container mx-auto p-6'>
         <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5'>
            <h1 className='text-2xl font-bold'>Quản lý đơn hàng</h1>
         </div>
         <div className='flex flex-wrap items-center gap-3 md:gap-4 mb-5'>
            <div className='flex items-center gap-2 w-full sm:w-auto'>
               <Input
                  placeholder='Tìm kiếm đơn hàng...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className='w-full sm:w-[250px]'
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
            <div className='flex flex-wrap items-center gap-3 md:gap-4'>
               <div className='flex items-center gap-2'>
                  <span className=' whitespace-nowrap'>Hiển thị:</span>
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
                  <span className=' whitespace-nowrap'>Sắp xếp:</span>
                  <Select value={`${queryParams.sortBy}-${queryParams.sortDir}`} onValueChange={handleSortChange}>
                     <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder='Mới nhất' />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value='id-desc'>Mới nhất</SelectItem>
                        <SelectItem value='id-asc'>Cũ nhất</SelectItem>
                        <SelectItem value='totalPrice-desc'>Giá cao đến thấp</SelectItem>
                        <SelectItem value='totalPrice-asc'>Giá thấp đến cao</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
            </div>
         </div>

         {getAllAdminOrder.isLoading ? (
            <div className='overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0'>
               <Table className='min-w-full'>
                  <TableHeader>
                     <TableRow>
                        <TableHead className='w-[60px]'>ID</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead className='hidden md:table-cell'>Ngày tạo</TableHead>
                        <TableHead className='text-right'>Tổng tiền</TableHead>
                        <TableHead className='hidden md:table-cell'>Phương thức thanh toán</TableHead>
                        <TableHead className='hidden sm:table-cell'>Trạng thái thanh toán</TableHead>
                        <TableHead>Trạng thái đơn hàng</TableHead>
                        <TableHead className='text-right'>Thao tác</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {Array(5)
                        .fill(0)
                        .map((_, index) => (
                           <TableRow key={index}>
                              <TableCell>
                                 <Skeleton className='h-4 w-8' />
                              </TableCell>
                              <TableCell>
                                 <div className='space-y-2'>
                                    <Skeleton className='h-4 w-32' />
                                    <Skeleton className='h-3 w-24 md:hidden' />
                                 </div>
                              </TableCell>
                              <TableCell className='hidden md:table-cell'>
                                 <Skeleton className='h-4 w-28' />
                              </TableCell>
                              <TableCell className='text-right'>
                                 <Skeleton className='h-4 w-20 ml-auto' />
                              </TableCell>
                              <TableCell className='hidden md:table-cell'>
                                 <Skeleton className='h-4 w-24' />
                              </TableCell>
                              <TableCell className='hidden sm:table-cell'>
                                 <Skeleton className='h-6 w-24 rounded-full' />
                              </TableCell>
                              <TableCell>
                                 <Skeleton className='h-6 w-24 rounded-full' />
                              </TableCell>
                              <TableCell className='text-right'>
                                 <Skeleton className='h-8 w-8 rounded-md ml-auto' />
                              </TableCell>
                           </TableRow>
                        ))}
                  </TableBody>
               </Table>
            </div>
         ) : (
            <div className='overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0'>
               <Table className='min-w-full'>
                  <TableHeader>
                     <TableRow>
                        <TableHead className='w-[60px]'>ID</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead className='hidden md:table-cell'>Ngày tạo</TableHead>
                        <TableHead className='text-right'>Tổng tiền</TableHead>
                        <TableHead className='hidden md:table-cell'>Phương thức thanh toán</TableHead>
                        <TableHead className='hidden sm:table-cell'>Trạng thái thanh toán</TableHead>
                        <TableHead>Trạng thái đơn hàng</TableHead>
                        <TableHead className='text-right'>Thao tác</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {orders.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={8} className='text-center'>
                              Không có đơn hàng nào
                           </TableCell>
                        </TableRow>
                     ) : (
                        orders.map((order) => (
                           <TableRow key={order.id}>
                              <TableCell>{order.id}</TableCell>
                              <TableCell>
                                 <div>
                                    <p className='font-medium'>{order.userName}</p>
                                    <p className='text-xs text-gray-500 md:hidden'>{formatDate(order.createAt)}</p>
                                    <p className='text-xs text-gray-500 md:hidden'>{order.paymentMethodName}</p>
                                 </div>
                              </TableCell>
                              <TableCell className='hidden md:table-cell'>{formatDate(order.createAt)}</TableCell>
                              <TableCell className='text-right font-medium'>
                                 {formatCurrency(order.totalPrice)}
                              </TableCell>
                              <TableCell className='hidden md:table-cell'>{order.paymentMethodName}</TableCell>
                              <TableCell className='hidden sm:table-cell'>
                                 {renderPaymentStatusBadge(order.paymentStatus)}
                              </TableCell>
                              <TableCell>{renderOrderStatusBadge(order.orderStatus)}</TableCell>
                              <TableCell className='text-right'>
                                 <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={() => openViewDialog(order)}
                                    className='h-8 w-8'
                                 >
                                    <Eye className='h-4 w-4' />
                                 </Button>
                              </TableCell>
                           </TableRow>
                        ))
                     )}
                  </TableBody>
               </Table>
            </div>
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

         {/* Chi tiết đơn hàng */}
         <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6'>
               <DialogHeader>
                  <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.id}</DialogTitle>
               </DialogHeader>
               {selectedOrder && (
                  <div className='space-y-4 md:space-y-6'>
                     <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
                        <div className='space-y-3'>
                           <h3 className='font-semibold mb-2'>Thông tin đơn hàng</h3>
                           <div className='space-y-1  '>
                              <p>Mã đơn hàng: #{selectedOrder.id}</p>
                              <p>Ngày đặt: {formatDate(selectedOrder.createAt)}</p>
                              <p>Tổng tiền: {formatCurrency(selectedOrder.totalPrice)}</p>
                              <p>Phí vận chuyển: {formatCurrency(selectedOrder.shippingFee)}</p>
                              <p>Phương thức vận chuyển: {selectedOrder.shippingMethodName}</p>
                              <p>Phương thức thanh toán: {selectedOrder.paymentMethodName}</p>
                           </div>

                           <div className='mt-4 pt-4 border-t'>
                              <h4 className='font-semibold mb-2'>Trạng thái thanh toán:</h4>
                              <div className='flex flex-wrap gap-2 mb-2'>
                                 {renderPaymentStatusBadge(selectedOrder.paymentStatus)}
                              </div>
                              <Select
                                 value={selectedOrder.paymentStatus}
                                 onValueChange={(value) => handleUpdatePaymentStatus(selectedOrder.id, value)}
                                 disabled={updateOrderPayment.isPending}
                              >
                                 <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Chọn trạng thái thanh toán' />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value={PAYMENT_STATUS.PENDING}>Chờ thanh toán</SelectItem>
                                    <SelectItem value={PAYMENT_STATUS.PAID}>Đã thanh toán</SelectItem>
                                    <SelectItem value={PAYMENT_STATUS.FAILED}>Thanh toán thất bại</SelectItem>
                                    <SelectItem value={PAYMENT_STATUS.REFUNDED}>Đã hoàn tiền</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>
                        <div className='space-y-3'>
                           <h3 className='font-semibold mb-2'>Thông tin khách hàng</h3>
                           <div className='space-y-1 '>
                              <p>Tên khách hàng: {selectedOrder.userName}</p>
                              <p>Địa chỉ: {selectedOrder.address}</p>
                              <p>Số điện thoại: {selectedOrder.phoneNumber}</p>
                           </div>

                           <div className='mt-4 pt-4 border-t'>
                              <h4 className='font-semibold mb-2'>Trạng thái đơn hàng:</h4>
                              <div className='flex flex-wrap gap-2 mb-2'>
                                 {renderOrderStatusBadge(selectedOrder.orderStatus)}
                              </div>
                              <Select
                                 value={selectedOrder.orderStatus.toString()}
                                 onValueChange={(value) => handleUpdateOrderStatus(selectedOrder.id, parseInt(value))}
                                 disabled={updateOrderStatus.isPending}
                              >
                                 <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Chọn trạng thái đơn hàng' />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value={ORDER_STATUS.PENDING.toString()}>Chờ xác nhận</SelectItem>
                                    <SelectItem value={ORDER_STATUS.PROCESSING.toString()}>Đang xử lý</SelectItem>
                                    <SelectItem value={ORDER_STATUS.SHIPPED.toString()}>Đang giao</SelectItem>
                                    <SelectItem value={ORDER_STATUS.DELIVERED.toString()}>Đã giao</SelectItem>
                                    <SelectItem value={ORDER_STATUS.COMPLETED.toString()}>Hoàn thành</SelectItem>
                                    <SelectItem value={ORDER_STATUS.CANCELLED.toString()}>Đã hủy</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>
                     </div>

                     <div className='pt-4 border-t'>
                        <h3 className='font-semibold mb-3'>Chi tiết sản phẩm</h3>
                        <div className='overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0'>
                           <Table className='min-w-full'>
                              <TableHeader>
                                 <TableRow>
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead className='text-right'>Đơn giá</TableHead>
                                    <TableHead className='text-right'>Số lượng</TableHead>
                                    <TableHead className='text-right'>Thành tiền</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {selectedOrder.orderDetails.map((detail) => (
                                    <TableRow key={detail.id}>
                                       <TableCell>
                                          <div className='flex items-center gap-2'>
                                             {detail.productImage && (
                                                <div className='w-12 h-12 rounded aspect-square overflow-hidden flex-shrink-0'>
                                                   <img
                                                      src={detail.productImage}
                                                      alt={detail.productName}
                                                      className='w-full h-full object-contain'
                                                   />
                                                </div>
                                             )}
                                             <span title={decodeHTML(detail.productName)} className='truncate max-w-56'>
                                                {decodeHTML(detail.productName)}
                                             </span>
                                          </div>
                                       </TableCell>
                                       <TableCell className='text-right'>{formatCurrency(detail.price)}</TableCell>
                                       <TableCell className='text-right'>{detail.quantity}</TableCell>
                                       <TableCell className='text-right font-medium'>
                                          {formatCurrency(detail.totalPrice)}
                                       </TableCell>
                                    </TableRow>
                                 ))}
                                 <TableRow>
                                    <TableCell colSpan={3} className='text-right font-medium'>
                                       Tổng tiền sản phẩm:
                                    </TableCell>
                                    <TableCell className='text-right font-medium'>
                                       {formatCurrency(selectedOrder.totalPrice)}
                                    </TableCell>
                                 </TableRow>
                                 <TableRow>
                                    <TableCell colSpan={3} className='text-right font-medium'>
                                       Phí vận chuyển:
                                    </TableCell>
                                    <TableCell className='text-right font-medium'>
                                       {formatCurrency(selectedOrder.shippingFee)}
                                    </TableCell>
                                 </TableRow>
                                 <TableRow>
                                    <TableCell colSpan={3} className='text-right font-bold'>
                                       Tổng thanh toán:
                                    </TableCell>
                                    <TableCell className='text-right font-bold text-primary'>
                                       {formatCurrency(selectedOrder.totalPrice + selectedOrder.shippingFee)}
                                    </TableCell>
                                 </TableRow>
                              </TableBody>
                           </Table>
                        </div>
                     </div>
                  </div>
               )}
               <DialogFooter className='mt-6 flex-col sm:flex-row gap-2'>
                  <Button variant='outline' onClick={() => setIsViewDialogOpen(false)} className='w-full sm:w-auto'>
                     Đóng
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   )
}
