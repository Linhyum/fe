import { createRating, getRatingsByProductId, replyToRating } from '@/apiRequest/rating'
import { RatingQueryParamsType } from '@/types/rating.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

// Hook lấy danh sách đánh giá theo sản phẩm
export const useGetRatingsByProductId = (productId: number, queryParams: RatingQueryParamsType) => {
   return useQuery({
      queryKey: ['ratings', 'product', productId, queryParams],
      queryFn: () => getRatingsByProductId(productId, queryParams),
      enabled: !!productId
   })
}

// Hook tạo đánh giá mới
export const useCreateRating = () => {
   const queryClient = useQueryClient()
   return useMutation({
      mutationFn: createRating,
      onSuccess: (_, variables) => {
         queryClient.invalidateQueries({ queryKey: ['ratings', 'product', variables.productId] })
         queryClient.invalidateQueries({ queryKey: ['product', variables.productId] })
         toast.success('Đánh giá của bạn đã được gửi thành công')
      }
      // onError: (error: any) => {
      //    toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá')
      // }
   })
}

// Hook trả lời đánh giá
export const useReplyToRating = () => {
   const queryClient = useQueryClient()
   return useMutation({
      mutationFn: replyToRating,
      onSuccess: (_, variables) => {
         queryClient.invalidateQueries({ queryKey: ['ratings', 'product', variables.productId] })
         queryClient.invalidateQueries({ queryKey: ['ratings', 'replies', variables.parentRatingId] })
         toast.success('Phản hồi của bạn đã được gửi thành công')
      },
      onError: (error: any) => {
         toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi phản hồi')
      }
   })
}
