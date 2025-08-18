'use client'
import { useState } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import Image from 'next/image'

import type { ProductType } from '@/types/product.type'
import { Button } from '@/components/ui/button'
import { Scale, Percent, TrendingUp, Star, Zap, DollarSign, Crown, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useTranslations } from 'next-intl'
import FlashSale from '@/components/flash-sale'
import { useProductSections } from '@/hooks/useProductSections'
import ProductSection from '@/components/product-section'
import { decodeHTML } from '@/lib/utils'
import { useGetAllRecommendedProducts, useGetProductDiscount, useGetProductDiscountDetail } from '@/queries/useProduct'
import { useAppContext } from '@/context/app.context'
import Link from 'next/link'

export default function Home() {
   const router = useRouter()
   const { userId } = useAppContext()
   const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([])
   const { data, isLoading } = useGetAllRecommendedProducts({ userid: userId || 12394, k: 8 })
   const recommendedProducts = data?.data.data || []
   const t = useTranslations()
   // Lấy dữ liệu từ các section
   const { discountedProducts, topSellingProducts, topRatedProducts, newArrivals, budgetProducts, premiumProducts } =
      useProductSections()

   // Xử lý chọn sản phẩm để so sánh
   const handleSelectProductForCompare = (product: ProductType) => {
      if (selectedProducts.some((p) => p.id === product.id)) {
         setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id))
         return
      }

      if (selectedProducts.length >= 4) {
         toast.warning('Chỉ có thể so sánh tối đa 4 sản phẩm')
         return
      }

      if (selectedProducts.length > 0 && selectedProducts[0].categoryId !== product.categoryId) {
         toast.warning('Chỉ có thể so sánh các sản phẩm cùng danh mục')
         return
      }

      setSelectedProducts((prev) => [...prev, product])
   }

   // Xử lý so sánh sản phẩm
   const handleCompareProducts = () => {
      if (selectedProducts.length < 2) {
         toast.warning('Cần chọn ít nhất 2 sản phẩm để so sánh')
         return
      }

      const productIds = selectedProducts.map((p) => p.id).join(',')
      router.push(`/compare?ids=${productIds}`)
   }

   return (
      <div className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
         <div className='container py-6 space-y-8'>
            {/* Banner Carousel */}
            <div className='rounded-2xl overflow-hidden shadow-2xl'>
               <Carousel
                  plugins={[
                     Autoplay({
                        delay: 4000
                     })
                  ]}
                  className='w-full'
                  opts={{
                     loop: true
                  }}
               >
                  <CarouselContent>
                     <CarouselItem className='basis-full md:basis-1/2 aspect-[3/1]'>
                        <div className='relative w-full h-full'>
                           <Image
                              src={
                                 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:quality(100)/H2_612x212_e05bf4a220.png'
                              }
                              alt='Banner khuyến mãi'
                              fill
                              className='object-cover'
                              priority
                           />
                           <div className='absolute inset-0 bg-gradient-to-r from-black/20 to-transparent' />
                        </div>
                     </CarouselItem>
                     <CarouselItem className='basis-full md:basis-1/2 aspect-[3/1]'>
                        <div className='relative w-full h-full'>
                           <Image
                              src={
                                 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:quality(100)/H2_614x212_c6fb24bf6b.png'
                              }
                              alt='Banner sản phẩm mới'
                              fill
                              className='object-cover'
                              priority
                           />
                           <div className='absolute inset-0 bg-gradient-to-r from-black/20 to-transparent' />
                        </div>
                     </CarouselItem>
                     <CarouselItem className='basis-full md:basis-1/2 aspect-[3/1]'>
                        <div className='relative w-full h-full'>
                           <Image
                              src={
                                 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H2_614x212_e97abfb675.png'
                              }
                              alt='Banner sản phẩm mới'
                              fill
                              className='object-cover'
                              priority
                           />
                           <div className='absolute inset-0 bg-gradient-to-r from-black/20 to-transparent' />
                        </div>
                     </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className='left-4' />
                  <CarouselNext className='right-4' />
               </Carousel>
            </div>

            {/* Flash Sale */}
            <FlashSale />

            {/* Sản phẩm đang khuyến mãi */}
            {/* <ProductSection
               title='🔥 Đang khuyến mãi'
               subtitle='Giảm giá sốc - Số lượng có hạn'
               icon={<Percent className='h-6 w-6 text-red-500' />}
               products={discountedProducts.data}
               isLoading={discountedProducts.isLoading}
               backgroundColor='bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20'
               viewAllLink='/products?filterType=DISCOUNTED'
               onSelectForCompare={handleSelectProductForCompare}
               selectedProducts={selectedProducts}
            /> */}
            {/* Sản phẩm gợi ý */}
            <ProductSection
               title='🎁 Sản phẩm gợi ý'
               subtitle='Sản phẩm gợi ý theo sở thích người dùng'
               icon={<TrendingUp className='h-6 w-6 text-blue-500' />}
               products={recommendedProducts}
               isLoading={isLoading}
               backgroundColor='bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/20 dark:to-emerald-950/20'
               viewAllLink='/products'
               onSelectForCompare={handleSelectProductForCompare}
               selectedProducts={selectedProducts}
            />
            {/* Sản phẩm bán chạy */}
            <ProductSection
               title='🏆 Sản phẩm bán chạy'
               subtitle='Được khách hàng tin tưởng và lựa chọn nhiều nhất'
               icon={<TrendingUp className='h-6 w-6 text-green-500' />}
               products={topSellingProducts.data}
               isLoading={topSellingProducts.isLoading}
               backgroundColor='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
               viewAllLink='/products?filterType=TOP_SELLING'
               onSelectForCompare={handleSelectProductForCompare}
               selectedProducts={selectedProducts}
            />

            {/* Sản phẩm đánh giá cao */}
            <ProductSection
               title='⭐ Đánh giá cao'
               subtitle='Sản phẩm được đánh giá cao bởi khách hàng'
               icon={<Star className='h-6 w-6 text-yellow-500' />}
               products={topRatedProducts.data}
               isLoading={topRatedProducts.isLoading}
               backgroundColor='bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20'
               viewAllLink='/products?filterType=TOP_RATED'
               onSelectForCompare={handleSelectProductForCompare}
               selectedProducts={selectedProducts}
            />

            {/* Hàng mới về */}
            <ProductSection
               title='✨ Hàng mới về'
               subtitle='Những sản phẩm mới nhất vừa cập nhật'
               icon={<Zap className='h-6 w-6 text-blue-500' />}
               products={newArrivals.data}
               isLoading={newArrivals.isLoading}
               backgroundColor='bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20'
               viewAllLink='/products?filterType=NEW_ARRIVALS'
               onSelectForCompare={handleSelectProductForCompare}
               selectedProducts={selectedProducts}
            />

            {/* Sản phẩm giá rẻ */}
            <ProductSection
               title='💰 Giá rẻ bất ngờ'
               subtitle='Những sản phẩm đang được giảm giá'
               icon={<DollarSign className='h-6 w-6 text-purple-500' />}
               products={discountedProducts.data}
               isLoading={discountedProducts.isLoading}
               backgroundColor='bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20'
               viewAllLink='/products?filterType=DISCOUNTED'
               onSelectForCompare={handleSelectProductForCompare}
               selectedProducts={selectedProducts}
            />

            {/* Sản phẩm cao cấp */}
            <ProductSection
               title='👑 Sản phẩm cao cấp'
               subtitle='Dành cho những ai yêu thích sự hoàn hảo'
               icon={<Crown className='h-6 w-6 text-indigo-500' />}
               products={premiumProducts.data}
               isLoading={premiumProducts.isLoading}
               backgroundColor='bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20'
               viewAllLink='/products?minPrice=5000000'
               onSelectForCompare={handleSelectProductForCompare}
               selectedProducts={selectedProducts}
            />

            {/* Call to Action Section */}
            <div className='bg-gradient-to-r from-primaryColor to-secondaryColor p-8 rounded-2xl text-white text-center shadow-2xl'>
               <div className='max-w-2xl mx-auto'>
                  <Sparkles className='h-12 w-12 mx-auto mb-4' />
                  <h2 className='text-3xl font-bold mb-4'>Khám phá thêm nhiều sản phẩm tuyệt vời</h2>
                  <p className='text-lg mb-6 opacity-90'>
                     Hàng ngàn sản phẩm chính hãng với giá tốt nhất thị trường đang chờ bạn
                  </p>
                  <Link href={'/products'}>
                     <Button
                        size='lg'
                        variant='secondary'
                        className='bg-white text-primaryColor hover:bg-gray-100 font-semibold px-8 py-3'
                     >
                        Xem tất cả sản phẩm
                     </Button>
                  </Link>
               </div>
            </div>
         </div>

         {/* Thanh so sánh sản phẩm */}
         {selectedProducts.length > 0 && (
            <div className='fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm shadow-2xl border-t p-4 z-50'>
               <div className='container mx-auto flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                     <Scale className='h-5 w-5 text-primary' />
                     <span className='font-medium'>So sánh sản phẩm ({selectedProducts.length}/4)</span>
                     <div className='flex items-center gap-3'>
                        {selectedProducts.map((product) => (
                           <div
                              key={product.id}
                              className='relative aspect-square w-16 border rounded-lg overflow-hidden'
                           >
                              <Image
                                 src={product.image || '/placeholder.svg'}
                                 alt={decodeHTML(product.name)}
                                 fill
                                 className='object-cover'
                              />
                              <button
                                 onClick={() => setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id))}
                                 className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors'
                              >
                                 ×
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className='flex items-center gap-3'>
                     <Button variant='outline' size='sm' onClick={() => setSelectedProducts([])}>
                        Xóa tất cả
                     </Button>
                     <Button
                        size='sm'
                        onClick={handleCompareProducts}
                        disabled={selectedProducts.length < 2}
                        className='bg-primary hover:bg-primary/90'
                     >
                        So sánh ngay
                     </Button>
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}
