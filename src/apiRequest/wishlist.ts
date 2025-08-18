import http from '@/lib/http'
import {
   AddToWishlistParams,
   CheckWishlistParams,
   RemoveFromWishlistParams,
   WishlistResponse
} from '@/types/wishlist.type'
import { ResponseData } from '@/types/utils.type'
import queryString from 'query-string'

// Lấy danh sách sản phẩm yêu thích của người dùng
export const getWishlist = (userId: number) => http.get<WishlistResponse>(`/wishlist?userId=${userId}`)

// Thêm sản phẩm vào danh sách yêu thích
export const addToWishlist = (params: AddToWishlistParams) =>
   http.post<ResponseData<any>>(`/wishlist/add?` + queryString.stringify(params))

// Xóa sản phẩm khỏi danh sách yêu thích
export const removeFromWishlist = (params: RemoveFromWishlistParams) =>
   http.delete<ResponseData<any>>(`/wishlist/remove?` + queryString.stringify(params))

// Kiểm tra sản phẩm có trong danh sách yêu thích không
export const checkProductInWishlist = (params: CheckWishlistParams) =>
   http.get<ResponseData<boolean>>(`/wishlist/check?` + queryString.stringify(params))

// Đếm số lượng sản phẩm yêu thích của người dùng
export const countWishlistItems = (userId: number) => http.get<ResponseData<number>>(`/wishlist/count?userId=${userId}`)
