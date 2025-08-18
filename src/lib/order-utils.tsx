import React from 'react'
import { Badge } from '@/components/ui/badge'
import { ORDER_STATUS, PAYMENT_STATUS } from '@/types/order.type'

/**
 * Hiển thị badge trạng thái đơn hàng
 * @param status Mã trạng thái đơn hàng
 * @returns Badge component
 */
export const renderOrderStatusBadge = (status: number) => {
   switch (status) {
      case ORDER_STATUS.PENDING:
         return (
            <Badge variant='outline' className='bg-amber-50 text-amber-600 border-amber-300'>
               Chờ xác nhận
            </Badge>
         )
      case ORDER_STATUS.PROCESSING:
         return (
            <Badge variant='outline' className='bg-blue-50 text-blue-600 border-blue-300'>
               Đang xử lý
            </Badge>
         )
      case ORDER_STATUS.SHIPPED:
         return (
            <Badge variant='outline' className='bg-purple-50 text-purple-600 border-purple-300'>
               Đang giao
            </Badge>
         )
      case ORDER_STATUS.DELIVERED:
         return (
            <Badge variant='outline' className='bg-green-50 text-green-600 border-green-300'>
               Đã giao
            </Badge>
         )
      case ORDER_STATUS.COMPLETED:
         return (
            <Badge variant='outline' className='bg-green-50 text-green-600 border-green-300'>
               Hoàn thành
            </Badge>
         )
      case ORDER_STATUS.CANCELLED:
         return (
            <Badge variant='outline' className='bg-red-50 text-red-600 border-red-300'>
               Đã hủy
            </Badge>
         )
      default:
         return <Badge variant='outline'>Không xác định</Badge>
   }
}

/**
 * Hiển thị badge trạng thái thanh toán
 * @param status Mã trạng thái thanh toán
 * @returns Badge component
 */
export const renderPaymentStatusBadge = (status: string) => {
   switch (status) {
      case PAYMENT_STATUS.PENDING:
         return (
            <Badge variant='outline' className='bg-amber-50 text-amber-600 border-amber-300'>
               Chờ thanh toán
            </Badge>
         )
      case PAYMENT_STATUS.PAID:
         return (
            <Badge variant='outline' className='bg-green-50 text-green-600 border-green-300'>
               Đã thanh toán
            </Badge>
         )
      case PAYMENT_STATUS.FAILED:
         return (
            <Badge variant='outline' className='bg-red-50 text-red-600 border-red-300'>
               Thanh toán thất bại
            </Badge>
         )
      case PAYMENT_STATUS.REFUNDED:
         return (
            <Badge variant='outline' className='bg-blue-50 text-blue-600 border-blue-300'>
               Đã hoàn tiền
            </Badge>
         )
      default:
         return <Badge variant='outline'>Không xác định</Badge>
   }
}
