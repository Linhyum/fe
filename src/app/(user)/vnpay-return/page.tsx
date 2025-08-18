import { CheckCircle, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function PaymentSuccess() {
   return (
      <div className='min-h-screen bg-gradient-to-br py-8 px-4'>
         <div className='max-w-4xl mx-auto'>
            {/* Header thành công */}
            <div className='text-center mb-8'>
               <div className='inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4'>
                  <CheckCircle className='w-12 h-12 text-green-600' />
               </div>
               <h1 className='text-3xl font-bold mb-2'>Thanh toán thành công!</h1>
               <p className='text-gray-600 text-lg'>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.</p>
            </div>

            {/* Thông báo và hành động tiếp theo */}
            <Card className='mt-6 bg-blue-50 border-blue-200'>
               <CardContent className='pt-6'>
                  <div className='flex items-start gap-3'>
                     <Calendar className='w-5 h-5 text-blue-600 mt-0.5' />
                     <div>
                        <h4 className='font-medium text-blue-900 mb-1'>Thời gian giao hàng dự kiến</h4>
                        <p className='text-blue-700 text-sm'>
                           Đơn hàng sẽ được giao trong vòng 2-3 ngày làm việc. Chúng tôi sẽ gửi thông tin theo dõi qua
                           email và SMS.
                        </p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Các nút hành động */}
            <div className='flex flex-col sm:flex-row gap-4 mt-8 justify-center'>
               <Link href={'/products'}>
                  <Button variant='destructive' size='lg'>
                     Tiếp tục mua sắm
                     <ArrowRight className='w-4 h-4 ml-2' />
                  </Button>
               </Link>
               <Link href={'/'}>
                  <Button variant='secondary' size='lg'>
                     Về trang chủ
                  </Button>
               </Link>
            </div>
         </div>
      </div>
   )
}
