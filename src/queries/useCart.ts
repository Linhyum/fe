import { addToCart, clearCart, deleteCartItem, getAllCart, updateCart, updateSelectedCart } from '@/apiRequest/cart'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

export const useGetAllCart = (userId: number) => {
   return useQuery({
      queryKey: ['cart', userId],
      queryFn: () => getAllCart(userId),
      enabled: !!userId
   })
}

export const useUpdateCart = () => {
   const queryClient = useQueryClient()
   return useMutation({
      mutationFn: updateCart,
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['cart']
         })
      }
   })
}

export const useUpdateSelectedCart = () => {
   const queryClient = useQueryClient()
   return useMutation({
      mutationFn: updateSelectedCart,
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['cart']
         })
      },
      onError: () => {
         toast.error('Cập nhật sản phẩm đã chọn thất bại')
      }
   })
}

export const useAddToCart = () => {
   const queryClient = useQueryClient()
   return useMutation({
      mutationFn: addToCart,
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['cart']
         })
         toast.success('Đã thêm sản phẩm vào giỏ hàng')
      },
      onError: () => {
         toast.error('Thêm sản phẩm thất bại')
      }
   })
}

export const useDeleteCartItem = () => {
   const queryClient = useQueryClient()
   return useMutation({
      mutationFn: deleteCartItem,
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['cart']
         })
         toast.success('Xóa sản phẩm thành công')
      },
      onError: () => {
         toast.error('Xóa sản phẩm thất bại')
      }
   })
}

export const useClearCart = () => {
   const queryClient = useQueryClient()
   return useMutation({
      mutationFn: clearCart,
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['cart']
         })
         toast.success('Xóa giỏ hàng thành công')
      },
      onError: () => {
         toast.error('Xóa giỏ hàng thất bại')
      }
   })
}
