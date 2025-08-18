import {
   createOrder,
   getOrderById,
   getOrdersByUserId,
   updateOrderStatus,
   updatePaymentStatus,
   updateTrackingNumber,
   deleteOrder,
   countOrdersByUser
} from '@/apiRequest/order'
import { OrderCreateDTO } from '@/types/order.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

// Hook để tạo đơn hàng mới
export const useCreateOrder = () => {
   const router = useRouter()
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: ({ userId, orderData }: { userId: number; orderData: OrderCreateDTO }) =>
         createOrder(userId, orderData),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['orders'] })
         queryClient.invalidateQueries({ queryKey: ['cart'] })

         // router.push(`/account/orders/${orderId}`)
      },
      onError: () => {
         toast.error('Đặt hàng thất bại. Vui lòng thử lại sau.')
      }
   })
}

// Hook để lấy thông tin đơn hàng theo ID
export const useGetOrderById = (id: number) => {
   return useQuery({
      queryKey: ['order', id],
      queryFn: () => getOrderById(id),
      enabled: !!id
   })
}

// Hook để lấy danh sách đơn hàng của người dùng
export const useGetOrdersByUserId = (userId: number) => {
   return useQuery({
      queryKey: ['orders', userId],
      queryFn: () => getOrdersByUserId(userId),
      enabled: !!userId
   })
}

// Hook để cập nhật trạng thái đơn hàng
export const useUpdateOrderStatus = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: ({ id, status }: { id: number; status: number }) => updateOrderStatus(id, status),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['orders'] })
         toast.success('Cập nhật trạng thái đơn hàng thành công')
      },
      onError: () => {
         toast.error('Cập nhật trạng thái đơn hàng thất bại')
      }
   })
}

// Hook để cập nhật trạng thái thanh toán
export const useUpdatePaymentStatus = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: ({ id, paymentStatus }: { id: number; paymentStatus: string }) =>
         updatePaymentStatus(id, paymentStatus),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['orders'] })
         toast.success('Cập nhật trạng thái thanh toán thành công')
      },
      onError: () => {
         toast.error('Cập nhật trạng thái thanh toán thất bại')
      }
   })
}

// Hook để cập nhật mã vận đơn
export const useUpdateTrackingNumber = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: ({ id, trackingNumber }: { id: number; trackingNumber: string }) =>
         updateTrackingNumber(id, trackingNumber),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['orders'] })
         toast.success('Cập nhật mã vận đơn thành công')
      },
      onError: () => {
         toast.error('Cập nhật mã vận đơn thất bại')
      }
   })
}

// Hook để hủy đơn hàng
export const useDeleteOrder = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (id: number) => deleteOrder(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['orders'] })
      }
   })
}

// Hook để đếm số lượng đơn hàng của người dùng
export const useCountOrdersByUser = (userId: number) => {
   return useQuery({
      queryKey: ['orders-count', userId],
      queryFn: () => countOrdersByUser(userId),
      enabled: !!userId
   })
}
