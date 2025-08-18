import http from '@/lib/http'
import { OrderCreateDTO, OrderResponse, OrdersResponse } from '@/types/order.type'
import { ResponseData } from '@/types/utils.type'
// Tạo đơn hàng mới
export const createOrder = (userId: number, orderData: OrderCreateDTO) =>
   http.post<OrderResponse>(`/orders?userId=${userId}`, orderData)
// Lấy thông tin đơn hàng theo ID
export const getOrderById = (id: number) => http.get<OrderResponse>(`/orders/${id}`)
// Lấy danh sách đơn hàng của người dùng
export const getOrdersByUserId = (userId: number) => http.get<OrdersResponse>(`/orders/user/${userId}`)
// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = (id: number, status: number) =>
   http.put<OrderResponse>(`/orders/${id}/status?status=${status}`)
// Cập nhật trạng thái thanh toán
export const updatePaymentStatus = (id: number, paymentStatus: string) =>
   http.put<OrderResponse>(`/orders/${id}/payment?paymentStatus=${paymentStatus}`)
// Cập nhật mã vận đơn
export const updateTrackingNumber = (id: number, trackingNumber: string) =>
   http.put<OrderResponse>(`/orders/${id}/tracking?trackingNumber=${trackingNumber}`)
// Hủy đơn hàng
export const deleteOrder = (id: number) => http.delete<ResponseData<null>>(`/orders/${id}`)
// Đếm số lượng đơn hàng của người dùng
export const countOrdersByUser = (userId: number) => http.get<ResponseData<number>>(`/orders/count?userId=${userId}`)
