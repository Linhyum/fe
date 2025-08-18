import { ResponseData, ResponseDataWithPaginate } from './utils.type'

export interface RatingDTO {
   id: number
   productId: number
   productName: string
   userId: number
   userName: string
   userPicture: string
   imageUrls: any[]
   rating: number
   comment: string
   createAt: string
   parentId: any
   replies: Reply[]
}
export interface Reply {
   id: number
   productId: number
   productName: string
   userId: number
   userName: string
   userPicture: string
   imageUrls: any[]
   rating: any
   comment: string
   createAt: string
   parentId: number
   replies: any
}
export interface ReplyDTO {
   comment: string
}

export interface CreateRatingParams {
   userId: number
   productId: number
   rating: {
      rating: number
      comment: string
   }
   images?: File[]
}

export interface ReplyRatingParams {
   userId: number
   parentRatingId: number
   productId: number // Thêm productId để có thể invalidate query
   reply: ReplyDTO
   images?: File[]
}

export interface RatingQueryParamsType {
   page?: number
   size?: number
   sortBy?: string | 'id'
   sortDir?: string | 'desc'
}

export type RatingResponse = ResponseData<RatingDTO>
export type RatingsResponse = ResponseData<ResponseDataWithPaginate<RatingDTO[]>>
