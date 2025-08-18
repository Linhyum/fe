import { ResponseData, ResponseDataWithPaginate } from '@/types/utils.type'

// ShippingMethod
export interface ShippingMethodType {
   id: number
   methodName: string
   description: string
   baseCost: number
   estimatedDays: string
   isActive: boolean
   createdAt: string
   updatedAt: string
}

// PaymentMethod
export interface PaymentMethodType {
   id: number
   methodName: string
   description: string
   isActive: boolean
   createdAt: string
   updatedAt: string
}

// Brand
export interface GetBrandQueryParamsType {
   page?: number
   size?: number
   sortBy?: string | 'id'
   sortDir?: string | 'desc'
   search?: string
}
export type GetAllBrandType = ResponseData<ResponseDataWithPaginate<BrandType[]>>

export interface BrandType {
   id: number
   brandName: string
   description: string
   logo: string
   createdAt: string
   updatedAt: string
   status: boolean
   productCount: number
   imageUrl?: string
}

// Discount
export interface GetDiscountQueryParamsType {
   page?: number
   size?: number
   sortBy?: string | 'id'
   sortDir?: string | 'desc'
   search?: string
}
export interface DiscountType {
   id: number
   name: string
   type: 'PRODUCT' | 'CATEGORY'
   value: number
   startDate: string
   endDate: string
   isActive: boolean
   productIds: any
   discountedPrices: any
   categoryIds: any
   productName: any
   discountedPrice: any
   categoryName: string
   productId: any
   categoryId: number
   createdAt: string
   updatedAt: any
   discountId: number
   assignedCount: any
   bannerUrl: any
}

export interface CreateDiscountType {
   name: string
   type: 'PRODUCT' | 'CATEGORY'
   value: number // phần trăm giảm, ví dụ: 25.0 nghĩa là 25%
   startDate: string // ISO date string, ví dụ: "2024-07-01T00:00:00"
   endDate: string
   isActive: boolean
   productIds?: number[]
   discountedPrices?: Record<number, number> // key là productId, value là giá sau khi giảm
   categoryIds?: number[]
   bannerUrl?: any
}

export interface UpdateDiscountType {
   id: number
   name: string
   type: 'PRODUCT' | 'CATEGORY'
   value: number // phần trăm giảm, ví dụ: 25.0 nghĩa là 25%
   startDate: string // ISO date string, ví dụ: "2024-07-01T00:00:00"
   endDate: string
   isActive: boolean
   productIds?: number[]
   discountedPrices?: Record<number, number> // key là productId, value là giá sau khi giảm
   categoryIds?: number[]
   bannerUrl?: any
}
export interface DeleteDiscountToProductsType {
   discountId: number
   productIds: number[]
}
// Category
export interface GetCategoryQueryParamsType {
   page?: number
   size?: number
   sortBy?: string | 'id'
   sortDir?: string | 'desc'
   search?: string
}
export interface CategoryType {
   id: number
   categoryName: string
   status: boolean
   imageUrl?: string
}

// Product
export interface GetProductAdminQueryParamsType {
   page?: number
   size?: number
   sortBy?: string | 'id'
   sortDir?: string | 'desc'
   search?: string
}
export interface CreateProductType {
   categoryId: number
   discountId: number | null
   brandId: number
   name: string
   price: number
   description: string
   warranty: string
   weight: number
   dimensions: string
   status: boolean
   stock: number
   processor: string
   ram: string
   storage: string
   display: string
   graphics: string
   battery: string
   camera: string
   operatingSystem: string
   connectivity: string
   otherFeatures: string
}

// order
export interface GetOrderQueryParamsType {
   page?: number
   size?: number
   sortBy?: string | 'id'
   sortDir?: string | 'desc'
   search?: string
}
export interface OrderType {
   id: number
   userId: number
   userName: string
   totalPrice: number
   shippingFee: number
   address: string
   phoneNumber: string
   shippingMethodId: number
   shippingMethodName: string
   paymentMethodId: number
   paymentMethodName: string
   trackingNumber: any
   createAt: string
   paymentStatus: string
   orderStatus: number
   orderStatusText: string
   orderDetails: OrderDetail[]
}
export interface OrderDetail {
   id: number
   orderId: number
   productId: number
   productName: string
   productImage: string
   quantity: number
   price: number
   totalPrice: number
   reviewStatus: boolean
}

// statistics
export interface DashboardStatisticsType {
   totalUsers: number
   topSellingProducts: TopSellingProduct[]
   shippedOrders: number
   deliveredOrders: number
   topCustomers: TopCustomer[]
   pendingOrders: number
   revenueToday: number
   cancelledOrders: number
   recentOrders: RecentOrder[]
   lowStockProducts: number
   totalProducts: number
   newUsersToday: number
   totalOrders: number
   totalRevenue: number
   processingOrders: number
   newOrdersToday: number
   completedOrders: number
}
export interface TopSellingProduct {
   price: number
   name: string
   id: number
   soldQuantity: number
}

export interface TopCustomer {
   orderCount: number
   id: number
   userName: string
   email: string
}

export interface RecentOrder {
   totalPrice: number
   orderStatus: number
   id: number
   userName: string
   userId: number
   createAt: string
}

//user
export interface GetUserQueryParamsType {
   page?: number
   size?: number
   sortBy?: string | 'id'
   sortDir?: string | 'desc'
   role?: boolean
   search?: string
}

export interface UserType {
   id: number
   role: boolean
   userName: string
   email: string
   phone: string
   surName: string
   lastName: string
   active: number
   picture: string
   createAt: string
   loginTimes: number
   address: string
   dateOfBirth: string
   gender: string
}

// flash sale
export interface CreateFlashSaleType {
   name: string
   description: string
   startTime: string
   endTime: string
}

export interface UpdateFlashSaleType {
   id: number
   name: string
   description: string
   startTime: string
   endTime: string
}

export interface GetFlashSaleQueryParamsType {
   page?: number
   size?: number
   sortBy?: string | 'id'
   sortDir?: string | 'desc'
   search?: string
}

export interface FlashSaleType {
   id: number
   name: string
   description: string
   startTime: string
   endTime: string
   createdAt: string
   updatedAt: string
   items: {
      id: number
      flashSaleId: number
      productId: number
      productName: string
      productImage: string
      originalPrice: number
      flashPrice: number
      discountPercentage: number
      stockLimit: number
      soldCount: number
      availableStock: number
   }[]
   isActive: boolean
   isUpcoming: boolean
   isPast: boolean
}

export interface AddProductToFlashSaleType {
   id: number
   productId: number
   flashPrice: number
   stockLimit: number
}
export interface UpdateProductToFlashSaleType {
   id: number
   productId: number
   flashPrice: number
   stockLimit: number
}
