'use client'
import { decodeHTML, formatCurrency } from '@/lib/utils'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAppContext } from '@/context/app.context'
import { useGetAllCart } from '@/queries/useCart'
import { useCreateOrder } from '@/queries/useOrder'
import { OrderCreateDTO } from '@/types/order.type'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useGetUserInfo } from '@/queries/useUser'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useGetAllPaymentMethod, useGetAllShippingMethod } from '@/queries/useAdmin'
import { useTranslations } from 'next-intl'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { createPayment } from '@/apiRequest/payment'

export default function Order() {
   const t = useTranslations('Order')
   const { userId } = useAppContext()
   const router = useRouter()
   const [formData, setFormData] = useState<OrderCreateDTO>({
      address: '',
      phoneNumber: '',
      shippingMethodId: 1,
      paymentMethodId: 1
   })
   const [isProcessingPayment, setIsProcessingPayment] = useState(false) // Trạng thái xử lý thanh toán

   // Lấy thông tin phương thức giao hàng
   const getAllShippingMethod = useGetAllShippingMethod()
   const shippingMethods = getAllShippingMethod.data?.data.data || []

   // Lấy thông tin phương thức thanh toán
   const getAllPaymentMethod = useGetAllPaymentMethod()
   const paymentMethods = getAllPaymentMethod.data?.data.data || []

   // Lấy thông tin giỏ hàng
   const { data: cartData, isLoading: isLoadingCart } = useGetAllCart(userId!)
   const cartItems = cartData?.data.data.items.filter((item) => item.selected) || []

   // Lấy thông tin người dùng
   const { data: userData, isLoading: isLoadingUser } = useGetUserInfo(userId!)
   const user = userData?.data.data

   // Tính tổng tiền hàng
   const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)

   // Lấy phí vận chuyển dựa trên phương thức vận chuyển đã chọn
   const selectedShippingMethod = shippingMethods.find((method) => method.id === formData.shippingMethodId)
   const shippingFee = selectedShippingMethod?.baseCost || 0

   // Tính tổng thanh toán
   const total = subtotal + shippingFee

   // Mutation để tạo đơn hàng
   const createOrderMutation = useCreateOrder()

   // Điền thông tin người dùng vào form khi có dữ liệu
   useEffect(() => {
      if (user) {
         setFormData((prev) => ({
            ...prev,
            address: user.address || '',
            phoneNumber: user.phone || ''
         }))
      }
   }, [user])

   // Xử lý thay đổi input
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({
         ...prev,
         [name]: value
      }))
   }

   // Xử lý thay đổi phương thức vận chuyển
   const handleShippingMethodChange = (id: number) => {
      setFormData((prev) => ({
         ...prev,
         shippingMethodId: id
      }))
   }

   // Xử lý thay đổi phương thức thanh toán
   const handlePaymentMethodChange = (id: number) => {
      setFormData((prev) => ({
         ...prev,
         paymentMethodId: id
      }))
   }

   // Xử lý đặt hàng và thanh toán VNPay nếu được chọn
   const handlePlaceOrder = async () => {
      if (!isLoadingCart && cartItems.length === 0) {
         toast.warning(t('validation.selectProducts'))
         router.push('/cart')
         return
      }

      // Kiểm tra thông tin đầu vào
      if (!formData.address.trim()) {
         toast.error(t('validation.addressRequired'))
         return
      }

      if (!formData.phoneNumber.trim()) {
         toast.error(t('validation.phoneRequired'))
         return
      }

      // Kiểm tra định dạng số điện thoại
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(formData.phoneNumber)) {
         toast.error(t('validation.invalidPhone'))
         return
      }

      // Gửi yêu cầu tạo đơn hàng
      createOrderMutation.mutate(
         {
            userId: userId!,
            orderData: formData
         },
         {
            onSuccess: async (response) => {
               const orderId = response.data.data.id // Giả sử API trả về ID đơn hàng
               const selectedPaymentMethod = paymentMethods.find((method) => method.id === formData.paymentMethodId)

               // Kiểm tra nếu phương thức thanh toán là VNPay
               if (selectedPaymentMethod?.methodName.toLowerCase().includes('vnpay')) {
                  try {
                     setIsProcessingPayment(true)
                     const orderInfo = `Thanh toan don hang ${orderId}`
                     const paymentResponse = await createPayment({
                        orderId,
                        amount: total,
                        orderInfo
                     })

                     if (paymentResponse.data.success) {
                        // Chuyển hướng đến URL thanh toán VNPay
                        window.location.href = paymentResponse.data.data.paymentUrl
                     } else {
                        setIsProcessingPayment(false)
                     }
                  } catch (error) {
                     setIsProcessingPayment(false)
                  }
               } else {
                  // Xử lý các phương thức thanh toán khác (ví dụ: COD)
                  toast.success('Đặt hàng thành công')
                  router.push('/') // Chuyển hướng đến trang thành công
               }
            },
            onError: () => {}
         }
      )
   }

   if (isLoadingCart || isLoadingUser) {
      return (
         <div className='flex items-center justify-center my-10 container'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondaryColor'></div>
         </div>
      )
   }

   return (
      <div className='flex flex-col md:flex-row items-start gap-5 my-5 container'>
         {/* Cột thông tin sản phẩm và địa chỉ */}
         <div className='w-full md:w-2/3 bg-secondary rounded-lg shadow-lg p-5'>
            <h1 className='text-2xl font-medium mb-5'>{t('confirmOrder')}</h1>

            {/* Thông tin người nhận */}
            <div className='border-b border-gray-200 pb-5 mb-5'>
               <h2 className='font-semibold text-lg mb-3'>{t('shippingAddress')}</h2>
               <div className='space-y-3'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                     <div>
                        <label className='block text-sm font-medium mb-1'>{t('recipientName')}</label>
                        <Input
                           className='border-primary'
                           type='text'
                           value={user?.surName + ' ' + user?.lastName || ''}
                           disabled
                        />
                     </div>
                     <div>
                        <label className='block text-sm font-medium mb-1'>{t('phoneNumber')}</label>
                        <Input
                           className='border-primary'
                           type='text'
                           name='phoneNumber'
                           value={formData.phoneNumber}
                           onChange={handleInputChange}
                           placeholder={t('enterPhoneNumber')}
                        />
                     </div>
                  </div>
                  <div>
                     <label className='block text-sm font-medium mb-1'>{t('address')}</label>
                     <Textarea
                        className='border-primary'
                        name='address'
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder={t('enterShippingAddress')}
                        rows={2}
                     />
                  </div>
               </div>
            </div>

            {/* Phương thức vận chuyển */}
            <div className='border-b border-gray-200 pb-5 mb-5'>
               <h2 className='font-semibold text-lg mb-3'>{t('shippingMethod')}</h2>
               <div className='space-y-3'>
                  {shippingMethods
                     .filter((method) => method.isActive)
                     .map((method) => (
                        <label
                           key={method.id}
                           className='flex items-start p-3 border rounded cursor-pointer hover:border-secondaryColor'
                        >
                           <input
                              type='radio'
                              name='shippingMethod'
                              className='mt-1 cursor-pointer w-4 h-4 accent-secondaryColor'
                              checked={formData.shippingMethodId === method.id}
                              onChange={() => handleShippingMethodChange(method.id)}
                           />
                           <div className='ml-3'>
                              <div className='font-medium'>{method.methodName}</div>
                              <div className='text-sm text-gray-500'>{method.description}</div>
                              <div className='text-sm text-gray-500'>
                                 {t('estimatedDays', { days: method.estimatedDays })}
                              </div>
                              <div className='text-secondaryColor'>{formatCurrency(method.baseCost)}</div>
                           </div>
                        </label>
                     ))}
               </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div>
               <h2 className='font-semibold text-lg mb-3'>{t('products', { count: cartItems.length })}</h2>
               <div className='w-full'>
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead className='w-[80px]'>{t('image')}</TableHead>
                           <TableHead>{t('name')}</TableHead>
                           <TableHead className='text-center'>{t('price')}</TableHead>
                           <TableHead className='text-center w-[80px]'>{t('quantity')}</TableHead>
                           <TableHead className='text-right'>{t('total')}</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {cartItems.map((item) => (
                           <TableRow key={item.id}>
                              <TableCell>
                                 <Image
                                    width={60}
                                    height={60}
                                    src={item.productImage}
                                    alt={item.productName}
                                    className='rounded aspect-square object-cover'
                                 />
                              </TableCell>
                              <TableCell>
                                 <h3 className='font-medium line-clamp-2'>{decodeHTML(item.productName)}</h3>
                              </TableCell>
                              <TableCell className='text-center'>
                                 {item.originalPrice !== item.price && (
                                    <span className='text-gray-400 line-through block text-sm'>
                                       {formatCurrency(item.originalPrice)}
                                    </span>
                                 )}
                                 <span>{formatCurrency(item.price)}</span>
                              </TableCell>
                              <TableCell className='text-center'>x{item.quantity}</TableCell>
                              <TableCell className='text-right font-medium text-secondaryColor'>
                                 {formatCurrency(item.totalPrice)}
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </div>
            </div>
         </div>

         {/* Cột phương thức thanh toán */}
         <div className='w-full md:w-1/3 bg-secondary rounded-lg shadow-lg p-5 sticky top-0'>
            <h2 className='text-xl font-semibold mb-5'>{t('paymentMethod')}</h2>
            <div className='space-y-3 mb-5'>
               {paymentMethods
                  .filter((method) => method.isActive)
                  .map((method) => (
                     <label
                        key={method.id}
                        className='flex items-start gap-3 p-3 border rounded cursor-pointer hover:border-secondaryColor'
                     >
                        <input
                           type='radio'
                           name='paymentMethod'
                           className='mt-1 cursor-pointer w-4 h-4 accent-secondaryColor'
                           checked={formData.paymentMethodId === method.id}
                           onChange={() => handlePaymentMethodChange(method.id)}
                        />
                        <div>
                           <div className='font-medium'>{method.methodName}</div>
                           <div className='text-sm text-gray-500'>{method.description}</div>
                        </div>
                     </label>
                  ))}
            </div>

            {/* Tổng thanh toán */}
            <div className='space-y-3'>
               <div className='flex justify-between'>
                  <span>{t('subtotal')}</span>
                  <span>{formatCurrency(subtotal)}</span>
               </div>
               <div className='flex justify-between'>
                  <span>{t('shippingFee')}</span>
                  <span>{formatCurrency(shippingFee)}</span>
               </div>
               <div className='flex justify-between font-medium text-lg'>
                  <span>{t('total')}</span>
                  <span className='text-secondaryColor'>{formatCurrency(total)}</span>
               </div>
            </div>

            {/* Nút đặt hàng */}
            <div className='mt-5 space-y-3'>
               <Link href='/cart' className='text-secondaryColor'>
                  {t('backToCart')}
               </Link>
               <button
                  onClick={handlePlaceOrder}
                  disabled={createOrderMutation.isPending || isProcessingPayment}
                  className='w-full py-3 bg-secondaryColor text-white rounded hover:bg-secondaryColor/90 disabled:opacity-70'
               >
                  {createOrderMutation.isPending || isProcessingPayment ? t('loading') : t('placeOrder')}
               </button>
            </div>
         </div>
      </div>
   )
}
