import http from '@/lib/http'
import {
   AddProductToFlashSaleType,
   BrandType,
   CategoryType,
   CreateDiscountType,
   CreateFlashSaleType,
   CreateProductType,
   DashboardStatisticsType,
   DeleteDiscountToProductsType,
   DiscountType,
   FlashSaleType,
   GetAllBrandType,
   GetBrandQueryParamsType,
   GetCategoryQueryParamsType,
   GetDiscountQueryParamsType,
   GetFlashSaleQueryParamsType,
   GetOrderQueryParamsType,
   GetProductAdminQueryParamsType,
   GetUserQueryParamsType,
   OrderType,
   PaymentMethodType,
   ShippingMethodType,
   UpdateDiscountType,
   UpdateFlashSaleType,
   UpdateProductToFlashSaleType,
   UserType
} from '@/types/admin.type'
import { GetAllProductType } from '@/types/product.type'
import { RatingDTO, RatingQueryParamsType } from '@/types/rating.type'
import { ResponseData, ResponseDataWithPaginate } from '@/types/utils.type'
import queryString from 'query-string'

// ShippingMethod
export const getAllShippingMethod = () => http.get<ResponseData<ShippingMethodType[]>>(`/admin/shipping-methods`)
export const createShippingMethod = (body: ShippingMethodType) => http.post(`/admin/shipping-methods`, body)
export const updateShippingMethod = (body: ShippingMethodType) => http.put(`/admin/shipping-methods/${body.id}`, body)

// PaymentMethod
export const getAllPaymentMethod = () => http.get<ResponseData<PaymentMethodType[]>>(`/admin/payment-methods`)
export const createPaymentMethod = (body: PaymentMethodType) => http.post(`/admin/payment-methods`, body)
export const updatePaymentMethod = (body: PaymentMethodType) => http.put(`/admin/payment-methods/${body.id}`, body)

// Brand
export const getAllBrand = (queryParams: GetBrandQueryParamsType) =>
   http.get<GetAllBrandType>(`/admin/brands?` + queryString.stringify(queryParams))

export const createBrand = (body: BrandType) =>
   http.post('/admin/brands', body, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
   })
export const updateBrand = (body: BrandType, id: number) =>
   http.put(`/admin/brands/${id}`, body, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
   })

// Discount
export const getAllDiscount = (queryParams: GetDiscountQueryParamsType) =>
   http.get<ResponseData<ResponseDataWithPaginate<DiscountType[]>>>(
      `/admin/discounts?` + queryString.stringify(queryParams)
   )
export const createDiscount = (formData: FormData) =>
   http.post('/admin/discounts', formData, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
   })
export const updateDiscount = ({ id, formData }: { id: number; formData: FormData }) =>
   http.post(`/admin/discounts/${id}`, formData, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
   })

export const assignDiscountToProducts = (body: any) =>
   http.post(`/admin/discounts/${body.discountId}/assign-products`, body)
export const assignDiscountToCategories = (body: any) =>
   http.post(`/admin/discounts/${body.discountId}/assign-categories`, { categoryIds: body.categoryIds })
export const deleteDiscountToProducts = (body: DeleteDiscountToProductsType) =>
   http.delete(`/admin/discounts/${body.discountId}/products`, {
      data: {
         productIds: body.productIds // hoặc truyền nguyên body nếu discountId nằm trong URL rồi
      }
   })
export const deleteDiscountToCategories = (body: any) =>
   http.delete(`/admin/discounts/${body.discountId}/categories`, {
      data: {
         categoryIds: body.categoryIds // hoặc truyền nguyên body nếu discountId nằm trong URL rồi
      }
   })

export const editPriceDiscountToProducts = (body: any) =>
   http.put(`/admin/discounts/${body.discountId}/products/prices`, { productPrices: body.productPrices })

// Category
export const getAllCategories = (queryParams: GetCategoryQueryParamsType) =>
   http.get<ResponseData<ResponseDataWithPaginate<CategoryType[]>>>(
      '/admin/categories?' + queryString.stringify(queryParams)
   )
