import { ResponseData } from './utils.type'

export interface WishlistItem {
   id: number
   userId: number
   productId: number
   productName: string
   productImage: string
   productPrice: number
   discountedPrice: number
   addedAt: string
}

export type WishlistResponse = ResponseData<WishlistItem[]>

export interface AddToWishlistParams {
   userId: number
   productId: number
}

export interface RemoveFromWishlistParams {
   userId: number
   productId: number
}

export interface CheckWishlistParams {
   userId: number
   productId: number
}
