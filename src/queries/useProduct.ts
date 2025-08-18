import {
   getAllProducts,
   getProduct,
   compareProducts,
   getAllCategoryProducts,
   getAllBrandProducts,
   getAllRecommendedProducts,
   getProductDiscount,
   getProductDiscountDetail
} from '@/apiRequest/product'
import { GetBrandQueryParamsType, GetCategoryQueryParamsType } from '@/types/admin.type'
import { GetProductQueryParamsType } from '@/types/product.type'
import { useQuery } from '@tanstack/react-query'

export const useGetProduct = (id: number) => {
   return useQuery({
      queryKey: ['product', id],
      queryFn: () => getProduct(id),
      enabled: !!id
   })
}

export const useGetAllProducts = (queryParams: GetProductQueryParamsType) => {
   return useQuery({
      queryKey: ['products', queryParams],
      queryFn: () => getAllProducts(queryParams)
   })
}

export const useCompareProducts = (productIds: number[]) => {
   return useQuery({
      queryKey: ['products', 'compare', productIds],
      queryFn: () => compareProducts(productIds),
      enabled: productIds.length >= 2 && productIds.length <= 4
   })
}
export const useGetAllCategoryProducts = (queryParams: GetCategoryQueryParamsType) => {
   return useQuery({
      queryKey: ['categoryProducts', queryParams],
      queryFn: () => getAllCategoryProducts(queryParams)
   })
}

export const useGetAllBrandProducts = (queryParams: GetBrandQueryParamsType) => {
   return useQuery({
      queryKey: ['brandProducts', queryParams],
      queryFn: () => getAllBrandProducts(queryParams)
   })
}
export const useGetAllRecommendedProducts = (queryParams: { userid: number; k: number }) => {
   return useQuery({
      queryKey: ['products', queryParams],
      queryFn: () => getAllRecommendedProducts(queryParams)
   })
}

export const useGetProductDiscount = () => {
   return useQuery({
      queryKey: ['productDiscount'],
      queryFn: getProductDiscount
   })
}

export const useGetProductDiscountDetail = (id: any) => {
   return useQuery({
      queryKey: ['productDiscountDetail'],
      queryFn: () => getProductDiscountDetail(id),
      enabled: !!id
   })
}
