'use client'
import React, { useState } from 'react'
import { useAppContext } from '@/context/app.context'
import { useGetOrdersByUserId, useDeleteOrder, useUpdateOrderStatus } from '@/queries/useOrder'
import { useAddToCart } from '@/queries/useCart'
import { decodeHTML, formatCurrency, generateNameId } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ORDER_STATUS, PAYMENT_STATUS } from '@/types/order.type'
import { renderOrderStatusBadge, renderPaymentStatusBadge } from '@/lib/order-utils'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, ShoppingCart } from 'lucide-react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { useIsMobile } from '@/hooks/use-mobile'
import Link from 'next/link'

export default function Purchase() {
   const router = useRouter()
   const { userId } = useAppContext()
   const { data: ordersData, isLoading } = useGetOrdersByUserId(userId!)
   const deleteOrderMutation = useDeleteOrder()
   const updateOrderStatusMutation = useUpdateOrderStatus()
   const addToCartMutation = useAddToCart()
   const isMobile = useIsMobile()

   const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
   const [isOpenCancelDialog, setIsOpenCancelDialog] = useState(false)
   const [isOpenDetailDialog, setIsOpenDetailDialog] = useState(false)
   const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false)
   const [isReordering, setIsReordering] = useState(false)

   const orders = ordersData?.data.data || []

   // Lọc đơn hàng theo trạng thái
   const pendingOrders = orders.filter((order) => order.orderStatus === ORDER_STATUS.PENDING)
   const processingOrders = orders.filter((order) => order.orderStatus === ORDER_STATUS.PROCESSING)
   const shippingOrders = orders.filter((order) => order.orderStatus === ORDER_STATUS.SHIPPED)
   const deliveredOrders = orders.filter((order) => order.orderStatus === ORDER_STATUS.DELIVERED)
   const completedOrders = orders.filter((order) => order.orderStatus === ORDER_STATUS.COMPLETED)
   const cancelledOrders = orders.filter((order) => order.orderStatus === ORDER_STATUS.CANCELLED)

   // Lấy thông tin đơn hàng được chọn
   const selectedOrder = orders.find((order) => order.id === selectedOrderId)

   // Xử lý hủy đơn hàng
   const handleCancelOrder = () => {
      if (selectedOrderId) {
         updateOrderStatusMutation.mutate(
            { id: selectedOrderId, status: ORDER_STATUS.CANCELLED },
            {
               onSuccess: () => {
                  setIsOpenCancelDialog(false)
                  toast.success('Hủy đơn hàng thành công')
               }
            }
         )
      }
   }

   // Xử lý xóa đơn hàng
   const handleDeleteOrder = () => {
      if (selectedOrderId) {
         deleteOrderMutation.mutate(selectedOrderId, {
            onSuccess: () => {
               setIsOpenDeleteDialog(false)
               toast.success('Xóa đơn hàng thành công')
            }
         })
      }
   }

   // Xử lý mua lại
   const handleReorder = (order: any) => {
      if (!userId) {
         toast.error('Vui lòng đăng nhập để thực hiện chức năng này')
         return
      }

      setIsReordering(true)

      // Thêm từng sản phẩm vào giỏ hàng
      const addProductsToCart = async () => {
         try {
            for (const item of order.orderDetails) {
               await addToCartMutation.mutateAsync({
                  userId: userId,
                  productId: item.productId,
                  quantity: item.quantity
               })
            }
            router.push('/cart')
         } catch (error) {
            toast.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng')
         } finally {
            setIsReordering(false)
         }
      }

      addProductsToCart()
   }

   // Hiển thị danh sách đơn hàng
   const renderOrderList = (orderList: typeof orders) => {
      if (orderList.length === 0) {
         return (
            <div className='text-center py-10'>
               <p className='text-gray-500'>Không có đơn hàng nào</p>
            </div>
         )
      }

      return orderList.map((order) => (
         <div key={order.id} className='border rounded-lg p-3 md:p-4 mb-4 shadow-sm'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 pb-3 border-b'>
               <div>
                  <span className='text-gray-500 mr-2'>Mã đơn hàng:</span>
                  <span className='font-medium'>#{order.id}</span>
               </div>
               <div className='flex flex-wrap items-center gap-2'>
                  {renderOrderStatusBadge(order.orderStatus)}
                  {renderPaymentStatusBadge(order.paymentStatus)}
               </div>
            </div>

            {/* Hiển thị sản phẩm đầu tiên và số lượng sản phẩm còn lại */}
            {order.orderDetails.length > 0 && (
               <div className='mb-3'>
                  <div className='flex items-center gap-3 md:gap-4 mb-2'>
                     <div className='w-12 h-12 md:w-16 md:h-16 flex-shrink-0'>
                        <Image
                           src={order.orderDetails[0].productImage}
                           alt={order.orderDetails[0].productName}
                           width={64}
                           height={64}
                           className='rounded object-cover w-full h-full'
                        />
                     </div>
                     <div className='flex-grow'>
                        <p className='font-medium text-sm md:text-base line-clamp-1'>
                           {decodeHTML(order.orderDetails[0].productName)}
                        </p>
                        <p className='text-xs md:text-sm text-gray-500'>
                           {formatCurrency(order.orderDetails[0].price)} x {order.orderDetails[0].quantity}
                        </p>
                     </div>
                  </div>

                  {order.orderDetails.length > 1 && (
                     <p className='text-xs md:text-sm text-gray-500 ml-16'>
                        và {order.orderDetails.length - 1} sản phẩm khác
                     </p>
                  )}
               </div>
            )}

            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3'>
               <div className='text-sm md:text-base'>
                  <span className='text-gray-500 mr-2'>Ngày đặt:</span>
                  <span>{format(new Date(order.createAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
               </div>
               <div className='text-sm md:text-base'>
                  <span className='text-gray-500 mr-2'>Tổng tiền:</span>
                  <span className='text-base md:text-lg font-medium text-secondaryColor'>
                     {formatCurrency(order.totalPrice + order.shippingFee)}
                  </span>
               </div>
            </div>

            <div className='flex flex-wrap justify-end gap-2 mt-3'>
               <Button
                  variant='outline'
                  size={isMobile ? 'sm' : 'default'}
                  onClick={() => {
                     setSelectedOrderId(order.id)
                     setIsOpenDetailDialog(true)
                  }}
               >
                  Xem chi tiết
               </Button>

               {/* Chỉ hiển thị nút hủy đơn hàng khi đơn hàng đang ở trạng thái chờ xác nhận hoặc đang xử lý */}
               {(order.orderStatus === ORDER_STATUS.PENDING || order.orderStatus === ORDER_STATUS.PROCESSING) && (
                  <Button
                     variant='destructive'
                     size={isMobile ? 'sm' : 'default'}
                     onClick={() => {
                        setSelectedOrderId(order.id)
                        setIsOpenCancelDialog(true)
                     }}
                  >
                     Hủy đơn hàng
                  </Button>
               )}

               {/* Hiển thị nút mua lại khi đơn hàng đã hoàn thành hoặc đã hủy */}
               {(order.orderStatus === ORDER_STATUS.COMPLETED || order.orderStatus === ORDER_STATUS.CANCELLED) && (
                  <Button
                     onClick={() => handleReorder(order)}
                     disabled={isReordering}
                     size={isMobile ? 'sm' : 'default'}
                  >
                     {isReordering ? (
                        <>
                           <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                           Đang xử lý
                        </>
                     ) : (
                        <>
                           <ShoppingCart className='mr-2 h-4 w-4' />
                           Mua lại
                        </>
                     )}
                  </Button>
               )}

               {/* Hiển thị nút xóa đơn hàng cho đơn hàng đã hoàn thành hoặc đã hủy */}
               {(order.orderStatus === ORDER_STATUS.COMPLETED || order.orderStatus === ORDER_STATUS.CANCELLED) && (
                  <Button
                     variant='destructive'
                     size={isMobile ? 'sm' : 'default'}
                     onClick={() => {
                        setSelectedOrderId(order.id)
                        setIsOpenDeleteDialog(true)
                     }}
                  >
                     Xóa
                  </Button>
               )}
            </div>
         </div>
      ))
   }

   if (isLoading) {
      return (
         <div className='flex items-center justify-center min-h-[400px]'>
            <Loader2 className='h-8 w-8 animate-spin text-secondaryColor' />
         </div>
      )
   }

   return (
      <div className='container my-6 md:my-10 px-4 md:px-6'>
         <h1 className='text-xl md:text-2xl font-bold mb-4 md:mb-6'>Đơn hàng của tôi</h1>

         <Tabs defaultValue='all'>
            <TabsList className='mb-4 md:mb-6 flex flex-wrap h-full gap-1'>
               <TabsTrigger value='all' className='text-xs md:text-sm'>
                  Tất cả ({orders.length})
               </TabsTrigger>
               <TabsTrigger value='pending' className='text-xs md:text-sm'>
                  Chờ xác nhận ({pendingOrders.length})
               </TabsTrigger>
               <TabsTrigger value='processing' className='text-xs md:text-sm'>
                  Đang xử lý ({processingOrders.length})
               </TabsTrigger>
               <TabsTrigger value='shipping' className='text-xs md:text-sm'>
                  Đang giao ({shippingOrders.length})
               </TabsTrigger>
               <TabsTrigger value='delivered' className='text-xs md:text-sm'>
                  Đã giao ({deliveredOrders.length})
               </TabsTrigger>
               <TabsTrigger value='completed' className='text-xs md:text-sm'>
                  Hoàn thành ({completedOrders.length})
               </TabsTrigger>
               <TabsTrigger value='cancelled' className='text-xs md:text-sm'>
                  Đã hủy ({cancelledOrders.length})
               </TabsTrigger>
            </TabsList>

            <TabsContent value='all'>{renderOrderList(orders)}</TabsContent>
            <TabsContent value='pending'>{renderOrderList(pendingOrders)}</TabsContent>
            <TabsContent value='processing'>{renderOrderList(processingOrders)}</TabsContent>
            <TabsContent value='shipping'>{renderOrderList(shippingOrders)}</TabsContent>
            <TabsContent value='delivered'>{renderOrderList(deliveredOrders)}</TabsContent>
            <TabsContent value='completed'>{renderOrderList(completedOrders)}</TabsContent>
            <TabsContent value='cancelled'>{renderOrderList(cancelledOrders)}</TabsContent>
         </Tabs>

         {/* Dialog xác nhận hủy đơn hàng */}
         <Dialog open={isOpenCancelDialog} onOpenChange={setIsOpenCancelDialog}>
            <DialogContent className='max-w-md mx-4'>
               <DialogHeader>
                  <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
                  <DialogDescription>
                     Bạn có chắc chắn muốn hủy đơn hàng #{selectedOrderId} không? Hành động này không thể hoàn tác.
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter className='flex-col sm:flex-row gap-2'>
                  <Button variant='outline' onClick={() => setIsOpenCancelDialog(false)} className='sm:w-auto w-full'>
                     Hủy
                  </Button>
                  <Button
                     variant='destructive'
                     onClick={handleCancelOrder}
                     disabled={updateOrderStatusMutation.isPending}
                     className='sm:w-auto w-full'
                  >
                     {updateOrderStatusMutation.isPending ? (
                        <>
                           <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                           Đang xử lý
                        </>
                     ) : (
                        'Xác nhận hủy'
                     )}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Dialog chi tiết đơn hàng */}
         <Dialog open={isOpenDetailDialog} onOpenChange={setIsOpenDetailDialog}>
            <DialogContent className='max-w-3xl mx-4 w-[calc(100%-2rem)]'>
               <DialogHeader>
                  <DialogTitle>Chi tiết đơn hàng #{selectedOrderId}</DialogTitle>
               </DialogHeader>

               {selectedOrder && (
                  <div className='space-y-4 max-h-[70vh] overflow-y-auto pr-2'>
                     {/* Thông tin đơn hàng */}
                     <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div>
                           <h3 className='font-medium text-gray-500'>Trạng thái đơn hàng</h3>
                           <div>{renderOrderStatusBadge(selectedOrder.orderStatus)}</div>
                        </div>
                        <div>
                           <h3 className='font-medium text-gray-500'>Trạng thái thanh toán</h3>
                           <div>{renderPaymentStatusBadge(selectedOrder.paymentStatus)}</div>
                        </div>
                        <div>
                           <h3 className='font-medium text-gray-500'>Ngày đặt hàng</h3>
                           <p>{format(new Date(selectedOrder.createAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                        </div>
                        <div>
                           <h3 className='font-medium text-gray-500'>Phương thức thanh toán</h3>
                           <p>{selectedOrder.paymentMethodName}</p>
                        </div>
                     </div>

                     {/* Thông tin giao hàng */}
                     <div className='border-t pt-4'>
                        <h3 className='font-medium mb-2'>Thông tin giao hàng</h3>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                           <div>
                              <p className='text-gray-500'>Người nhận</p>
                              <p>{selectedOrder.userName}</p>
                           </div>
                           <div>
                              <p className='text-gray-500'>Số điện thoại</p>
                              <p>{selectedOrder.phoneNumber}</p>
                           </div>
                           <div className='col-span-1 sm:col-span-2'>
                              <p className='text-gray-500'>Địa chỉ</p>
                              <p>{selectedOrder.address}</p>
                           </div>
                           <div>
                              <p className='text-gray-500'>Phương thức vận chuyển</p>
                              <p>{selectedOrder.shippingMethodName}</p>
                           </div>
                           {selectedOrder.trackingNumber && (
                              <div>
                                 <p className='text-gray-500'>Mã vận đơn</p>
                                 <p>{selectedOrder.trackingNumber}</p>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Danh sách sản phẩm */}
                     <div className='border-t pt-4'>
                        <h3 className='font-medium mb-2'>Sản phẩm</h3>
                        <div className='space-y-3'>
                           {selectedOrder.orderDetails.map((item) => (
                              <Link
                                 href={`/${generateNameId({ name: item.productName, id: item.productId })}`}
                                 key={item.id}
                                 className='flex items-center gap-3 md:gap-4 border-b pb-3'
                              >
                                 <div className='w-12 h-12 md:w-16 md:h-16 flex-shrink-0'>
                                    <Image
                                       src={item.productImage}
                                       alt={item.productName}
                                       width={64}
                                       height={64}
                                       className='rounded object-cover w-full h-full'
                                    />
                                 </div>
                                 <div className='flex-grow'>
                                    <p className='font-medium text-sm md:text-base'>{decodeHTML(item.productName)}</p>
                                    <p className='text-xs md:text-sm text-gray-500'>
                                       {formatCurrency(item.price)} x {item.quantity}
                                    </p>
                                 </div>
                                 <div className='text-right'>
                                    <p className='font-medium text-secondaryColor text-sm md:text-base'>
                                       {formatCurrency(item.totalPrice)}
                                    </p>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     </div>

                     {/* Tổng tiền */}
                     <div className='border-t pt-4'>
                        <div className='flex justify-between mb-1 text-sm md:text-base'>
                           <span>Tạm tính</span>
                           <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                        </div>
                        <div className='flex justify-between mb-1 text-sm md:text-base'>
                           <span>Phí vận chuyển</span>
                           <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                        </div>
                        <div className='flex justify-between font-medium text-base md:text-lg'>
                           <span>Tổng cộng</span>
                           <span className='text-secondaryColor'>
                              {formatCurrency(selectedOrder.totalPrice + selectedOrder.shippingFee)}
                           </span>
                        </div>
                     </div>
                  </div>
               )}

               <DialogFooter className='flex-col sm:flex-row gap-2'>
                  <Button variant='outline' onClick={() => setIsOpenDetailDialog(false)} className='sm:w-auto w-full'>
                     Đóng
                  </Button>

                  {/* Hiển thị các nút thao tác tùy theo trạng thái đơn hàng */}
                  {selectedOrder && (
                     <>
                        {(selectedOrder.orderStatus === ORDER_STATUS.PENDING ||
                           selectedOrder.orderStatus === ORDER_STATUS.PROCESSING) && (
                           <Button
                              variant='destructive'
                              onClick={() => {
                                 setIsOpenDetailDialog(false)
                                 setIsOpenCancelDialog(true)
                              }}
                              className='sm:w-auto w-full'
                           >
                              Hủy đơn hàng
                           </Button>
                        )}

                        {selectedOrder.orderStatus === ORDER_STATUS.DELIVERED && (
                           <Button
                              onClick={() => {
                                 updateOrderStatusMutation.mutate(
                                    { id: selectedOrder.id, status: ORDER_STATUS.COMPLETED },
                                    {
                                       onSuccess: () => {
                                          setIsOpenDetailDialog(false)
                                       }
                                    }
                                 )
                              }}
                              disabled={updateOrderStatusMutation.isPending}
                           >
                              {updateOrderStatusMutation.isPending ? (
                                 <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Đang xử lý
                                 </>
                              ) : (
                                 'Đã nhận hàng'
                              )}
                           </Button>
                        )}

                        {(selectedOrder.orderStatus === ORDER_STATUS.COMPLETED ||
                           selectedOrder.orderStatus === ORDER_STATUS.CANCELLED) && (
                           <Button onClick={() => handleReorder(selectedOrder)} disabled={isReordering}>
                              {isReordering ? (
                                 <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Đang xử lý
                                 </>
                              ) : (
                                 <>
                                    <ShoppingCart className='mr-2 h-4 w-4' />
                                    Mua lại
                                 </>
                              )}
                           </Button>
                        )}
                     </>
                  )}
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Dialog xác nhận xóa đơn hàng */}
         <Dialog open={isOpenDeleteDialog} onOpenChange={setIsOpenDeleteDialog}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Xác nhận xóa đơn hàng</DialogTitle>
                  <DialogDescription>
                     Bạn có chắc chắn muốn xóa đơn hàng #{selectedOrderId} khỏi lịch sử? Hành động này không thể hoàn
                     tác.
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter>
                  <Button variant='outline' onClick={() => setIsOpenDeleteDialog(false)}>
                     Hủy
                  </Button>
                  <Button variant='destructive' onClick={handleDeleteOrder} disabled={deleteOrderMutation.isPending}>
                     {deleteOrderMutation.isPending ? (
                        <>
                           <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                           Đang xử lý
                        </>
                     ) : (
                        'Xác nhận xóa'
                     )}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   )
}
