import http from '@/lib/http'
import {
   RatingResponse,
   RatingsResponse,
   CreateRatingParams,
   ReplyRatingParams,
   RatingQueryParamsType
} from '@/types/rating.type'
import queryString from 'query-string'

// Tạo đánh giá mới
export const createRating = ({ userId, productId, rating, images }: CreateRatingParams) => {
   const formData = new FormData()
   formData.append('rating', new Blob([JSON.stringify(rating)], { type: 'application/json' }))

   if (images && images.length > 0) {
      images.forEach((image) => {
         formData.append('images', image)
      })
   }

   return http.post<RatingResponse>(`/ratings?userId=${userId}&productId=${productId}`, formData, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
   })
}

// Lấy danh sách đánh giá theo sản phẩm
export const getRatingsByProductId = (productId: number, queryParams: RatingQueryParamsType) =>
   http.get<RatingsResponse>(`/ratings/product/${productId}?` + queryString.stringify(queryParams))

// Trả lời đánh giá
export const replyToRating = ({ userId, parentRatingId, reply, images, productId }: ReplyRatingParams) => {
   const formData = new FormData()
   formData.append('reply', new Blob([JSON.stringify({ comment: reply.comment })], { type: 'application/json' }))

   if (images && images.length > 0) {
      images.forEach((image) => {
         formData.append('images', image)
      })
   }

   return http.post<RatingResponse>(`/ratings/reply?userId=${userId}&parentRatingId=${parentRatingId}`, formData, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
   })
}
