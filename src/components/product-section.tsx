'use client'
import { useState } from 'react'
import type React from 'react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Badge } from '@/components/ui/badge'
import ProductCard from '@/components/product-card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight, Eye, Grid3X3 } from 'lucide-react'
import type { ProductType } from '@/types/product.type'
import { useRouter } from 'next/navigation'

interface ProductSectionProps {
   title: string
   subtitle?: string
   icon?: React.ReactNode
   products: ProductType[]
   isLoading?: boolean
   viewAllLink?: string
   backgroundColor?: string
   showViewAll?: boolean
   layout?: 'carousel' | 'grid'
   maxItems?: number
   onSelectForCompare?: (product: ProductType) => void
   selectedProducts?: ProductType[]
}

export default function ProductSection({
   title,
   subtitle,
   icon,
   products,
   isLoading = false,
   viewAllLink,
   backgroundColor = 'bg-gradient-to-r from-primary/5 to-secondary/5',
   showViewAll = true,
   layout = 'carousel',
   maxItems = 8,
   onSelectForCompare,
   selectedProducts = []
}: ProductSectionProps) {
   const router = useRouter()
   const [viewMode, setViewMode] = useState<'carousel' | 'grid'>(layout)

   const displayProducts = products.slice(0, maxItems)

   const handleViewAll = () => {
      if (viewAllLink) {
         router.push(viewAllLink)
      }
   }

   const SectionHeader = () => (
      <div className={`${backgroundColor} p-6 rounded-t-xl border-b`}>
         <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
               {icon && <div className='text-2xl'>{icon}</div>}
               <div>
                  <h2 className='text-2xl font-bold text-foreground'>{title}</h2>
                  {subtitle && <p className='text-muted-foreground mt-1'>{subtitle}</p>}
               </div>
               <Badge variant='secondary' className='ml-2'>
                  {products.length} sản phẩm
               </Badge>
            </div>
            <div className='flex items-center gap-2'>
               {/* Toggle view mode */}
               <div className='flex items-center bg-background rounded-lg p-1 border'>
                  <Button
                     variant={viewMode === 'carousel' ? 'default' : 'ghost'}
                     size='sm'
                     onClick={() => setViewMode('carousel')}
                     className='h-8 px-3'
                  >
                     <Eye className='h-4 w-4' />
                  </Button>
                  <Button
                     variant={viewMode === 'grid' ? 'default' : 'ghost'}
                     size='sm'
                     onClick={() => setViewMode('grid')}
                     className='h-8 px-3'
                  >
                     <Grid3X3 className='h-4 w-4' />
                  </Button>
               </div>
               {showViewAll && (
                  <Button variant='outline' onClick={handleViewAll} className='gap-2'>
                     Xem tất cả
                     <ChevronRight className='h-4 w-4' />
                  </Button>
               )}
            </div>
         </div>
      </div>
   )

   const LoadingSkeleton = () => (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6'>
         {Array(4)
            .fill(0)
            .map((_, index) => (
               <div key={index} className='border rounded-xl p-4 shadow-sm'>
                  <Skeleton className='h-48 w-full mb-4 rounded-lg' />
                  <Skeleton className='h-4 w-1/3 mb-2' />
                  <Skeleton className='h-5 w-3/4 mb-4' />
                  <Skeleton className='h-4 w-1/2 mb-2' />
                  <Skeleton className='h-8 w-full mt-4' />
               </div>
            ))}
      </div>
   )

   const CarouselView = () => (
      <div className='p-6'>
         <Carousel
            opts={{
               align: 'start',
               loop: false
            }}
            className='w-full'
         >
            <CarouselContent className='-ml-2 md:-ml-4'>
               {displayProducts.map((product) => (
                  <CarouselItem key={product.id} className='pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4'>
                     <ProductCard
                        product={product}
                        onSelectForCompare={onSelectForCompare}
                        isSelectedForCompare={selectedProducts.some((p) => p.id === product.id)}
                     />
                  </CarouselItem>
               ))}
            </CarouselContent>
            <CarouselPrevious className='left-2' />
            <CarouselNext className='right-2' />
         </Carousel>
      </div>
   )

   const GridView = () => (
      <div className='p-6'>
         <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {displayProducts.map((product) => (
               <ProductCard
                  key={product.id}
                  product={product}
                  onSelectForCompare={onSelectForCompare}
                  isSelectedForCompare={selectedProducts.some((p) => p.id === product.id)}
               />
            ))}
         </div>
      </div>
   )

   if (isLoading) {
      return (
         <Card className='w-full shadow-lg border-0 overflow-hidden'>
            <SectionHeader />
            <LoadingSkeleton />
         </Card>
      )
   }

   if (products.length === 0) {
      return (
         <Card className='w-full shadow-lg border-0 overflow-hidden'>
            <SectionHeader />
            <div className='p-12 text-center'>
               <div className='text-6xl mb-4'>📦</div>
               <p className='text-muted-foreground text-lg'>Chưa có sản phẩm nào trong danh mục này</p>
            </div>
         </Card>
      )
   }

   return (
      <Card className='w-full shadow-lg border-0 overflow-hidden'>
         <SectionHeader />
         {viewMode === 'carousel' ? <CarouselView /> : <GridView />}
      </Card>
   )
}
