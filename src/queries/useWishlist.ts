import {
   addToWishlist,
   checkProductInWishlist,
   countWishlistItems,
   getWishlist,
   removeFromWishlist
} from '@/apiRequest/wishlist'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

// Hook lấy danh sách sản phẩm yêu thích
export const useGetWishlist = (userId: number) => {
   return useQuery({
      queryKey: ['wishlist', userId],
      queryFn: () => getWishlist(userId),
      enabled: !!userId
   })
}

// Hook thêm sản phẩm vào danh sách yêu thích
export const useAddToWishlist = () => {
   const queryClient = useQueryClient()
   return useMutation({
      mutationFn: addToWishlist,
      onSuccess: (data, variables) => {
         queryClient.invalidateQueries({ queryKey: ['wishlist', variables.userId] })
         queryClient.invalidateQueries({ queryKey: ['wishlistCount', variables.userId] })
         queryClient.invalidateQueries({ queryKey: ['isInWishlist', variables.userId, variables.productId] })
         toast.success('Đã thêm sản phẩm vào danh sách yêu thích')
      },
      onError: (error: any) => {
         toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm vào danh sách yêu thích')
      }
   })
}

// Hook xóa sản phẩm khỏi danh sách yêu thích
export const useRemoveFromWishlist = () => {
   const queryClient = useQueryClient()
   return useMutation({
      mutationFn: removeFromWishlist,
      onSuccess: (data, variables) => {
         queryClient.invalidateQueries({ queryKey: ['wishlist', variables.userId] })
         queryClient.invalidateQueries({ queryKey: ['wishlistCount', variables.userId] })
         queryClient.invalidateQueries({ queryKey: ['isInWishlist', variables.userId, variables.productId] })
         toast.success('Đã xóa sản phẩm khỏi danh sách yêu thích')
      },
      onError: (error: any) => {
         toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa khỏi danh sách yêu thích')
      }
   })
}

// Hook kiểm tra sản phẩm có trong danh sách yêu thích không
export const useCheckProductInWishlist = (userId: number, productId: number) => {
   return useQuery({
      queryKey: ['isInWishlist', userId, productId],
      queryFn: () => checkProductInWishlist({ userId, productId }),
      enabled: !!userId && !!productId
   })
}

// Hook đếm số lượng sản phẩm yêu thích
export const useCountWishlistItems = (userId: number) => {
   return useQuery({
      queryKey: ['wishlistCount', userId],
      queryFn: () => countWishlistItems(userId),
      enabled: !!userId
   })
}
