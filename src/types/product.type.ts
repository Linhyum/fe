import { ResponseData, ResponseDataWithPaginate } from '@/types/utils.type'

export type GetAllProductType = ResponseData<ResponseDataWithPaginate<ProductType[]>>

export interface ProductType {
   id: number
   categoryId: number
   categoryName: string
   brandId: number
   brandName: string
   name: string
   image: string
   price: number
   discountedPrice: number
   discountStartDate: string
   discountEndDate: string
   isDiscountActive: boolean
   discountType: string
   discountPercentage: number
   discountId: number
   description: string
   warranty: string
   weight: number
   dimensions: string
   createAt: string
   createBy: string
   status: boolean
   updateAt: string
   updateBy: any
   stock: any
   soldQuantity: number
   averageRating: number
   reviewCount: number
   productImages: ProductImage[]
   productDetail: ProductDetail | null
   originalPrice: any
   isNew: any
   brand: any
   rating: any
}
export interface ProductImage {
   id: number
   imageUrl: string
   isPrimary: boolean
   displayOrder: number
}

export interface ProductDetail {
   id: number
   productId: number
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
//////GetProductQueryParamsType
export interface GetProductQueryParamsType {
   page?: number
   size?: number
   sortBy?: string | 'id'
   sortDir?: string | 'desc'
   keyword?: string
   brand?: string
   minPrice?: number
   maxPrice?: number
   categoryId?: number
   isDiscount?: boolean
   inStock?: boolean
   filterType?: 'ALL' | 'TOP_SELLING' | 'NEW_ARRIVALS' | 'TOP_RATED' | 'RELATED' | 'DISCOUNTED'
}
