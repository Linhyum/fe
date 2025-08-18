'use client'
import type { ProductType } from '@/types/product.type'
import type React from 'react'

import { decodeHTML, formatCurrency, generateNameId } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Star, Scale, Zap, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAddToCart } from '@/queries/useCart'
import { useAppContext } from '@/context/app.context'
import { useAddToWishlist, useCheckProductInWishlist, useRemoveFromWishlist } from '@/queries/useWishlist'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslations } from 'next-intl'

interface ProductCardProps {
   product: ProductType
   onSelectForCompare?: (product: ProductType) => void
   isSelectedForCompare?: boolean
   layout?: 'grid' | 'list'
}

export default function ProductCard({
   product,
   onSelectForCompare,
   isSelectedForCompare = false,
   layout = 'grid'
}: ProductCardProps) {
   const { userId } = useAppContext()
   const addToCart = useAddToCart()
   const addToWishlist = useAddToWishlist()
   const removeFromWishlist = useRemoveFromWishlist()
   const { data: isInWishlist } = useCheckProductInWishlist(userId || 0, product.id)
   const [isWishlistLoading, setIsWishlistLoading] = useState(false)
   const [imageError, setImageError] = useState(false)
   const t = useTranslations('ProductCard')

   // Xử lý thêm/xóa sản phẩm khỏi danh sách yêu thích
   const handleWishlistToggle = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!userId) {
         toast.warning(t('loginRequired'))
         return
      }

      setIsWishlistLoading(true)

      if (isInWishlist?.data.data) {
         removeFromWishlist.mutate({ userId, productId: product.id }, { onSettled: () => setIsWishlistLoading(false) })
      } else {
         addToWishlist.mutate({ userId, productId: product.id }, { onSettled: () => setIsWishlistLoading(false) })
      }
   }

   // Xử lý thêm vào giỏ hàng
   const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!userId) {
         toast.warning(t('loginRequired'))
         return
      }

      addToCart.mutate({ userId, productId: product.id, quantity: 1 })
   }

   // Đảm bảo product.name và product.id tồn tại trước khi tạo URL
   const productUrl = product?.name && product?.id ? `/${generateNameId({ name: product.name, id: product.id })}` : '#'

   if (layout === 'list') {
      return (
         <Card className='overflow-hidden bg-secondary transition-all hover:shadow-lg group border border-border/40'>
            <div className='flex'>
               {/* Image Section */}
               <Link href={productUrl} className='relative w-48 h-48 flex-shrink-0'>
                  <div className='relative h-full w-full overflow-hidden'>
                     {product.discountPercentage > 0 && (
                        <Badge className='absolute top-2 left-2 z-10 bg-secondaryColor hover:bg-secondaryColor text-white'>
                           -{product.discountPercentage.toFixed(0)}%
                        </Badge>
                     )}
                     {product.stock <= 5 && product.stock > 0 && (
                        <Badge className='absolute top-2 right-2 z-10 bg-amber-500 hover:bg-amber-500'>
                           {t('lowStock')}
                        </Badge>
                     )}
                     {product.stock === 0 && (
                        <Badge className='absolute top-2 right-2 z-10 bg-secondaryColor text-white hover:bg-secondaryColor hover:text-white'>
                           {t('outOfStock')}
                        </Badge>
                     )}
                     {product.discountType === 'FLASH_SALE' && (
                        <Badge className='absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-yellow-500 hover:bg-yellow-500 text-secondaryColor flex items-center gap-1'>
                           Flash sale
                           <Zap size={16} />
                        </Badge>
                     )}
                     <Image
                        src={imageError ? '/placeholder.svg' : product.image || '/placeholder.svg'}
                        alt={product.name || t('productName')}
                        fill
                        className='object-cover group-hover:scale-105 transition-transform duration-300'
                        onError={() => setImageError(true)}
                     />
                  </div>
               </Link>

               {/* Content Section */}
               <div className='flex-1 p-4 relative'>
                  {/* Nút yêu thích */}
                  <button
                     onClick={handleWishlistToggle}
                     disabled={isWishlistLoading}
                     className='absolute top-2 right-2 z-10 p-1.5 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors'
                  >
                     <Heart
                        className={`h-5 w-5 ${isInWishlist?.data.data ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                     />
                  </button>

                  <div className='flex items-center gap-1 mb-1.5'>
                     <Badge variant='outline' className='text-xs font-normal px-1.5 py-0 h-5 bg-primary-foreground'>
                        {product.categoryName || t('category')}
                     </Badge>
                     <Badge variant='outline' className='text-xs font-normal px-1.5 py-0 h-5 bg-primary-foreground'>
                        {product.brandName || t('brand')}
                     </Badge>
                  </div>

                  <Link href={productUrl}>
                     <h3 className='font-medium text-lg line-clamp-2 min-h-[40px] group-hover:text-primaryColor transition-colors'>
                        {decodeHTML(product.name)}
                     </h3>
                  </Link>

                  <div className='mt-2 flex items-center gap-2'>
                     {product.averageRating > 0 && (
                        <div className='flex items-center text-xs px-1.5 py-0.5 rounded'>
                           <div className='flex'>
                              {[...Array(5)].map((_, i) => (
                                 <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                       i < (product.averageRating || 0)
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                    }`}
                                 />
                              ))}
                           </div>
                           <span className='font-medium ml-1'>({product.reviewCount || 0})</span>
                        </div>
                     )}
                  </div>

                  <p className='text-sm text-muted-foreground line-clamp-2 mt-2'>
                     {product.description || 'Mô tả sản phẩm chưa cập nhật'}
                  </p>

                  <div className='mt-4 flex items-center justify-between'>
                     <div className='flex items-center gap-2'>
                        {product.discountedPrice && product.price && product.discountedPrice < product.price && (
                           <div className='text-gray-500 text-sm line-through'>{formatCurrency(product.price)}</div>
                        )}
                        <div className='text-secondaryColor font-bold text-xl'>
                           {formatCurrency(product.discountedPrice || product.price || 0)}
                        </div>
                     </div>

                     <div className='flex gap-2'>
                        <Button
                           disabled={product.stock === 0}
                           onClick={handleAddToCart}
                           variant='outline'
                           size='sm'
                           className='border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-white transition-colors'
                        >
                           <ShoppingCart className='h-4 w-4 mr-2' />
                           {t('addToCart')}
                        </Button>

                        {onSelectForCompare && (
                           <Button
                              onClick={(e) => {
                                 e.preventDefault()
                                 e.stopPropagation()
                                 onSelectForCompare(product)
                              }}
                              variant={isSelectedForCompare ? 'default' : 'outline'}
                              size='sm'
                              className={`${isSelectedForCompare ? 'bg-primaryColor' : 'border-gray-300'}`}
                           >
                              <Scale className='h-4 w-4 mr-2' />
                              {isSelectedForCompare ? t('selected') : t('compare')}
                           </Button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </Card>
      )
   }

   // Grid layout (default)
   return (
      <Card className='overflow-hidden bg-secondary transition-all hover:shadow-lg group border border-border/40'>
         <Link href={productUrl}>
            <div className='h-52 overflow-hidden relative'>
               {product.discountPercentage > 0 && (
                  <Badge className='absolute top-2 left-2 z-10 bg-secondaryColor hover:bg-secondaryColor text-white'>
                     -{product.discountPercentage.toFixed(0)}%
                  </Badge>
               )}
               {product.stock <= 5 && product.stock > 0 && (
                  <Badge className='absolute top-2 right-2 z-10 bg-amber-500 hover:bg-amber-500'>{t('lowStock')}</Badge>
               )}
               {product.stock === 0 && (
                  <Badge className='absolute top-2 right-2 z-10 bg-secondaryColor text-white hover:bg-secondaryColor hover:text-white'>
                     {t('outOfStock')}
                  </Badge>
               )}
               {product.discountType === 'FLASH_SALE' && (
                  <Badge className='absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-yellow-500 hover:bg-yellow-500 text-secondaryColor flex items-center gap-1'>
                     Flash sale
                     <Zap size={16} />
                  </Badge>
               )}
               <Image
                  src={imageError ? '/placeholder.svg' : product.image || '/placeholder.svg'}
                  alt={product.name || t('productName')}
                  fill
                  className='object-contain aspect-square transition-transform group-hover:scale-105'
                  onError={() => setImageError(true)}
               />
            </div>
         </Link>
         <CardContent className='p-4 relative'>
            {/* Nút yêu thích */}
            <button
               onClick={handleWishlistToggle}
               disabled={isWishlistLoading}
               className='absolute top-2 right-2 z-10 p-1.5 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors'
            >
               <Heart
                  className={`h-5 w-5 ${isInWishlist?.data.data ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
               />
            </button>
            <div className='flex items-center gap-1 mb-1.5'>
               <Badge variant='outline' className='text-xs font-normal px-1.5 py-0 h-5 bg-primary-foreground'>
                  {product.categoryName || t('category')}
               </Badge>
               <Badge variant='outline' className='text-xs font-normal px-1.5 py-0 h-5 bg-primary-foreground'>
                  {product.brandName || t('brand')}
               </Badge>
            </div>
            <Link href={productUrl}>
               <h3 className='font-medium text-sm line-clamp-2 min-h-[40px] group-hover:text-primaryColor transition-colors'>
                  {decodeHTML(product.name)}
               </h3>
            </Link>
            <div className='mt-2 flex items-center justify-between'>
               <div className='flex items-center gap-2'>
                  {product.discountedPrice && product.price && product.discountedPrice < product.price && (
                     <div className='text-gray-500 text-xs line-through'>{formatCurrency(product.price)}</div>
                  )}
                  <div className='text-secondaryColor font-bold'>
                     {formatCurrency(product.discountedPrice || product.price || 0)}
                  </div>
               </div>
               {product.averageRating > 0 && (
                  <div className='flex items-center text-xs px-1.5 py-0.5 rounded'>
                     <Star className='h-3 w-3 fill-yellow-400 text-yellow-400 mr-0.5' />
                     <span className='font-medium'>{product.averageRating.toFixed(1)}</span>
                  </div>
               )}
            </div>
         </CardContent>
         <CardFooter className='p-4 pt-0 flex flex-col gap-2'>
            <Button
               disabled={product.stock === 0}
               onClick={handleAddToCart}
               variant='outline'
               size='sm'
               className='w-full border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-white transition-colors'
            >
               <ShoppingCart className='h-4 w-4 mr-2' />
               {t('addToCart')}
            </Button>

            {onSelectForCompare && (
               <Button
                  onClick={(e) => {
                     e.preventDefault()
                     e.stopPropagation()
                     onSelectForCompare(product)
                  }}
                  variant={isSelectedForCompare ? 'default' : 'outline'}
                  size='sm'
                  className={`w-full ${isSelectedForCompare ? 'bg-primaryColor' : 'border-gray-300'}`}
               >
                  <Scale className='h-4 w-4 mr-2' />
                  {isSelectedForCompare ? t('selected') : t('compare')}
               </Button>
            )}
         </CardFooter>
      </Card>
   )
}
