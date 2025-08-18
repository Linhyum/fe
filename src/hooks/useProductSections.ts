import { useGetAllProducts } from '@/queries/useProduct'

export function useProductSections() {
   // Sản phẩm đang khuyến mãi
   const discountedProducts = useGetAllProducts({
      page: 0,
      size: 8,
      filterType: 'DISCOUNTED',
      sortBy: 'id',
      sortDir: 'desc'
   })

   // Sản phẩm bán chạy
   const topSellingProducts = useGetAllProducts({
      page: 0,
      size: 8,
      filterType: 'TOP_SELLING',
      sortBy: 'id',
      sortDir: 'desc'
   })

   // Sản phẩm đánh giá cao
   const topRatedProducts = useGetAllProducts({
      page: 0,
      size: 8,
      filterType: 'TOP_RATED',
      sortBy: 'id',
      sortDir: 'desc'
   })

   // Hàng mới về
   const newArrivals = useGetAllProducts({
      page: 0,
      size: 8,
      filterType: 'NEW_ARRIVALS',
      sortBy: 'id',
      sortDir: 'desc'
   })

   // Sản phẩm giá rẻ (dưới 1 triệu)
   const budgetProducts = useGetAllProducts({
      page: 0,
      size: 8,
      filterType: 'DISCOUNTED',
      sortBy: 'price',
      sortDir: 'asc'
   })

   // Sản phẩm cao cấp (trên 5 triệu)
   const premiumProducts = useGetAllProducts({
      page: 0,
      size: 8,
      minPrice: 5000000,
      sortBy: 'price',
      sortDir: 'desc'
   })

   return {
      discountedProducts: {
         data: discountedProducts.data?.data.data.content || [],
         isLoading: discountedProducts.isLoading
      },
      topSellingProducts: {
         data: topSellingProducts.data?.data.data.content || [],
         isLoading: topSellingProducts.isLoading
      },
      topRatedProducts: {
         data: topRatedProducts.data?.data.data.content || [],
         isLoading: topRatedProducts.isLoading
      },
      newArrivals: {
         data: newArrivals.data?.data.data.content || [],
         isLoading: newArrivals.isLoading
      },
      budgetProducts: {
         data: budgetProducts.data?.data.data.content || [],
         isLoading: budgetProducts.isLoading
      },
      premiumProducts: {
         data: premiumProducts.data?.data.data.content || [],
         isLoading: premiumProducts.isLoading
      }
   }
}
