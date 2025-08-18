import http from '@/lib/http'
import { Cart } from '@/types/cart.type'
import { ResponseData } from '@/types/utils.type'
import queryString from 'query-string'

interface UpdateCartParams {
   userId: number
   cartItemId: number
   quantity: number
}

interface AddCartParams {
   userId: number
   productId: number
   quantity: number
}

interface UpdateSelectedCartParams {
   userId: number
   cartItemIds: number[]
}

export const getAllCart = (userId: number) => http.get<ResponseData<Cart>>(`/cart?userId=${userId}`)

export const updateCart = (queryParams: UpdateCartParams) =>
   http.put<ResponseData<Cart>>(`/cart/update?` + queryString.stringify(queryParams))

export const updateSelectedCart = (body: UpdateSelectedCartParams) =>
   http.put<ResponseData<Cart>>(`/cart/select-items?userId=${body.userId}`, body.cartItemIds)

export const deleteCartItem = (queryParams: Omit<UpdateCartParams, 'quantity'>) =>
   http.delete(`/cart/remove?` + queryString.stringify(queryParams))

export const clearCart = (queryParams: Pick<UpdateCartParams, 'userId'>) =>
   http.delete(`/cart/clear?` + queryString.stringify(queryParams))

export const addToCart = (queryParams: AddCartParams) =>
   http.post<ResponseData<Cart>>(`/cart/add?` + queryString.stringify(queryParams))