export const createCategory = (body: CategoryType) =>
   http.post('/admin/categories', body, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
   })
export const updateCategory = (body: CategoryType, id: number) =>
   http.put(`/admin/categories/${id}`, body, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
   })

// Product
export const getAllAdminProduct = (queryParams: GetProductAdminQueryParamsType) =>
   http.get<GetAllProductType>(`/admin/products?` + queryString.stringify(queryParams))

export const createProduct = (body: CreateProductType) => http.post(`/admin/products`, body)
// Thêm API upload hình ảnh sản phẩm
export const uploadProductImage = (id: number, file: File, isPrimary: boolean = false) => {
   const formData = new FormData()
   formData.append('file', file)
   formData.append('isPrimary', isPrimary.toString())

   return http.post<ResponseData<string>>(`/admin/products/${id}/upload-image`, formData, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
   })
}
export const updateProduct = (body: CreateProductType & { id: number }) => http.put(`/admin/products/${body.id}`, body)
// Thêm API xóa hình ảnh sản phẩm
export const deleteProductImage = (imageId: number) => http.delete(`/admin/products/images/${imageId}`)
export const updatePrimaryImage = (imageId: number) => http.put(`/admin/products/images/${imageId}/primary`)

// Order
export const getAllAdminOrder = (queryParams: GetOrderQueryParamsType) =>
   http.get<ResponseData<ResponseDataWithPaginate<OrderType[]>>>(`/admin/orders?` + queryString.stringify(queryParams))
export const updateOrderStatus = (id: number, status: number) => http.put(`/admin/orders/${id}/status?status=${status}`)
export const updateOrderPayment = (id: number, paymentStatus: string) =>
   http.put(`/admin/orders/${id}/payment?paymentStatus=${paymentStatus}`)

//statistics
export const getDashboardStatistics = () => http.get<ResponseData<DashboardStatisticsType>>(`/admin/dashboard`)

//user
export const getAllUser = (queryParams: GetUserQueryParamsType) =>
   http.get<ResponseData<ResponseDataWithPaginate<UserType[]>>>(`/admin/users?` + queryString.stringify(queryParams))
export const updateUser = (body: Omit<UserType, 'role'>) => http.put(`/admin/users/${body.id}`, body)
export const createUser = (body: Omit<UserType, 'role' | 'active'>) => http.post(`/admin/users`, body)

//rating
export const getAllRating = (queryParams: RatingQueryParamsType & { search?: string }) =>
   http.get<ResponseData<ResponseDataWithPaginate<RatingDTO[]>>>(`/admin/ratings?` + queryString.stringify(queryParams))

//flash sale
export const getAllFlashSale = (queryParams: GetFlashSaleQueryParamsType) =>
   http.get<ResponseData<ResponseDataWithPaginate<FlashSaleType[]>>>(
      `/admin/flash-sales?` + queryString.stringify(queryParams)
   )
export const createFlashSale = (body: CreateFlashSaleType) => http.post(`/admin/flash-sales`, body)
export const updateFlashSale = (body: UpdateFlashSaleType) => http.put(`/admin/flash-sale/${body.id}`, body)
export const deleteFlashSale = (id: number) => http.delete(`admin/flash-sale/${id}`)
export const addProductToFlashSale = (body: AddProductToFlashSaleType) =>
   http.post(`admin/flash-sales/${body.id}/products`, body)
export const updateProductToFlashSale = (body: UpdateProductToFlashSaleType) =>
   http.put(`admin/flash-sales/items/${body.id}`, body)
export const deleteProductToFlashSale = (id: number) => http.delete(`admin/flash-sales/items/${id}`)

export const getRevenueByInterval = (
   startDate: string, // ví dụ 2025-01-22
   endDate: string,
   interval: 'day' | 'week' | 'month' | 'year' = 'day'
) => http.get(`/admin/revenue-by-interval?startDate=${startDate}&endDate=${endDate}&interval=${interval}`)

export const getRevenueByCategoryPie = (startDate: string, endDate: string) =>
   http.get(`/admin/revenue-by-category-pie?startDate=${startDate}&endDate=${endDate}`)
