'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Heart, ShoppingCart, Star, Eye, Scale } from 'lucide-react'
import type { ProductType } from '@/types/product.type'
import { decodeHTML } from '@/lib/utils'

interface ProductCardProps {
   product: ProductType
   onSelectForCompare?: (product: ProductType) => void
   isSelectedForCompare?: boolean
   layout?: 'grid' | 'list'
}

export default function Product({
   product,
   onSelectForCompare,
   isSelectedForCompare = false,
   layout = 'grid'
}: ProductCardProps) {
   const [isWishlisted, setIsWishlisted] = useState(false)
   const [imageError, setImageError] = useState(false)

   const formatPrice = (price: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
   }

   const calculateDiscount = () => {
      if (product.originalPrice && product.price < product.originalPrice) {
         return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      }
      return 0
   }

   const discount = calculateDiscount()

   if (layout === 'list') {
      return (
         <Card className='overflow-hidden hover:shadow-lg transition-all duration-300 group'>
            <div className='flex'>
               {/* Image Section */}
               <div className='relative w-48 h-48 flex-shrink-0'>
                  <Link href={`/products/${product.id}`}>
                     <Image
                        src={imageError ? '/placeholder.svg' : product.image || '/placeholder.svg'}
                        alt={decodeHTML(product.name)}
                        fill
                        className='object-cover group-hover:scale-105 transition-transform duration-300'
                        onError={() => setImageError(true)}
                     />
                  </Link>

                  {/* Badges */}
                  <div className='absolute top-2 left-2 flex flex-col gap-1'>
                     {discount > 0 && <Badge className='bg-red-500 hover:bg-red-600 text-white'>-{discount}%</Badge>}
                     {product.isNew && <Badge className='bg-green-500 hover:bg-green-600 text-white'>Mới</Badge>}
                  </div>

                  {/* Compare Checkbox */}
                  {onSelectForCompare && (
                     <div className='absolute top-2 right-2'>
                        <div className='flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg p-1'>
                           <Checkbox
                              id={`compare-${product.id}`}
                              checked={isSelectedForCompare}
                              onCheckedChange={() => onSelectForCompare(product)}
                           />
                           <Scale className='h-3 w-3' />
                        </div>
                     </div>
                  )}
               </div>

               {/* Content Section */}
               <CardContent className='flex-1 p-6'>
                  <div className='flex justify-between h-full'>
                     <div className='flex-1'>
                        {/* Brand */}
                        <p className='text-sm text-muted-foreground mb-1'>{product.brand}</p>

                        {/* Title */}
                        <Link href={`/products/${product.id}`}>
                           <h3 className='font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors'>
                              {decodeHTML(product.name)}
                           </h3>
                        </Link>

                        {/* Rating */}
                        <div className='flex items-center gap-1 mb-3'>
                           <div className='flex'>
                              {[...Array(5)].map((_, i) => (
                                 <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                       i < (product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                 />
                              ))}
                           </div>
                           <span className='text-sm text-muted-foreground'>({product.reviewCount || 0})</span>
                        </div>

                        {/* Description */}
                        <p className='text-sm text-muted-foreground line-clamp-2 mb-4'>{product.description}</p>

                        {/* Price */}
                        <div className='flex items-center gap-2 mb-4'>
                           <span className='text-2xl font-bold text-primary'>{formatPrice(product.price)}</span>
                           {product.originalPrice && product.originalPrice > product.price && (
                              <span className='text-lg text-muted-foreground line-through'>
                                 {formatPrice(product.originalPrice)}
                              </span>
                           )}
                        </div>
                     </div>

                     {/* Actions */}
                     <div className='flex flex-col gap-2 ml-4'>
                        <Button
                           variant='ghost'
                           size='sm'
                           onClick={() => setIsWishlisted(!isWishlisted)}
                           className='p-2'
                        >
                           <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>

                        <Button variant='outline' size='sm' asChild>
                           <Link href={`/products/${product.id}`}>
                              <Eye className='h-4 w-4 mr-2' />
                              Xem
                           </Link>
                        </Button>

                        <Button size='sm'>
                           <ShoppingCart className='h-4 w-4 mr-2' />
                           Mua
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </div>
         </Card>
      )
   }

   // Grid layout (default)
   return (
      <Card className='overflow-hidden hover:shadow-lg transition-all duration-300 group'>
         <div className='relative aspect-square'>
            <Link href={`/products/${product.id}`}>
               <Image
                  src={imageError ? '/placeholder.svg' : product.image || '/placeholder.svg'}
                  alt={decodeHTML(product.name)}
                  fill
                  className='object-cover group-hover:scale-105 transition-transform duration-300'
                  onError={() => setImageError(true)}
               />
            </Link>

            {/* Badges */}
            <div className='absolute top-2 left-2 flex flex-col gap-1'>
               {discount > 0 && <Badge className='bg-red-500 hover:bg-red-600 text-white'>-{discount}%</Badge>}
               {product.isNew && <Badge className='bg-green-500 hover:bg-green-600 text-white'>Mới</Badge>}
            </div>

            {/* Actions Overlay */}
            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100'>
               <div className='flex gap-2'>
                  <Button variant='secondary' size='sm' onClick={() => setIsWishlisted(!isWishlisted)}>
                     <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant='secondary' size='sm' asChild>
                     <Link href={`/products/${product.id}`}>
                        <Eye className='h-4 w-4' />
                     </Link>
                  </Button>
               </div>
            </div>

            {/* Compare Checkbox */}
            {onSelectForCompare && (
               <div className='absolute top-2 right-2'>
                  <div className='flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg p-1'>
                     <Checkbox
                        id={`compare-${product.id}`}
                        checked={isSelectedForCompare}
                        onCheckedChange={() => onSelectForCompare(product)}
                     />
                     <Scale className='h-3 w-3' />
                  </div>
               </div>
            )}
         </div>

         <CardContent className='p-4'>
            {/* Brand */}
            <p className='text-sm text-muted-foreground mb-1'>{product.brand}</p>

            {/* Title */}
            <Link href={`/products/${product.id}`}>
               <h3 className='font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors'>
                  {decodeHTML(product.name)}
               </h3>
            </Link>

            {/* Rating */}
            <div className='flex items-center gap-1 mb-3'>
               <div className='flex'>
                  {[...Array(5)].map((_, i) => (
                     <Star
                        key={i}
                        className={`h-4 w-4 ${
                           i < (product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                     />
                  ))}
               </div>
               <span className='text-sm text-muted-foreground'>({product.reviewCount || 0})</span>
            </div>

            {/* Price */}
            <div className='flex items-center gap-2 mb-4'>
               <span className='text-xl font-bold text-primary'>{formatPrice(product.price)}</span>
               {product.originalPrice && product.originalPrice > product.price && (
                  <span className='text-sm text-muted-foreground line-through'>
                     {formatPrice(product.originalPrice)}
                  </span>
               )}
            </div>

            {/* Add to Cart Button */}
            <Button className='w-full' size='sm'>
               <ShoppingCart className='h-4 w-4 mr-2' />
               Thêm vào giỏ
            </Button>
         </CardContent>
      </Card>
   )
}
