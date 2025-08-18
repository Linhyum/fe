import http from '@/lib/http'
import { BrandType, CategoryType, GetBrandQueryParamsType, GetCategoryQueryParamsType } from '@/types/admin.type'
import { GetProductQueryParamsType, ProductType, GetAllProductType } from '@/types/product.type'
import { ResponseData, ResponseDataWithPaginate } from '@/types/utils.type'
import queryString from 'query-string'

export const getProduct = (id: number) => http.get<ResponseData<ProductType>>(`/products/${id}`)

export const getAllProducts = (queryParams: GetProductQueryParamsType) =>
   http.get<GetAllProductType>('/products?' + queryString.stringify(queryParams))

export const compareProducts = (productIds: number[]) =>
   http.get<ResponseData<ProductType[]>>(`/products/compare?${productIds.map((id) => `ids=${id}`).join('&')}`)

export const getAllCategoryProducts = (queryParams: GetCategoryQueryParamsType) =>
   http.get<ResponseData<ResponseDataWithPaginate<CategoryType[]>>>(
      '/products/allCategories?' + queryString.stringify(queryParams)
   )
export const getAllBrandProducts = (queryParams: GetBrandQueryParamsType) =>
   http.get<ResponseData<ResponseDataWithPaginate<BrandType[]>>>(
      '/products/allBrands?' + queryString.stringify(queryParams)
   )

export const getAllRecommendedProducts = ({ userid, k }: { userid: number; k: number }) =>
   http.get<ResponseData<ProductType[]>>(`/recommendations/${userid}?k=${k}`)

export const getProductDiscount = () => http.get(`admin/discounts/product-discounts`)
export const getProductDiscountDetail = (id: any) => http.get(`/${id}/products`)
