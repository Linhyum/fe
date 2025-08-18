import http from '@/lib/http'
import queryString from 'query-string'

export const createPayment = (queryParams: { orderId: number; amount: number; orderInfo: string }) =>
   http.post('/payment/create-payment?' + queryString.stringify(queryParams))

export const paymentReturn = () => http.get('/payment/vnpay-return')
export const paymentIPN = () => http.get('/payment/vnpay-ipn')
