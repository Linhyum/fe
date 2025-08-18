'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface PaymentResult {
   success: boolean
   orderId?: string
   amount?: number
   transactionId?: string
   bankCode?: string
   paymentDate?: string
   message?: string
}

export default function VNPayReturn() {
   const searchParams = useSearchParams()
   const router = useRouter()
   const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
   const [isLoading, setIsLoading] = useState(true)

   useEffect(() => {
      const processPaymentResult = () => {
         // Lấy các tham số từ URL
         const vnp_ResponseCode = searchParams?.get('vnp_ResponseCode')
         const vnp_TxnRef = searchParams?.get('vnp_TxnRef')
         const vnp_Amount = searchParams?.get('vnp_Amount')
         const vnp_TransactionNo = searchParams?.get('vnp_TransactionNo')
         const vnp_BankCode = searchParams?.get('vnp_BankCode')
         const vnp_PayDate = searchParams?.get('vnp_PayDate')

         // Xử lý kết quả thanh toán
         const success = vnp_ResponseCode === '00'
         const amount = vnp_Amount ? Number.parseInt(vnp_Amount) / 100 : 0 // VNPay trả về amount * 100

         let message = ''
         switch (vnp_ResponseCode) {
            case '00':
               message = 'Giao dịch thành công'
               break
            case '01':
               message = 'Giao dịch đã tồn tại'
               break
            case '02':
               message = 'Merchant không hợp lệ'
               break
            case '03':
               message = 'Dữ liệu gửi sang không đúng định dạng'
               break
            case '04':
               message = 'Khởi tạo GD không thành công do Website đang bị tạm khóa'
               break
            case '05':
               message = 'Giao dịch không thành công do: Quý khách nhập sai mật khẩu thanh toán quá số lần quy định'
               break
            case '06':
               message = 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch'
               break
            case '07':
               message = 'Giao dịch bị nghi ngờ là giao dịch gian lận'
               break
            case '09':
               message =
                  'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking'
               break
            case '10':
               message =
                  'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần'
               break
            case '11':
               message = 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán'
               break
            case '24':
               message = 'Giao dịch không thành công do: Khách hàng hủy giao dịch'
               break
            default:
               message = 'Giao dịch không thành công'
         }

         setPaymentResult({
            success,
            orderId: vnp_TxnRef || undefined,
            amount,
            transactionId: vnp_TransactionNo || undefined,
            bankCode: vnp_BankCode || undefined,
            paymentDate: vnp_PayDate || undefined,
            message
         })
         setIsLoading(false)
      }

      processPaymentResult()
   }, [searchParams])

   if (isLoading) {
      return (
         <div className='min-h-screen flex items-center justify-center'>
            <div className='text-center'>
               <Loader2 className='w-12 h-12 animate-spin mx-auto mb-4 text-blue-600' />
               <p className='text-lg'>Đang xử lý kết quả thanh toán...</p>
            </div>
         </div>
      )
   }

   return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
         <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-6'>
            <div className='text-center mb-6'>
               {paymentResult?.success ? (
                  <CheckCircle className='w-16 h-16 text-green-500 mx-auto mb-4' />
               ) : (
                  <XCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
               )}

               <h1 className={`text-2xl font-bold mb-2 ${paymentResult?.success ? 'text-green-600' : 'text-red-600'}`}>
                  {paymentResult?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
               </h1>

               <p className='text-gray-600'>{paymentResult?.message}</p>
            </div>

            {paymentResult && (
               <div className='space-y-3 mb-6'>
                  {paymentResult.orderId && (
                     <div className='flex justify-between'>
                        <span className='text-gray-600'>Mã đơn hàng:</span>
                        <span className='font-medium'>#{paymentResult.orderId}</span>
                     </div>
                  )}

                  {paymentResult.amount && (
                     <div className='flex justify-between'>
                        <span className='text-gray-600'>Số tiền:</span>
                        <span className='font-medium text-green-600'>{formatCurrency(paymentResult.amount)}</span>
                     </div>
                  )}

                  {paymentResult.transactionId && (
                     <div className='flex justify-between'>
                        <span className='text-gray-600'>Mã giao dịch:</span>
                        <span className='font-medium'>{paymentResult.transactionId}</span>
                     </div>
                  )}

                  {paymentResult.bankCode && (
                     <div className='flex justify-between'>
                        <span className='text-gray-600'>Ngân hàng:</span>
                        <span className='font-medium'>{paymentResult.bankCode}</span>
                     </div>
                  )}

                  {paymentResult.paymentDate && (
                     <div className='flex justify-between'>
                        <span className='text-gray-600'>Thời gian:</span>
                        <span className='font-medium'>
                           {new Date(
                              paymentResult.paymentDate.replace(
                                 /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
                                 '$1-$2-$3T$4:$5:$6'
                              )
                           ).toLocaleString('vi-VN')}
                        </span>
                     </div>
                  )}
               </div>
            )}

            <div className='space-y-3'>
               {paymentResult?.success ? (
                  <>
                     <Link
                        href={`/order-success/${paymentResult.orderId}`}
                        className='w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors block text-center'
                     >
                        Xem chi tiết đơn hàng
                     </Link>
                     <Link
                        href='/'
                        className='w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors block text-center'
                     >
                        Về trang chủ
                     </Link>
                  </>
               ) : (
                  <>
                     <Link
                        href='/cart'
                        className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors block text-center'
                     >
                        Quay lại giỏ hàng
                     </Link>
                     <Link
                        href='/'
                        className='w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors block text-center'
                     >
                        Về trang chủ
                     </Link>
                  </>
               )}
            </div>
         </div>
      </div>
   )
}
