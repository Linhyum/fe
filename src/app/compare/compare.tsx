'use client'
import { useCompareProducts } from '@/queries/useProduct'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { decodeHTML, formatCurrency, generateNameId } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAddToCart } from '@/queries/useCart'
import { useAppContext } from '@/context/app.context'
import { toast } from 'react-toastify'
import ProductRating from '@/components/product-rating'

export default function Compare() {
   const { userId } = useAppContext()
   const searchParams = useSearchParams()
   const idsParam = searchParams?.get('ids')
   const [productIds, setProductIds] = useState<number[]>([])
   const addToCart = useAddToCart()

   useEffect(() => {
      if (idsParam) {
         const ids = idsParam.split(',').map((id) => parseInt(id))
         setProductIds(ids)
      }
   }, [idsParam])

   const { data, isLoading, error } = useCompareProducts(productIds)
   const products = data?.data.data || []

   const handleAddToCart = (productId: number) => {
      if (!userId) {
         toast.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')
         return
      }

      addToCart.mutate({
         userId,
         productId,
         quantity: 1
      })
   }

   if (isLoading) {
      return (
         <div className='container my-8'>
            <h1 className='text-2xl font-bold mb-6'>So sánh sản phẩm</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
               {Array(4)
                  .fill(0)
                  .map((_, index) => (
                     <div key={index} className='border rounded-lg p-4'>
                        <Skeleton className='h-40 w-full mb-4' />
                        <Skeleton className='h-6 w-3/4 mb-2' />
                        <Skeleton className='h-5 w-1/2 mb-4' />
                        <Skeleton className='h-20 w-full mb-4' />
                        <Skeleton className='h-10 w-full' />
                     </div>
                  ))}
            </div>
         </div>
      )
   }

   if (error) {
      return (
         <div className='container my-8'>
            <h1 className='text-2xl font-bold mb-6'>So sánh sản phẩm</h1>
            <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg'>
               Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
            </div>
            <Button asChild className='mt-4'>
               <Link href='/'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Quay lại trang chủ
               </Link>
            </Button>
         </div>
      )
   }

   if (products.length === 0) {
      return (
         <div className='container my-8'>
            <h1 className='text-2xl font-bold mb-6'>So sánh sản phẩm</h1>
            <div className='bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg'>
               Không có sản phẩm nào để so sánh. Vui lòng chọn ít nhất 2 sản phẩm.
            </div>
            <Button asChild className='mt-4'>
               <Link href='/'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Quay lại trang chủ
               </Link>
            </Button>
         </div>
      )
   }

   return (
      <div className='container my-8'>
         <div className='flex items-center flex-wrap gap-3 justify-between mb-6'>
            <h1 className='text-2xl font-bold'>So sánh sản phẩm</h1>
            <Button asChild variant='outline'>
               <Link href='/'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Quay lại trang chủ
               </Link>
            </Button>
         </div>

         <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
               <thead>
                  <tr>
                     <th className='border p-4 w-1/5'>Thông số</th>
                     {products.map((product) => (
                        <th key={product.id} className='border p-4 '>
                           <div className='flex flex-col items-center'>
                              <div className='aspect-square w-[500px]'>
                                 <Image
                                    src={product.image || '/placeholder.svg'}
                                    alt={decodeHTML(product.name)}
                                    width={500}
                                    height={500}
                                    className='mb-2 object-contain'
                                 />
                              </div>
                              <Link
                                 href={`/${generateNameId({ name: product.name, id: product.id })}`}
                                 className='text-blue-600 hover:underline text-center font-medium'
                              >
                                 {decodeHTML(product.name)}
                              </Link>
                              <Button
                                 onClick={() => handleAddToCart(product.id)}
                                 variant='outline'
                                 size='sm'
                                 className='mt-2 text-xs'
                                 disabled={product.stock <= 0}
                              >
                                 <ShoppingCart className='h-3 w-3 mr-1' />
                                 Thêm vào giỏ
                              </Button>
                           </div>
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {/* Thông tin cơ bản */}
                  <tr className=''>
                     <td colSpan={products.length + 1} className='border p-2 font-semibold text-primaryColor'>
                        Thông tin cơ bản
                     </td>
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Giá</td>
                     {products.map((product) => (
                        <td key={`${product.id}-price`} className='border p-4 text-center'>
                           {product.discountedPrice && product.discountedPrice < product.price ? (
                              <div>
                                 <span className='line-through text-gray-500'>{formatCurrency(product.price)}</span>
                                 <br />
                                 <span className='text-red-500 font-medium'>
                                    {formatCurrency(product.discountedPrice)}
                                 </span>
                              </div>
                           ) : (
                              <span className='font-medium'>{formatCurrency(product.price)}</span>
                           )}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Thương hiệu</td>
                     {products.map((product) => (
                        <td key={`${product.id}-brand`} className='border p-4 text-center'>
                           {product.brandName || 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Đánh giá</td>
                     {products.map((product) => (
                        <td key={`${product.id}-rating`} className='border p-4 text-center'>
                           {product.averageRating > 0 ? (
                              <div className='flex flex-col items-center'>
                                 <ProductRating
                                    rating={product.averageRating}
                                    classNameStar1='w-4 h-4 fill-yellow-300 text-yellow-300'
                                    classNameStar2='w-4 h-4 fill-current text-gray-300'
                                 />
                                 <span className='text-sm text-gray-500 mt-1'>({product.reviewCount} đánh giá)</span>
                              </div>
                           ) : (
                              'Chưa có đánh giá'
                           )}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Tình trạng</td>
                     {products.map((product) => (
                        <td key={`${product.id}-stock`} className='border p-4 text-center'>
                           {product.stock > 0 ? (
                              product.stock <= 5 ? (
                                 <span className='text-amber-500'>Sắp hết hàng ({product.stock})</span>
                              ) : (
                                 <span className='text-green-500'>Còn hàng ({product.stock})</span>
                              )
                           ) : (
                              <span className='text-red-500'>Hết hàng</span>
                           )}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Bảo hành</td>
                     {products.map((product) => (
                        <td key={`${product.id}-warranty`} className='border p-4 text-center'>
                           {product.warranty || 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>

                  {/* Thông số kỹ thuật */}
                  <tr className=''>
                     <td colSpan={products.length + 1} className='border p-2 font-semibold text-primaryColor'>
                        Thông số kỹ thuật
                     </td>
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>CPU</td>
                     {products.map((product) => (
                        <td key={`${product.id}-cpu`} className='border p-4 text-center'>
                           {product.productDetail?.processor || 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>RAM</td>
                     {products.map((product) => (
                        <td key={`${product.id}-ram`} className='border p-4 text-center'>
                           {product.productDetail?.ram || 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Bộ nhớ</td>
                     {products.map((product) => (
                        <td key={`${product.id}-storage`} className='border p-4 text-center'>
                           {product.productDetail?.storage || 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Màn hình</td>
                     {products.map((product) => (
                        <td key={`${product.id}-display`} className='border p-4 text-center'>
                           {product.productDetail?.display || 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Card đồ họa</td>
                     {products.map((product) => (
                        <td key={`${product.id}-graphics`} className='border p-4 text-center'>
                           {product.productDetail?.graphics || 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Pin</td>
                     {products.map((product) => (
                        <td key={`${product.id}-battery`} className='border p-4 text-center'>
                           {product.productDetail?.battery || 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Camera</td>
                     {products.map((product) => (
                        <td key={`${product.id}-camera`} className='border p-4 text-center'>
                           {product.productDetail?.camera || 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Hệ điều hành</td>
                     {products.map((product) => (
                        <td key={`${product.id}-os`} className='border p-4 text-center'>
                           {product.productDetail?.operatingSystem || 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Kết nối</td>
                     {products.map((product) => (
                        <td key={`${product.id}-connectivity`} className='border p-4 text-center'>
                           {product.productDetail?.connectivity || 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Tính năng khác</td>
                     {products.map((product) => (
                        <td key={`${product.id}-other`} className='border p-4 text-center'>
                           {product.productDetail?.otherFeatures || 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>

                  {/* Kích thước và trọng lượng */}
                  <tr className=''>
                     <td colSpan={products.length + 1} className='border p-2 font-semibold text-primaryColor'>
                        Kích thước & Trọng lượng
                     </td>
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Kích thước</td>
                     {products.map((product) => (
                        <td key={`${product.id}-dimensions`} className='border p-4 text-center'>
                           {product.dimensions || 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Trọng lượng</td>
                     {products.map((product) => (
                        <td key={`${product.id}-weight`} className='border p-4 text-center'>
                           {product.weight ? `${product.weight} g` : 'Không có thông tin'}
                        </td>
                     ))}
                  </tr>

                  {/* Thao tác */}
                  <tr className=''>
                     <td colSpan={products.length + 1} className='border p-2 font-semibold text-primaryColor'>
                        Thao tác
                     </td>
                  </tr>
                  <tr>
                     <td className='border p-4 font-medium'>Hành động</td>
                     {products.map((product) => (
                        <td key={`${product.id}-actions`} className='border p-4 text-center'>
                           <div className='flex flex-col gap-2'>
                              <Button
                                 onClick={() => handleAddToCart(product.id)}
                                 variant='default'
                                 size='sm'
                                 className='w-full'
                                 disabled={product.stock <= 0}
                              >
                                 <ShoppingCart className='h-4 w-4 mr-2' />
                                 Thêm vào giỏ
                              </Button>
                              <Button asChild variant='outline' size='sm' className='w-full'>
                                 <Link href={`/${generateNameId({ name: product.name, id: product.id })}`}>
                                    Xem chi tiết
                                 </Link>
                              </Button>
                           </div>
                        </td>
                     ))}
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
   )
}
