'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useGetAllProducts, useGetAllBrandProducts, useGetAllCategoryProducts } from '@/queries/useProduct'
import type { GetProductQueryParamsType, ProductType } from '@/types/product.type'
import ProductFilter from '@/components/product-filter'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import Paginate from '@/components/paginate'

import { ShoppingBag, Star, TrendingUp, Zap, Scale, Grid3X3, List, SlidersHorizontal, X } from 'lucide-react'
import { toast } from 'react-toastify'
import Image from 'next/image'
import Product from '@/components/product'
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import ProductCard from '@/components/product-card'
import { decodeHTML } from '@/lib/utils'

function ProductsPageContent() {
   const searchParams = useSearchParams()
   const router = useRouter()

   // Lấy danh sách thương hiệu và danh mục
   const getAllBrand = useGetAllBrandProducts({ page: 0, size: 1000 })
   const brands = getAllBrand.data?.data.data.content || []

   const getAllCategories = useGetAllCategoryProducts({ page: 0, size: 1000 })
   const categories = getAllCategories.data?.data.data.content || []

   // State management
   const [currentPage, setCurrentPage] = useState<number>(1)
   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
   const [showMobileFilter, setShowMobileFilter] = useState(false)
   const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([])

   // Parse query parameters
   const getInitialFilters = (): GetProductQueryParamsType => {
      const filters: GetProductQueryParamsType = {
         page: 0,
         size: 12,
         sortBy: 'id',
         sortDir: 'desc'
      }

      // Parse URL parameters
      const filterType = searchParams?.get('filterType')
      const categoryId = searchParams?.get('categoryId')
      const brand = searchParams?.get('brand')
      const minPrice = searchParams?.get('minPrice')
      const maxPrice = searchParams?.get('maxPrice')
      const sortBy = searchParams?.get('sortBy')
      const sortDir = searchParams?.get('sortDir')
      const keyword = searchParams?.get('keyword')
      const inStock = searchParams?.get('inStock')

      if (filterType) filters.filterType = filterType as any
      if (categoryId) filters.categoryId = Number.parseInt(categoryId)
      if (brand) filters.brand = brand
      if (minPrice) filters.minPrice = Number.parseInt(minPrice)
      if (maxPrice) filters.maxPrice = Number.parseInt(maxPrice)
      if (sortBy) filters.sortBy = sortBy
      if (sortDir) filters.sortDir = sortDir as 'asc' | 'desc'
      if (keyword) filters.keyword = keyword
      if (inStock) filters.inStock = inStock === 'true'

      return filters
   }

   const [queryParams, setQueryParams] = useState<GetProductQueryParamsType>(getInitialFilters())

   // Fetch products
   const { data, isLoading } = useGetAllProducts({
      ...queryParams,
      page: currentPage - 1
   })
   const products = data?.data.data.content || []
   const totalPages = data?.data.data.totalPages || 0
   const totalElements = data?.data.data.totalElements || 0

   // Update query params when URL changes
   useEffect(() => {
      const newFilters = getInitialFilters()
      setQueryParams(newFilters)
   }, [searchParams])

   // Update page in queryParams when currentPage changes
   useEffect(() => {
      setQueryParams((prev) => ({
         ...prev,
         page: currentPage - 1
      }))
   }, [currentPage])

   const handlePageClick = (e: { selected: number }) => {
      setCurrentPage(e.selected + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
   }

   const handleFilterChange = (newFilters: GetProductQueryParamsType) => {
      setQueryParams({
         ...newFilters,
         page: 0
      })

      // Update URL
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([key, value]) => {
         if (value !== undefined && value !== null && value !== '') {
            params.set(key, value.toString())
         }
      })
      router.push(`/products?${params.toString()}`, { scroll: false })
   }

   const handleSortChange = (value: string) => {
      const [sortBy, sortDir] = value.split('-')
      handleFilterChange({
         ...queryParams,
         sortBy,
         sortDir: sortDir as 'asc' | 'desc'
      })
   }

   // Product comparison
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

   const handleCompareProducts = () => {
      if (selectedProducts.length < 2) {
         toast.warning('Cần chọn ít nhất 2 sản phẩm để so sánh')
         return
      }

      const productIds = selectedProducts.map((p) => p.id).join(',')
      router.push(`/compare?ids=${productIds}`)
   }

   // Get page title based on filters
   const getPageTitle = () => {
      if (queryParams.filterType === 'TOP_SELLING') return 'Sản phẩm bán chạy'
      if (queryParams.filterType === 'NEW_ARRIVALS') return 'Hàng mới về'
      if (queryParams.filterType === 'TOP_RATED') return 'Sản phẩm đánh giá cao'
      if (queryParams.filterType === 'DISCOUNTED') return 'Sản phẩm khuyến mãi'
      if (queryParams.categoryId) {
         const category = categories.find((c) => c.id === queryParams.categoryId)
         return category ? `Danh mục: ${category.categoryName}` : 'Sản phẩm theo danh mục'
      }
      if (queryParams.brand) return `Thương hiệu: ${queryParams.brand}`
      if (queryParams.keyword) return `Tìm kiếm: "${queryParams.keyword}"`
      return 'Tất cả sản phẩm'
   }

   const getPageIcon = () => {
      if (queryParams.filterType === 'TOP_SELLING') return <ShoppingBag className='h-6 w-6' />
      if (queryParams.filterType === 'NEW_ARRIVALS') return <Zap className='h-6 w-6' />
      if (queryParams.filterType === 'TOP_RATED') return <Star className='h-6 w-6' />
      if (queryParams.filterType === 'DISCOUNTED') return <TrendingUp className='h-6 w-6' />
      return <Grid3X3 className='h-6 w-6' />
   }

   // Clear specific filter
   const clearFilter = (filterKey: keyof GetProductQueryParamsType) => {
      const newFilters = { ...queryParams }
      delete newFilters[filterKey]
      handleFilterChange(newFilters)
   }

   // Get active filters for display
   const getActiveFilters = () => {
      const filters = []
      if (queryParams.filterType && queryParams.filterType !== 'ALL') {
         filters.push({
            key: 'filterType',
            label:
               queryParams.filterType === 'TOP_SELLING'
                  ? 'Bán chạy'
                  : queryParams.filterType === 'NEW_ARRIVALS'
                  ? 'Hàng mới'
                  : queryParams.filterType === 'TOP_RATED'
                  ? 'Đánh giá cao'
                  : queryParams.filterType === 'DISCOUNTED'
                  ? 'Khuyến mãi'
                  : queryParams.filterType,
            value: queryParams.filterType
         })
      }
      if (queryParams.categoryId) {
         const category = categories.find((c) => c.id === queryParams.categoryId)
         filters.push({
            key: 'categoryId',
            label: category?.categoryName || 'Danh mục',
            value: queryParams.categoryId
         })
      }
      if (queryParams.brand) {
         filters.push({
            key: 'brand',
            label: queryParams.brand,
            value: queryParams.brand
         })
      }
      if (queryParams.minPrice || queryParams.maxPrice) {
         const minPrice = queryParams.minPrice
         const maxPrice = queryParams.maxPrice
         filters.push({
            key: 'price',
            label: `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
               minPrice ?? 0
            )} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(maxPrice ?? 0)}`,
            value: 'price'
         })
      }
      return filters
   }

   return (
      <div className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
         <div className='container py-6'>
            {/* Breadcrumb */}
            <Breadcrumb className='mb-6'>
               <BreadcrumbList>
                  <BreadcrumbItem>
                     <BreadcrumbLink href='/'>Trang chủ</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                     <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
                  </BreadcrumbItem>
               </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <div className='mb-8'>
               <Card className='p-6 bg-gradient-to-r from-primary/5 to-secondary/5'>
                  <div className='flex items-center justify-between'>
                     <div className='flex items-center gap-3'>
                        {getPageIcon()}
                        <div>
                           <h1 className='text-3xl font-bold'>{getPageTitle()}</h1>
                           <p className='text-muted-foreground mt-1'>Tìm thấy {totalElements} sản phẩm</p>
                        </div>
                     </div>

                     {/* Mobile Filter Toggle */}
                     <Button
                        variant='outline'
                        size='sm'
                        className='lg:hidden'
                        onClick={() => setShowMobileFilter(!showMobileFilter)}
                     >
                        <SlidersHorizontal className='h-4 w-4 mr-2' />
                        Bộ lọc
                     </Button>
                  </div>
               </Card>
            </div>

            {/* Active Filters */}
            {getActiveFilters().length > 0 && (
               <div className='mb-6'>
                  <div className='flex items-center gap-2 flex-wrap'>
                     <span className='text-sm font-medium'>Bộ lọc đang áp dụng:</span>
                     {getActiveFilters().map((filter) => (
                        <Badge key={filter.key} variant='secondary' className='gap-1 pr-1'>
                           {filter.label}
                           <Button
                              variant='ghost'
                              size='sm'
                              className='h-4 w-4 p-0 hover:bg-transparent'
                              onClick={() => clearFilter(filter.key as keyof GetProductQueryParamsType)}
                           >
                              <X className='h-3 w-3' />
                           </Button>
                        </Badge>
                     ))}
                     <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleFilterChange({ page: 0, size: 12, sortBy: 'id', sortDir: 'desc' })}
                        className='text-primary'
                     >
                        Xóa tất cả
                     </Button>
                  </div>
               </div>
            )}

            <div className='flex flex-col lg:flex-row gap-8'>
               {/* Filter Sidebar */}
               <div
                  className={`w-full lg:w-1/4 lg:sticky lg:top-4 lg:self-start ${
                     showMobileFilter ? 'block' : 'hidden lg:block'
                  }`}
               >
                  <ProductFilter
                     initialFilters={queryParams}
                     onFilterChange={handleFilterChange}
                     brands={brands.filter((item) => item.status)}
                     categories={categories.filter((item) => item.status)}
                     maxPriceValue={50000000}
                  />
               </div>

               {/* Products Section */}
               <div className='w-full lg:w-3/4'>
                  {/* Toolbar */}
                  <div className='flex items-center justify-between mb-6 p-4 bg-background rounded-lg border'>
                     <div className='flex items-center gap-4'>
                        <span className='text-sm text-muted-foreground'>
                           Hiển thị {products.length} / {totalElements} sản phẩm
                        </span>
                     </div>

                     <div className='flex items-center gap-4'>
                        {/* Sort */}
                        <Select
                           value={`${queryParams.sortBy || 'id'}-${queryParams.sortDir || 'desc'}`}
                           onValueChange={handleSortChange}
                        >
                           <SelectTrigger className='w-48'>
                              <SelectValue placeholder='Sắp xếp theo' />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value='id-desc'>Mới nhất</SelectItem>
                              <SelectItem value='price-asc'>Giá thấp đến cao</SelectItem>
                              <SelectItem value='price-desc'>Giá cao đến thấp</SelectItem>
                              <SelectItem value='name-asc'>Tên A-Z</SelectItem>
                              <SelectItem value='name-desc'>Tên Z-A</SelectItem>
                           </SelectContent>
                        </Select>

                        {/* View Mode */}
                        <div className='flex items-center bg-muted rounded-lg p-1'>
                           <Button
                              variant={viewMode === 'grid' ? 'default' : 'ghost'}
                              size='sm'
                              onClick={() => setViewMode('grid')}
                              className='h-8 px-3'
                           >
                              <Grid3X3 className='h-4 w-4' />
                           </Button>
                           <Button
                              variant={viewMode === 'list' ? 'default' : 'ghost'}
                              size='sm'
                              onClick={() => setViewMode('list')}
                              className='h-8 px-3'
                           >
                              <List className='h-4 w-4' />
                           </Button>
                        </div>
                     </div>
                  </div>

                  <Separator className='mb-6' />

                  {/* Products Grid/List */}
                  {isLoading ? (
                     <div
                        className={`grid gap-6 ${
                           viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                        }`}
                     >
                        {Array(12)
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
                  ) : products.length > 0 ? (
                     <div
                        className={`grid gap-6 ${
                           viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                        }`}
                     >
                        {products.map((product) => (
                           <ProductCard
                              key={product.id}
                              product={product}
                              onSelectForCompare={handleSelectProductForCompare}
                              isSelectedForCompare={selectedProducts.some((p) => p.id === product.id)}
                              layout={viewMode}
                           />
                        ))}
                     </div>
                  ) : (
                     <div className='text-center py-16 bg-muted/30 rounded-xl'>
                        <Image
                           src='/placeholder.svg'
                           alt='No products found'
                           width={120}
                           height={120}
                           className='mx-auto mb-4 opacity-50'
                        />
                        <h3 className='text-xl font-semibold mb-2'>Không tìm thấy sản phẩm</h3>
                        <p className='text-muted-foreground mb-4'>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        <Button
                           variant='outline'
                           onClick={() => handleFilterChange({ page: 0, size: 12, sortBy: 'id', sortDir: 'desc' })}
                        >
                           Xóa bộ lọc
                        </Button>
                     </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                     <div className='mt-8'>
                        <Paginate
                           totalPages={totalPages}
                           currentPage={currentPage}
                           handlePageClick={handlePageClick}
                           setCurrentPage={setCurrentPage}
                        />
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Compare Bar */}
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

export default function ProductsPage() {
   return (
      <Suspense
         fallback={
            <div className='container py-6'>
               <div className='animate-pulse space-y-6'>
                  <div className='h-8 bg-muted rounded w-1/3'></div>
                  <div className='h-32 bg-muted rounded'></div>
                  <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
                     <div className='h-96 bg-muted rounded'></div>
                     <div className='lg:col-span-3 space-y-4'>
                        <div className='h-12 bg-muted rounded'></div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                           {Array(9)
                              .fill(0)
                              .map((_, i) => (
                                 <div key={i} className='h-80 bg-muted rounded'></div>
                              ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         }
      >
         <ProductsPageContent />
      </Suspense>
   )
}
