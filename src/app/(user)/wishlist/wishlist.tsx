'use client'
import React, { useState } from 'react'
import { useAppContext } from '@/context/app.context'
import { useGetWishlist, useRemoveFromWishlist } from '@/queries/useWishlist'
import { useAddToCart } from '@/queries/useCart'
import { decodeHTML, formatCurrency, generateNameId } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, Loader2, ShoppingCart, Star, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { WishlistItem } from '@/types/wishlist.type'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function Wishlist() {
   const { userId } = useAppContext()
   const { data: wishlistData, isLoading } = useGetWishlist(userId!)
   const removeFromWishlist = useRemoveFromWishlist()
   const addToCart = useAddToCart()

   const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null)
   const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
   const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null)

   const wishlistItems = wishlistData?.data.data || []

   // Xử lý xóa sản phẩm khỏi wishlist
   const handleRemoveFromWishlist = (item: WishlistItem) => {
      setSelectedItem(item)
      setIsRemoveDialogOpen(true)
   }

   // Xác nhận xóa sản phẩm khỏi wishlist
   const confirmRemove = () => {
      if (selectedItem) {
         removeFromWishlist.mutate({
            userId: userId!,
            productId: selectedItem.productId
         })
         setIsRemoveDialogOpen(false)
      }
   }

   // Xử lý thêm sản phẩm vào giỏ hàng
   const handleAddToCart = (productId: number) => {
      setIsAddingToCart(productId)
      addToCart.mutate(
         {
            userId: userId!,
            productId: productId,
            quantity: 1
         },
         {
            onSuccess: () => {
               setIsAddingToCart(null)
            },
            onError: () => {
               toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng')
               setIsAddingToCart(null)
            }
         }
      )
   }

   if (isLoading) {
      return (
         <div className='container mx-auto py-8'>
            <h1 className='text-2xl font-bold mb-6'>Sản phẩm yêu thích</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
               {Array(4)
                  .fill(0)
                  .map((_, index) => (
                     <div key={index} className=' rounded-lg shadow-sm p-4 border'>
                        <Skeleton className='w-full h-48 rounded-md mb-4' />
                        <Skeleton className='w-3/4 h-6 rounded-md mb-2' />
                        <Skeleton className='w-1/2 h-5 rounded-md mb-4' />
                        <div className='flex gap-2'>
                           <Skeleton className='w-1/2 h-10 rounded-md' />
                           <Skeleton className='w-1/2 h-10 rounded-md' />
                        </div>
                     </div>
                  ))}
            </div>
         </div>
      )
   }

   if (wishlistItems.length === 0) {
      return (
         <div className='container mx-auto py-8'>
            <h1 className='text-2xl font-bold mb-6'>Sản phẩm yêu thích</h1>
            <div className=' rounded-lg shadow-sm p-8 border text-center'>
               <div className='flex justify-center mb-4'>
                  <Heart className='w-16 h-16 text-gray-300' />
               </div>
               <h2 className='text-xl font-medium mb-2'>Danh sách yêu thích trống</h2>
               <p className='text-gray-500 mb-6'>Bạn chưa thêm sản phẩm nào vào danh sách yêu thích</p>
               <Link href='/'>
                  <Button>Khám phá sản phẩm</Button>
               </Link>
            </div>
         </div>
      )
   }

   return (
      <div className='container mx-auto py-8'>
         <h1 className='text-2xl font-bold mb-6'>Sản phẩm yêu thích ({wishlistItems.length})</h1>

         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {wishlistItems.map((item) => (
               <div key={item.id} className=' rounded-lg shadow-sm p-4 border relative bg-primary-foreground'>
                  {/* Nút xóa */}
                  <button
                     onClick={() => handleRemoveFromWishlist(item)}
                     className='absolute top-0 right-0 p-2 rounded-full shadow-sm bg-red-200 z-50'
                     aria-label='Xóa khỏi danh sách yêu thích'
                  >
                     <Trash2 className='w-4 h-4 text-red-500' />
                  </button>

                  {/* Hình ảnh sản phẩm */}
                  <Link href={`/${generateNameId({ name: item.productName, id: item.productId })}`}>
                     <div className='mb-4 overflow-hidden rounded-md aspect-square'>
                        <Image
                           src={item.productImage}
                           alt={item.productName}
                           width={300}
                           height={300}
                           className='w-full h-full object-contain transition-transform hover:scale-105'
                        />
                     </div>
                  </Link>

                  {/* Thông tin sản phẩm */}
                  <Link href={`/${generateNameId({ name: item.productName, id: item.productId })}`}>
                     <h3 className='font-medium text-lg mb-2 line-clamp-2 hover:text-secondaryColor transition-colors'>
                        {decodeHTML(item.productName)}
                     </h3>
                  </Link>

                  <div className='mt-2 flex items-center justify-between'>
                     <div className='flex items-center gap-2'>
                        {item.discountedPrice && item.productPrice && item.discountedPrice < item.productPrice && (
                           <div className='text-gray-500 text-xs line-through'>{formatCurrency(item.productPrice)}</div>
                        )}
                        <div className='text-secondaryColor font-bold'>
                           {formatCurrency(item.discountedPrice || item.productPrice || 0)}
                        </div>
                     </div>
                  </div>

                  <div className='text-xs text-gray-500 mb-4'>
                     Đã thêm vào: {format(new Date(item.addedAt), 'dd/MM/yyyy', { locale: vi })}
                  </div>

                  {/* Các nút thao tác */}
                  <div className='flex gap-2'>
                     <Button
                        variant='outline'
                        className='flex-1 text-sm'
                        onClick={() => handleAddToCart(item.productId)}
                        disabled={isAddingToCart === item.productId}
                     >
                        {isAddingToCart === item.productId ? (
                           <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        ) : (
                           <ShoppingCart className='w-4 h-4 mr-2' />
                        )}
                        Thêm vào giỏ
                     </Button>

                     <Link
                        href={`/${generateNameId({ name: item.productName, id: item.productId })}`}
                        className='flex-1'
                     >
                        <Button className='w-full text-sm'>Xem chi tiết</Button>
                     </Link>
                  </div>
               </div>
            ))}
         </div>

         {/* Dialog xác nhận xóa */}
         <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Xóa sản phẩm khỏi danh sách yêu thích?</AlertDialogTitle>
                  <AlertDialogDescription>
                     Bạn có chắc chắn muốn xóa sản phẩm "{decodeHTML(selectedItem?.productName!)}" khỏi danh sách yêu
                     thích?
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmRemove} className='bg-red-500 hover:bg-red-600'>
                     {removeFromWishlist.isPending ? (
                        <>
                           <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                           Đang xử lý
                        </>
                     ) : (
                        'Xóa'
                     )}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   )
}
