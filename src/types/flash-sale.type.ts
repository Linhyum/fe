export interface ProductFlashSaleType {
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
