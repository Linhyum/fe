import { ResponseData } from './utils.type'

export interface OrderCreateDTO {
   address: string
   phoneNumber: string
   shippingMethodId: number
   paymentMethodId: number
   discountCode?: string
}

export interface OrderDetail {
   id: number
   productId: number
   productName: string
   productImage: string
   quantity: number
   price: number
   totalPrice: number
}

export interface Order {
   id: number
   userId: number
   userName: string
   totalPrice: number
   shippingFee: number
   address: string
   phoneNumber: string
   shippingMethodId: number
   shippingMethodName: string
   paymentMethodId: number
   paymentMethodName: string
   trackingNumber: string
   createAt: string
   paymentStatus: string
   orderStatus: number
   orderStatusText: string
   orderDetails: OrderDetail[]
}

export interface OrderResponse extends ResponseData<Order> {}
export interface OrdersResponse extends ResponseData<Order[]> {}

export interface OrderStatusUpdate {
   id: number
   status: number
}

export interface PaymentStatusUpdate {
   id: number
   paymentStatus: string
}

export interface TrackingNumberUpdate {
   id: number
   trackingNumber: string
}

export const ORDER_STATUS = {
   PENDING: 0,
   PROCESSING: 1,
   SHIPPED: 2,
   DELIVERED: 3,
   COMPLETED: 4,
   CANCELLED: 5
}

export const PAYMENT_STATUS = {
   PENDING: 'Pending',
   PAID: 'Paid',
   FAILED: 'Failed',
   REFUNDED: 'Refunded'
}
