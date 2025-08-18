'use client'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle
} from '@/components/ui/dialog'
import QuantityController from '@/components/quantity-controller'
import { useAppContext } from '@/context/app.context'
import { decodeHTML, formatCurrency, generateNameId } from '@/lib/utils'
import { useClearCart, useDeleteCartItem, useGetAllCart, useUpdateCart, useUpdateSelectedCart } from '@/queries/useCart'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

export default function Cart() {
   const searchParams = useSearchParams()
   const purchaseId = searchParams?.get('purchaseId')
   const t = useTranslations('Cart')
   const { userId } = useAppContext()
   const updateSelectedCart = useUpdateSelectedCart()
   const getAllCart = useGetAllCart(userId!)
   const cartData = getAllCart.data?.data.data.items || []
   const updateCart = useUpdateCart()
   const deleteCartItem = useDeleteCartItem()
   const clearCart = useClearCart()
   const [isOpenDialog, setIsOpenDialog] = useState(false)
   const [checkedItems, setCheckedItems] = useState<number[]>([])

   // Khởi tạo checkedItems từ cartData khi dữ liệu được tải
   useEffect(() => {
      if (cartData.length > 0) {
         const selectedItems = cartData.filter((item) => item.selected).map((item) => item.id)
         setCheckedItems(selectedItems)
      }
   }, [cartData])

   const handleQuantityChange = (cartItemId: number, value: number) => {
      if (userId) {
         updateCart.mutate({
            userId: userId,
            cartItemId: cartItemId,
            quantity: value
         })
      }
   }
   const handleDeleteCartItem = (cartItemId: number) => {
      if (userId) {
         deleteCartItem.mutate({
            userId: userId,
            cartItemId: cartItemId
         })
      }
   }

   const handleClearCart = () => {
      if (userId) {
         clearCart.mutate(
            { userId: userId },
            {
               onSuccess: () => {
                  setIsOpenDialog(false)
                  setCheckedItems([])
               }
            }
         )
      }
   }

   const handleCheckAll = (checked: boolean) => {
      if (checked) {
         const allItemIds = cartData.map((item) => item.id)
         setCheckedItems(allItemIds)
         // Cập nhật trạng thái đã chọn lên server
         if (userId) {
            updateSelectedCart.mutate({
               userId: userId,
               cartItemIds: allItemIds
            })
         }
      } else {
         setCheckedItems([])
         // Cập nhật trạng thái đã chọn lên server (bỏ chọn tất cả)
         if (userId) {
            updateSelectedCart.mutate({
               userId: userId,
               cartItemIds: []
            })
         }
      }
   }

   const handleCheckItem = (checked: boolean, itemId: number) => {
      let newCheckedItems: number[]

      if (checked) {
         newCheckedItems = [...checkedItems, itemId]
      } else {
         newCheckedItems = checkedItems.filter((id) => id !== itemId)
      }

      setCheckedItems(newCheckedItems)

      // Cập nhật trạng thái đã chọn lên server
      if (userId) {
         updateSelectedCart.mutate({
            userId: userId,
            cartItemIds: newCheckedItems
         })
      }
   }

   const isAllChecked = cartData.length > 0 && checkedItems.length === cartData.length

   const checkedCartItems = cartData.filter((item) => checkedItems.includes(item.id))

   const totalCheckedAmount = checkedCartItems.reduce((sum, item) => sum + item.totalPrice, 0)

   const totalSavedAmount = checkedCartItems.reduce((sum, item) => {
      const originalPrice = item.originalPrice
      const savedPerItem = (originalPrice - item.price) * item.quantity
      return sum + savedPerItem
   }, 0)

   useEffect(() => {
      if (purchaseId) {
         const cartId = cartData.find((item) => item.productId === Number(purchaseId))?.id
         handleCheckItem(true, Number(cartId))
      }
   }, [purchaseId])
   return (
      <div className='my-10 container'>
         <div className='overflow-auto'>
            <div className='min-w-[1200px]'>
               <div className='grid grid-cols-12 rounded-sm bg-secondary py-5 px-9 capitalize shadow'>
                  <div className='col-span-6'>
                     <div className='flex items-center'>
                        <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                           <input
                              type='checkbox'
                              className='h-5 w-5 accent-secondaryColor cursor-pointer'
                              checked={isAllChecked}
                              onChange={(e) => handleCheckAll(e.target.checked)}
                           />
                        </div>
                        <div className='flex-grow'>{t('product')}</div>
                     </div>
                  </div>
                  <div className='col-span-6'>
                     <div className='grid grid-cols-5 text-center'>
                        <div className='col-span-2'>{t('unitPrice')}</div>
                        <div className='col-span-1'>{t('quantity')}</div>
                        <div className='col-span-1'>{t('total')}</div>
                        <div className='col-span-1'>{t('actions')}</div>
                     </div>
                  </div>
               </div>
               <div className='my-3 rounded-sm bg-secondary p-5 shadow flex flex-col gap-y-5'>
                  {cartData.length > 0 ? (
                     cartData.map((cart) => (
                        <div
                           key={cart.id}
                           className='grid grid-cols-12 items-center rounded-sm border border-gray-200 py-5 px-4 text-center'
                        >
                           <div className='col-span-6 flex'>
                              <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                                 <input
                                    type='checkbox'
                                    className='h-5 w-5 accent-secondaryColor cursor-pointer'
                                    checked={checkedItems.includes(cart.id)}
                                    onChange={(e) => handleCheckItem(e.target.checked, cart.id)}
                                 />
                              </div>
                              <Link
                                 className='flex flex-grow items-center'
                                 href={`/${generateNameId({ name: cart.productName, id: cart.productId })}`}
                              >
                                 <div className='h-20 w-20 flex-shrink-0'>
                                    <Image
                                       width={80}
                                       height={80}
                                       className='w-[80px] h-[80px]'
                                       src={cart.productImage}
                                       alt={cart.productName}
                                    />
                                 </div>
                                 <div className='flex-grow px-2 text-left line-clamp-2'>
                                    {decodeHTML(cart.productName)}
                                 </div>
                              </Link>
                           </div>
                           <div className='col-span-6 grid grid-cols-5 items-center'>
                              <div className='col-span-2'>
                                 <div className='flex items-center gap-x-3 justify-center'>
                                    {cart.originalPrice !== cart.price && (
                                       <span className='text-gray-400 line-through'>
                                          {formatCurrency(cart.originalPrice)}
                                       </span>
                                    )}
                                    <span>{formatCurrency(cart.price)}</span>
                                 </div>
                              </div>
                              <div className='col-span-1'>
                                 <QuantityController
                                    value={cart.quantity}
                                    max={cart.stock}
                                    onIncrease={(value) => handleQuantityChange(cart.id, value)}
                                    onDecrease={(value) => handleQuantityChange(cart.id, value)}
                                    onType={(value) => handleQuantityChange(cart.id, value)}
                                    onFocusOut={(value) => handleQuantityChange(cart.id, value)}
                                 />
                              </div>
                              <div className='col-span-1'>
                                 <span className='text-secondaryColor'>{formatCurrency(cart.totalPrice)}</span>
                              </div>
                              <div className='col-span-1'>
                                 <button
                                    onClick={() => handleDeleteCartItem(cart.id)}
                                    className='transition-colors hover:text-secondaryColor'
                                 >
                                    <Trash2 />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className='text-center py-10'>
                        <p className='text-lg text-gray-500 mb-4'>{t('emptyCart')}</p>
                        <Link
                           href='/'
                           className='px-4 py-2 bg-secondaryColor text-white rounded hover:bg-secondaryColor/90'
                        >
                           {t('continueShopping')}
                        </Link>
                     </div>
                  )}
               </div>
            </div>
         </div>
         {cartData.length > 0 && (
            <div className='sticky bottom-0 z-10 mt-5 flex flex-col rounded-sm bg-secondary p-5 shadow md:flex-row md:items-center'>
               <div className='flex gap-x-5 items-center text-base'>
                  <div className='flex flex-shrink-0 items-center justify-center'>
                     <input
                        id='selectAll'
                        type='checkbox'
                        className='h-5 w-5 accent-secondaryColor cursor-pointer'
                        checked={isAllChecked}
                        onChange={(e) => handleCheckAll(e.target.checked)}
                     />
                  </div>
                  <label htmlFor='selectAll' className='cursor-pointer'>
                     {t('selectAll', { count: cartData.length })}
                  </label>
                  <button
                     disabled={checkedItems.length === 0}
                     onClick={() => setIsOpenDialog(true)}
                     className={`${
                        checkedItems.length === 0
                           ? 'cursor-not-allowed opacity-70'
                           : 'hover:text-secondaryColor transition-colors'
                     }`}
                  >
                     {t('delete')}
                  </button>
               </div>
               <div className='mt-5 flex flex-col sm:ml-auto sm:mt-0 sm:flex-row sm:items-center'>
                  <div>
                     <div className='flex items-center'>
                        <div className='text-base'>{t('totalPayment', { count: checkedCartItems.length })}</div>
                        <div className='ml-2 text-2xl text-secondaryColor'>{formatCurrency(totalCheckedAmount)}</div>
                     </div>
                     <div className='flex items-center text-sm gap-x-5 sm:justify-end'>
                        <div>{t('saved')}</div>
                        <div className='text-secondaryColor'>{formatCurrency(totalSavedAmount)}</div>
                     </div>
                  </div>
                  <Link
                     href={checkedItems.length > 0 ? '/order' : '#'}
                     className={`mt-5 flex h-10 w-52 items-center justify-center bg-secondaryColor uppercase text-white hover:bg-secondaryColor/90 sm:ml-4 sm:mt-0 ${
                        checkedItems.length === 0 ? 'cursor-not-allowed opacity-70' : ''
                     }`}
                  >
                     {t('checkout')}
                  </Link>
                  <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
                     <DialogContent>
                        <DialogHeader>
                           <DialogTitle>{t('deleteConfirmation')}</DialogTitle>
                           <DialogDescription>{t('deleteConfirmationMessage')}</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                           <Button variant='outline' onClick={() => setIsOpenDialog(false)}>
                              {t('cancel')}
                           </Button>
                           <Button variant='destructive' onClick={handleClearCart}>
                              {t('confirmDelete')}
                           </Button>
                        </DialogFooter>
                     </DialogContent>
                  </Dialog>
               </div>
            </div>
         )}
      </div>
   )
}
