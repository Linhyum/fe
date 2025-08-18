'use client'
import ProductRating from '@/components/product-rating'
import QuantityController from '@/components/quantity-controller'
import { decodeHTML, formatCurrency, formatNumberToK, getIdFromNameId } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Heart, ImagePlus, SendHorizontal, ShoppingBasket, Star, X, Zap } from 'lucide-react'
import Image from 'next/image'
import type React from 'react'
import { useState, useRef, useEffect, useMemo } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { useGetProduct } from '@/queries/useProduct'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useAddToCart } from '@/queries/useCart'
import { useAppContext } from '@/context/app.context'
import { useAddToWishlist, useCheckProductInWishlist, useRemoveFromWishlist } from '@/queries/useWishlist'
import { toast } from 'react-toastify'
import { useTranslations } from 'next-intl'
import {
   FacebookShareButton,
   TwitterShareButton,
   LinkedinShareButton,
   TelegramShareButton,
   WhatsappShareButton,
   FacebookIcon,
   TwitterIcon,
   LinkedinIcon,
   TelegramIcon,
   WhatsappIcon
} from 'react-share'
import { useCreateRating, useGetRatingsByProductId, useReplyToRating } from '@/queries/useRating'
import type { RatingQueryParamsType } from '@/types/rating.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Reply } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

export default function ProductDetail({ id }: { id: string }) {
   const t = useTranslations('ProductDetail')
   const { userId } = useAppContext()
   const [buyCount, setBuyCount] = useState<number>(1)
   const handleBuyCount = (value: number) => {
      setBuyCount(value)
   }
   const router = useRouter()
   const addToCart = useAddToCart()
   const addToWishlist = useAddToWishlist()
   const removeFromWishlist = useRemoveFromWishlist()
   const { data: isInWishlist } = useCheckProductInWishlist(userId || 0, Number(getIdFromNameId(id)))
   const [isWishlistLoading, setIsWishlistLoading] = useState(false)
   const { data, isLoading } = useGetProduct(Number(getIdFromNameId(id)))
   const product = data?.data.data

   // State cho dialog phóng to hình ảnh
   const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
   const [selectedImage, setSelectedImage] = useState<string>('')

   // Thêm state và hooks cho chức năng đánh giá
   const [ratingValue, setRatingValue] = useState<number>(5)
   const [ratingComment, setRatingComment] = useState<string>('')
   const [ratingImages, setRatingImages] = useState<File[]>([])
   const [replyText, setReplyText] = useState<string>('')
   const [replyingTo, setReplyingTo] = useState<number | null>(null)
   const [replyImages, setReplyImages] = useState<File[]>([])

   // Hàm xử lý khi click vào hình ảnh
   const handleImageClick = (imageUrl: string) => {
      setSelectedImage(imageUrl)
      setIsImageDialogOpen(true)
   }

   const productId = Number(getIdFromNameId(id))
   const [ratingQueryParams, setRatingQueryParams] = useState<RatingQueryParamsType>({
      page: 0,
      size: 10,
      sortBy: 'createAt',
      sortDir: 'desc'
   })

   const {
      data: ratingsData,
      isLoading: isRatingsLoading,
      refetch
   } = useGetRatingsByProductId(productId, ratingQueryParams)

   const ratings = ratingsData?.data.data.content || []
   const totalPages = ratingsData?.data.data.totalPages || 0
   const currentPage = ratingsData?.data.data.number || 0

   // Hàm xử lý chuyển trang
   const handlePageChange = (page: number) => {
      setRatingQueryParams((prev) => ({
         ...prev,
         page
      }))
   }

   // Hàm xử lý thay đổi sắp xếp
   const handleSortChange = (sortBy: string, sortDir: string) => {
      setRatingQueryParams((prev) => ({
         ...prev,
         sortBy,
         sortDir,
         page: 0 // Reset về trang đầu tiên khi thay đổi sắp xếp
      }))
   }

   const createRating = useCreateRating()
   const replyToRating = useReplyToRating()

   // Hàm xử lý khi chọn hình ảnh
   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
         const fileList = Array.from(e.target.files)
         setRatingImages((prev) => [...prev, ...fileList])
      }
   }

   // Hàm xóa hình ảnh đã chọn
   const handleRemoveImage = (index: number) => {
      setRatingImages((prev) => prev.filter((_, i) => i !== index))
   }

   // Hàm xử lý khi chọn hình ảnh cho phản hồi
   const handleReplyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
         const fileList = Array.from(e.target.files)
         setReplyImages((prev) => [...prev, ...fileList])
      }
   }

   // Hàm xóa hình ảnh phản hồi đã chọn
   const handleRemoveReplyImage = (index: number) => {
      setReplyImages((prev) => prev.filter((_, i) => i !== index))
   }

   // Hàm xử lý gửi đánh giá
   const handleSubmitRating = () => {
      if (!userId) {
         toast.warning('Vui lòng đăng nhập để đánh giá sản phẩm')
         return
      }

      if (ratingComment.trim() === '') {
         toast.warning('Vui lòng nhập nội dung đánh giá')
         return
      }

      const ratingData = {
         rating: ratingValue,
         comment: ratingComment.trim()
      }

      createRating.mutate(
         {
            userId,
            productId,
            rating: ratingData,
            images: ratingImages
         },
         {
            onSuccess: () => {
               setRatingComment('')
               setRatingValue(5)
               setRatingImages([])
               refetch()
            },
            onError: (error: any) => {
               const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá'
               toast.warning(
                  errorMessage === 'You have already rated this product'
                     ? 'Bạn đã đánh giá sản phẩm này trước đó'
                     : errorMessage
               )
            }
         }
      )
   }

   // Hàm xử lý gửi phản hồi đánh giá
   const handleSubmitReply = (parentId: number) => {
      if (!userId) {
         toast.warning('Vui lòng đăng nhập để phản hồi đánh giá')
         return
      }

      if (replyText.trim() === '') {
         toast.warning('Vui lòng nhập nội dung phản hồi')
         return
      }

      replyToRating.mutate(
         {
            userId,
            parentRatingId: parentId,
            productId, // Thêm productId
            reply: { comment: replyText.trim() },
            images: replyImages // Thêm hình ảnh
         },
         {
            onSuccess: () => {
               setReplyText('')
               setReplyImages([]) // Reset hình ảnh
               refetch()
               setReplyingTo(null)
            }
         }
      )
   }

   // Lấy URL hiện tại cho việc chia sẻ
   const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
   const shareTitle = product?.name || 'Sản phẩm tuyệt vời'
   const shareDescription = product?.description?.substring(0, 100) || 'Xem chi tiết sản phẩm tại đây'

   // State cho hình ảnh chính đang được hiển thị
   const [activeImageIndex, setActiveImageIndex] = useState(0)
   const [currentIndexImg, setCurrentIndexImg] = useState([0, 5])
   const imageRef = useRef<HTMLImageElement>(null)

   // Lấy danh sách ảnh hiện tại để hiển thị trong carousel
   const currentImages = useMemo(
      () => (product?.productImages ? product.productImages.slice(currentIndexImg[0], currentIndexImg[1]) : []),
      [product, currentIndexImg]
   )

   // Cập nhật activeImageIndex khi product thay đổi
   useEffect(() => {
      if (product?.productImages && product.productImages.length > 0) {
         setActiveImageIndex(0)
      }
   }, [product])

   // Hàm xử lý khi click vào hình ảnh nhỏ
   const handleThumbnailClick = (index: number) => {
      // Cập nhật index của hình ảnh chính
      setActiveImageIndex(currentIndexImg[0] + index)
   }

   // Hàm điều hướng carousel - sửa lại để chỉ dịch chuyển 1 tấm ảnh mỗi lần
   const next = () => {
      if (product?.productImages && currentIndexImg[1] < product.productImages.length) {
         // Dịch chuyển chỉ 1 tấm ảnh mỗi lần
         setCurrentIndexImg((prev) => [prev[0] + 1, prev[1] + 1])
      }
   }

   const prev = () => {
      if (currentIndexImg[0] > 0) {
         // Dịch chuyển chỉ 1 tấm ảnh mỗi lần
         setCurrentIndexImg((prev) => [prev[0] - 1, prev[1] - 1])
      }
   }

   // Xử lý zoom hình ảnh khi hover
   const handleImageZoom = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!imageRef.current) return

      const { left, top, width, height } = event.currentTarget.getBoundingClientRect()
      const x = (event.clientX - left) / width
      const y = (event.clientY - top) / height

      imageRef.current.style.transformOrigin = `${x * 100}% ${y * 100}%`
      imageRef.current.style.transform = 'scale(1.5)'
      imageRef.current.style.cursor = 'zoom-in'
   }

   const handleImageZoomLeave = () => {
      if (!imageRef.current) return
      imageRef.current.style.transform = 'scale(1)'
   }

   // Xử lý thêm/xóa sản phẩm khỏi danh sách yêu thích
   const handleWishlistToggle = () => {
      if (!userId) {
         toast.warning('Vui lòng đăng nhập để sử dụng tính năng này')
         return
      }

      setIsWishlistLoading(true)

      if (isInWishlist?.data.data) {
         removeFromWishlist.mutate(
            { userId, productId: Number(getIdFromNameId(id)) },
            { onSettled: () => setIsWishlistLoading(false) }
         )
      } else {
         addToWishlist.mutate(
            { userId, productId: Number(getIdFromNameId(id)) },
            { onSettled: () => setIsWishlistLoading(false) }
         )
      }
   }

   if (isLoading) {
      return (
         <div className='my-5 container'>
            <div className='bg-secondary rounded-lg p-5 flex flex-col md:flex-row gap-10'>
               <div className='w-full md:w-1/2 flex flex-col gap-4'>
                  <Skeleton className='aspect-square w-full h-auto rounded-md' />
                  <div className='grid grid-cols-5 gap-3'>
                     {Array(5)
                        .fill(0)
                        .map((_, index) => (
                           <Skeleton key={index} className='aspect-square w-full h-auto rounded-md' />
                        ))}
                  </div>
               </div>
               <div className='w-full md:w-1/2 flex flex-col gap-5'>
                  <Skeleton className='h-8 w-3/4' />
                  <Skeleton className='h-5 w-1/3' />
                  <Skeleton className='h-12 w-1/2' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-12 w-full' />
               </div>
            </div>
         </div>
      )
   }

   if (!product) {
      return (
         <div className='my-5 container'>
            <div className='bg-secondary rounded-lg p-5 text-center py-20'>
               <h2 className='text-2xl font-medium mb-4'>{t('productNotFound')}</h2>
               <p className='text-muted-foreground'>{t('productNotFoundDesc')}</p>
            </div>
         </div>
      )
   }

   return (
      <div className='my-5 container'>
         <div className='bg-secondary rounded-lg p-5 flex flex-col md:flex-row gap-10'>
            <div className='w-full md:w-1/2 flex flex-col gap-2'>
               {/* Hình ảnh chính */}
               <div
                  onMouseMove={handleImageZoom}
                  onMouseLeave={handleImageZoomLeave}
                  className='relative w-full overflow-hidden rounded-md aspect-square'
               >
                  {product.productImages && product.productImages.length > 0 ? (
                     <Image
                        ref={imageRef}
                        src={product.productImages[activeImageIndex].imageUrl || '/placeholder.svg'}
                        alt={decodeHTML(product.name)}
                        width={500}
                        height={500}
                        className='h-full w-full object-contain transition-transform duration-300'
                     />
                  ) : (
                     <Image
                        src={product.image || '/placeholder.svg'}
                        alt={decodeHTML(product.name)}
                        width={500}
                        height={500}
                        className='h-full w-full object-contain'
                     />
                  )}
               </div>

               {/* Hình ảnh nhỏ */}
               {product.productImages && product.productImages.length > 0 && (
                  <div className='relative'>
                     <div className='grid grid-cols-5 gap-2'>
                        {currentImages.map((imageUrl, index) => (
                           <div
                              key={index}
                              className={`relative aspect-square cursor-pointer overflow-hidden rounded-md border-2 ${
                                 currentIndexImg[0] + index === activeImageIndex
                                    ? 'border-primaryColor'
                                    : 'border-transparent hover:border-gray-300'
                              }`}
                              onClick={() => handleThumbnailClick(index)}
                           >
                              <Image
                                 src={imageUrl.imageUrl || '/placeholder.svg'}
                                 alt={`${decodeHTML(product.name)} - ảnh ${index + 1}`}
                                 width={100}
                                 height={100}
                                 className='h-full w-full object-cover'
                              />
                           </div>
                        ))}
                     </div>

                     {/* Nút điều hướng - hiển thị khi có nhiều hơn 5 ảnh */}
                     {product.productImages.length > 5 && (
                        <>
                           <button
                              onClick={prev}
                              disabled={currentIndexImg[0] <= 0}
                              className={`absolute -left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ${
                                 currentIndexImg[0] <= 0 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'
                              }`}
                              aria-label='Ảnh trước'
                           >
                              <ChevronLeft className='h-5 w-5 text-primaryColor' />
                           </button>
                           <button
                              onClick={next}
                              disabled={currentIndexImg[1] >= product.productImages.length}
                              className={`absolute -right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ${
                                 currentIndexImg[1] >= product.productImages.length
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:bg-gray-100'
                              }`}
                              aria-label='Ảnh tiếp theo'
                           >
                              <ChevronRight className='h-5 w-5 text-primaryColor' />
                           </button>
                        </>
                     )}
                  </div>
               )}
            </div>

            <div className='w-full md:w-1/2 flex flex-col gap-5'>
               {/* Tên sản phẩm */}
               <h1 className='font-medium text-2xl'>{decodeHTML(product.name)}</h1>

               {/* Đánh giá và số lượng bán */}
               <div className='flex items-center flex-wrap gap-3 text-base'>
                  <ProductRating
                     classNameStar1='w-5 h-5 fill-yellow-300 text-yellow-300'
                     classNameStar2='w-5 h-5 fill-current text-gray-300'
                     rating={product.averageRating || 0}
                  />
                  <span>{t('reviewCount', { count: product.reviewCount || 0 })}</span>|
                  <span>{t('soldCount', { count: formatNumberToK(product.soldQuantity || 0) })}</span>
               </div>

               {/* Giá */}
               <div className='bg-background p-5 rounded flex items-center gap-5'>
                  {product.discountedPrice && product.discountedPrice < product.price ? (
                     <>
                        <span className='line-through text-base text-gray-500'>{formatCurrency(product.price)}</span>
                        <span className='text-secondaryColor text-2xl font-medium'>
                           {formatCurrency(product.discountedPrice)}
                        </span>
                        <span className='rounded-sm bg-secondaryColor px-1 py-[2px] text-xs font-semibold text-white'>
                           {product.discountPercentage.toFixed(0)}% GIẢM
                        </span>
                        {product.discountType === 'FLASH_SALE' && (
                           <span className='rounded-sm bg-yellow-500 flex items-center gap-1 px-1 py-[2px] text-xs font-semibold text-secondaryColor'>
                              Flash sale
                              <Zap size={16} />
                           </span>
                        )}
                     </>
                  ) : (
                     <span className='text-secondaryColor text-2xl font-medium'>{formatCurrency(product.price)}</span>
                  )}
               </div>

               {/* Thông tin cơ bản */}
               <div className='bg-background p-4 rounded space-y-2 text-sm'>
                  <div className='grid grid-cols-2 sm:grid-cols-12'>
                     <span className='sm:col-span-3 text-gray-500'>{t('brand')}</span>
                     <span className='sm:col-span-9 font-medium'>{product.brandName || t('updating')}</span>
                  </div>
                  <div className='grid grid-cols-2 sm:grid-cols-12'>
                     <span className='sm:col-span-3 text-gray-500'>{t('category')}</span>
                     <span className='sm:col-span-9 font-medium'>{product.categoryName || t('updating')}</span>
                  </div>
                  <div className='grid grid-cols-2 sm:grid-cols-12'>
                     <span className='sm:col-span-3 text-gray-500'>{t('warranty')}</span>
                     <span className='sm:col-span-9 font-medium'>{product.warranty || t('updating')}</span>
                  </div>
                  <div className='grid grid-cols-2 sm:grid-cols-12'>
                     <span className='sm:col-span-3 text-gray-500'>{t('status')}</span>
                     <span className='sm:col-span-9 font-medium'>
                        {product.stock > 0 ? (
                           product.stock <= 5 ? (
                              <span className='text-amber-500'>{t('lowStock', { stock: product.stock })}</span>
                           ) : (
                              <span className='text-green-500'>{t('inStock', { stock: product.stock })}</span>
                           )
                        ) : (
                           <span className='text-red-500'>{t('outOfStock')}</span>
                        )}
                     </span>
                  </div>
               </div>

               {/* Số lượng */}
               <div className='flex items-center flex-wrap gap-4 text-base'>
                  <span>{t('quantity')}</span>
                  <QuantityController
                     value={buyCount}
                     max={product.stock}
                     onIncrease={handleBuyCount}
                     onDecrease={handleBuyCount}
                     onType={handleBuyCount}
                  />
                  <span>
                     {product.stock} {t('available')}
                  </span>
               </div>

               {/* Nút mua hàng */}
               <div className='flex items-center flex-wrap gap-4 text-base'>
                  <button
                     onClick={() => addToCart.mutate({ userId: userId!, productId: product.id, quantity: buyCount })}
                     className='px-5 py-3 flex items-center gap-2 rounded border border-secondaryColor bg-secondaryColor/10 hover:bg-secondaryColor/0 text-secondaryColor'
                     disabled={product.stock === 0}
                  >
                     <ShoppingBasket />
                     {t('addToCart')}
                  </button>
                  <button
                     onClick={() => {
                        addToCart.mutate({ userId: userId!, productId: product.id, quantity: buyCount })
                        router.push(`/cart?purchaseId=${product.id}`)
                     }}
                     className='px-5 py-3 bg-secondaryColor text-white rounded hover:bg-secondaryColor/90'
                     disabled={product.stock === 0}
                  >
                     {t('buyNow')}
                  </button>
                  <button
                     onClick={handleWishlistToggle}
                     disabled={isWishlistLoading}
                     className={`p-3 rounded-full border ${
                        isInWishlist?.data.data
                           ? 'border-red-500 bg-red-50 text-red-500'
                           : 'border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-500'
                     }`}
                     aria-label={isInWishlist?.data.data ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                  >
                     <Heart className={isInWishlist?.data.data ? 'fill-red-500' : ''} />
                  </button>
               </div>

               {/* Chia sẻ mạng xã hội */}
               <div className='flex gap-2'>
                  <FacebookShareButton url={shareUrl} hashtag={shareTitle} className='focus:outline-none'>
                     <FacebookIcon size={32} round />
                  </FacebookShareButton>

                  <TwitterShareButton url={shareUrl} title={shareTitle} className='focus:outline-none'>
                     <TwitterIcon size={32} round />
                  </TwitterShareButton>

                  <LinkedinShareButton
                     url={shareUrl}
                     title={shareTitle}
                     summary={shareDescription}
                     className='focus:outline-none'
                  >
                     <LinkedinIcon size={32} round />
                  </LinkedinShareButton>

                  <TelegramShareButton url={shareUrl} title={shareTitle} className='focus:outline-none'>
                     <TelegramIcon size={32} round />
                  </TelegramShareButton>

                  <WhatsappShareButton url={shareUrl} title={shareTitle} separator=' - ' className='focus:outline-none'>
                     <WhatsappIcon size={32} round />
                  </WhatsappShareButton>
               </div>
            </div>
         </div>

         {/* Thông số kỹ thuật */}
         {product.productDetail && product.productDetail.processor && (
            <div className='bg-secondary rounded-lg p-5 mt-5'>
               <h2 className='font-medium text-xl mb-5 p-3 rounded-lg bg-background'>{t('specifications')}</h2>
               <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {product.productDetail.processor && (
                     <div className='p-3 border rounded-lg bg-background'>
                        <span className='font-medium'>{t('specs.cpu')}</span> {product.productDetail.processor}
                     </div>
                  )}
                  {product.productDetail.ram && (
                     <div className='p-3 border rounded-lg bg-background'>
                        <span className='font-medium'>{t('specs.ram')}</span> {product.productDetail.ram}
                     </div>
                  )}
                  {product.productDetail.storage && (
                     <div className='p-3 border rounded-lg bg-background'>
                        <span className='font-medium'>{t('specs.storage')}</span> {product.productDetail.storage}
                     </div>
                  )}
                  {product.productDetail.display && (
                     <div className='p-3 border rounded-lg bg-background'>
                        <span className='font-medium'>{t('specs.display')}</span> {product.productDetail.display}
                     </div>
                  )}
                  {product.productDetail.graphics && (
                     <div className='p-3 border rounded-lg bg-background'>
                        <span className='font-medium'>{t('specs.graphics')}</span> {product.productDetail.graphics}
                     </div>
                  )}
                  {product.productDetail.battery && (
                     <div className='p-3 border rounded-lg bg-background'>
                        <span className='font-medium'>{t('specs.battery')}</span> {product.productDetail.battery}
                     </div>
                  )}
                  {product.productDetail.camera && (
                     <div className='p-3 border rounded-lg bg-background'>
                        <span className='font-medium'>{t('specs.camera')}</span> {product.productDetail.camera}
                     </div>
                  )}
                  {product.productDetail.operatingSystem && (
                     <div className='p-3 border rounded-lg bg-background'>
                        <span className='font-medium'>{t('specs.os')}</span> {product.productDetail.operatingSystem}
                     </div>
                  )}
                  {product.productDetail.connectivity && (
                     <div className='p-3 border rounded-lg bg-background'>
                        <span className='font-medium'>{t('specs.connectivity')}</span>{' '}
                        {product.productDetail.connectivity}
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* Mô tả sản phẩm */}
         <div className='bg-secondary rounded-lg p-5 mt-5'>
            <h2 className='font-medium text-xl mb-5 p-3 rounded-lg bg-background'>{t('description')}</h2>
            <div className='flex flex-col gap-2 max-w-none'>
               {product.description ? (
                  decodeHTML(product.description)
                     .split(/(?<=[.?!])\s+/) // Tách sau dấu chấm, chấm hỏi, chấm than
                     .map((sentence, index) => (
                        <p key={index} className='whitespace-pre-line'>
                           {sentence.trim()}
                        </p>
                     ))
               ) : (
                  <p className='text-muted-foreground italic'>{t('noDescription')}</p>
               )}
            </div>
         </div>

         {/* Đánh giá sản phẩm */}
         <div className='bg-secondary rounded-lg p-5 mt-5'>
            <h2 className='font-medium text-xl mb-5 p-3 rounded-lg bg-background'>{t('reviews')}</h2>

            {/* Hiển thị danh sách đánh giá */}
            <div className='space-y-4 mb-6'>
               {isRatingsLoading ? (
                  <div className='flex justify-center py-4'>
                     <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColor'></div>
                  </div>
               ) : ratings.length > 0 ? (
                  <>
                     {/* Bộ lọc và sắp xếp */}
                     <div className='flex justify-between flex-wrap gap-3 items-center mb-4'>
                        <div className='text-sm'>
                           {t('totalReviews', { count: ratingsData?.data.data.totalElements || 0 })}
                        </div>
                        <div className='flex items-center gap-2'>
                           <span className='text-sm'>{t('sortBy')}:</span>
                           <Select
                              value={`${ratingQueryParams.sortBy}-${ratingQueryParams.sortDir}`}
                              onValueChange={(value) => {
                                 const [sortBy, sortDir] = value.split('-')
                                 handleSortChange(sortBy, sortDir)
                              }}
                           >
                              <SelectTrigger className='w-[180px] bg-primary-foreground'>
                                 <SelectValue placeholder={t('sortBy')} />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value='createAt-desc'>{t('newest')}</SelectItem>
                                 <SelectItem value='createAt-asc'>{t('oldest')}</SelectItem>
                                 <SelectItem value='rating-desc'>{t('highestRating')}</SelectItem>
                                 <SelectItem value='rating-asc'>{t('lowestRating')}</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                     </div>

                     {/* Danh sách đánh giá */}
                     {ratings.map((rating) => (
                        <div key={rating.id} className='p-4 border rounded-lg bg-background'>
                           <div className='flex items-start gap-3'>
                              <Avatar className='h-10 w-10'>
                                 <AvatarImage src={rating.userPicture || '/placeholder.svg'} alt={rating.userName} />
                                 <AvatarFallback>{rating.userName?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className='flex-1'>
                                 <div className='flex items-center gap-2'>
                                    <span className='font-medium'>{rating.userName}</span>
                                    <span className='text-xs text-gray-500'>
                                       {rating.createAt &&
                                          format(new Date(rating.createAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </span>
                                 </div>
                                 <div className='flex items-center gap-2 my-1'>
                                    <ProductRating
                                       rating={rating.rating}
                                       classNameStar1='w-4 h-4 fill-yellow-300 text-yellow-300'
                                       classNameStar2='w-4 h-4 fill-current text-gray-300'
                                    />
                                 </div>
                                 <p className='mt-1'>{rating.comment}</p>
                                 {/* Hiển thị hình ảnh của đánh giá */}
                                 {rating.imageUrls && rating.imageUrls.length > 0 && (
                                    <div className='flex gap-2 mt-2 overflow-x-auto pb-2'>
                                       {rating.imageUrls.map((imageUrl, idx) => (
                                          <div
                                             key={idx}
                                             className='relative min-w-[80px] h-[80px] cursor-pointer hover:opacity-90 transition-opacity'
                                             onClick={() => handleImageClick(imageUrl)}
                                          >
                                             <Image
                                                src={imageUrl || '/placeholder.svg'}
                                                alt={`Rating image ${idx}`}
                                                width={80}
                                                height={80}
                                                className='rounded-md object-cover w-full h-full'
                                             />
                                          </div>
                                       ))}
                                    </div>
                                 )}

                                 {/* Dialog hiển thị hình ảnh phóng to */}
                                 <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                                    <DialogContent className='max-w-3xl p-0 overflow-hidden bg-transparent border-non'>
                                       <DialogTitle className='sr-only'>Xem hình ảnh phóng to</DialogTitle>
                                       <div className='bg-white/10 backdrop-blur-sm p-1 rounded-lg overflow-hidden max-h-[80vh] max-w-full'>
                                          <Image
                                             src={selectedImage || '/placeholder.svg'}
                                             alt='Enlarged image'
                                             width={1200}
                                             height={800}
                                             className='rounded-md'
                                          />
                                       </div>
                                       {/* <button
                                          className='absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70'
                                          onClick={() => setIsImageDialogOpen(false)}
                                       >
                                          <X color='white' />
                                       </button> */}
                                    </DialogContent>
                                 </Dialog>

                                 {/* Nút trả lời */}
                                 {userId && (
                                    <button
                                       onClick={() => setReplyingTo(replyingTo === rating.id ? null : rating.id!)}
                                       className='mt-2 text-sm flex items-center gap-1 text-gray-500 hover:text-primaryColor'
                                    >
                                       <Reply className='h-4 w-4' />
                                       {t('reply')}
                                    </button>
                                 )}

                                 {/* Form trả lời */}
                                 {replyingTo === rating.id && (
                                    <div className='mt-3 space-y-2'>
                                       <Textarea
                                          placeholder={t('enterReply')}
                                          value={replyText}
                                          onChange={(e) => setReplyText(e.target.value)}
                                          className='min-h-[80px]'
                                       />

                                       {/* Thêm phần upload hình ảnh */}
                                       <div className='flex items-center gap-2'>
                                          <label
                                             htmlFor={`reply-image-${rating.id}`}
                                             className='cursor-pointer text-white px-3 py-1 text-sm rounded bg-primaryColor'
                                          >
                                             {t('addImage')}
                                          </label>
                                          <input
                                             type='file'
                                             id={`reply-image-${rating.id}`}
                                             accept='image/*'
                                             multiple
                                             onChange={handleReplyImageChange}
                                             className='hidden'
                                          />
                                          <span className='text-xs text-gray-500'>
                                             {replyImages.length > 0
                                                ? `Đã chọn ${replyImages.length} hình ảnh`
                                                : 'Chưa có hình ảnh nào'}
                                          </span>
                                       </div>

                                       {/* Hiển thị hình ảnh đã chọn */}
                                       {replyImages.length > 0 && (
                                          <div className='grid grid-cols-5 gap-2 mt-2'>
                                             {replyImages.map((image, index) => (
                                                <div key={index} className='relative group'>
                                                   <div className='aspect-square rounded-md overflow-hidden border'>
                                                      <Image
                                                         width={80}
                                                         height={80}
                                                         src={URL.createObjectURL(image) || '/placeholder.svg'}
                                                         alt={`Preview ${index}`}
                                                         className='w-full h-full object-cover'
                                                      />
                                                   </div>
                                                   <button
                                                      type='button'
                                                      onClick={() => handleRemoveReplyImage(index)}
                                                      className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                                                   >
                                                      <X size={20} />
                                                   </button>
                                                </div>
                                             ))}
                                          </div>
                                       )}

                                       <div className='flex justify-end gap-2'>
                                          <Button
                                             variant='outline'
                                             size='sm'
                                             onClick={() => {
                                                setReplyingTo(null)
                                                setReplyText('')
                                                setReplyImages([]) // Reset hình ảnh khi hủy
                                             }}
                                          >
                                             {t('cancel')}
                                          </Button>
                                          <Button
                                             size='sm'
                                             onClick={() => handleSubmitReply(rating.id!)}
                                             disabled={replyToRating.isPending}
                                          >
                                             {replyToRating.isPending ? t('sending') : t('sendReply')}
                                          </Button>
                                       </div>
                                    </div>
                                 )}

                                 {/* Hiển thị các phản hồi */}
                                 {rating.replies && rating.replies.length > 0 && (
                                    <div className='mt-3 space-y-3 pl-4 border-l-2 border-gray-200'>
                                       {rating.replies.map((reply) => (
                                          <div key={reply.id} className='pt-3'>
                                             <div className='flex items-start gap-3'>
                                                <Avatar className='h-8 w-8'>
                                                   <AvatarImage
                                                      src={reply.userPicture || '/placeholder.svg'}
                                                      alt={reply.userName}
                                                   />
                                                   <AvatarFallback>{reply.userName?.charAt(0) || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                   <div className='flex items-center gap-2'>
                                                      <span className='font-medium'>{reply.userName}</span>
                                                      <span className='text-xs text-gray-500'>
                                                         {reply.createAt &&
                                                            format(new Date(reply.createAt), 'dd/MM/yyyy HH:mm', {
                                                               locale: vi
                                                            })}
                                                      </span>
                                                   </div>
                                                   <p className='mt-1'>{reply.comment}</p>

                                                   {/* Hiển thị hình ảnh của phản hồi */}
                                                   {reply.imageUrls && reply.imageUrls.length > 0 && (
                                                      <div className='flex gap-2 mt-2 overflow-x-auto pb-2'>
                                                         {reply.imageUrls.map((imageUrl, idx) => (
                                                            <div
                                                               key={idx}
                                                               className='relative min-w-[80px] h-[80px] cursor-pointer hover:opacity-90 transition-opacity'
                                                               onClick={() => handleImageClick(imageUrl)}
                                                            >
                                                               <Image
                                                                  src={imageUrl || '/placeholder.svg'}
                                                                  alt={`Reply image ${idx}`}
                                                                  width={80}
                                                                  height={80}
                                                                  className='rounded-md object-cover w-full h-full'
                                                               />
                                                            </div>
                                                         ))}
                                                      </div>
                                                   )}
                                                </div>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     ))}

                     {/* Phân trang */}
                     {totalPages > 1 && (
                        <div className='flex justify-center mt-6'>
                           <div className='flex items-center gap-2'>
                              <button
                                 onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                                 disabled={currentPage === 0}
                                 className='p-2 border rounded-md disabled:opacity-50'
                              >
                                 <ChevronLeft className='h-4 w-4' />
                              </button>

                              {Array.from({ length: totalPages }, (_, i) => (
                                 <button
                                    key={i}
                                    onClick={() => handlePageChange(i)}
                                    className={`w-8 h-8 rounded-md ${
                                       currentPage === i ? 'bg-primaryColor text-white' : 'border hover:bg-gray-100'
                                    }`}
                                 >
                                    {i + 1}
                                 </button>
                              ))}

                              <button
                                 onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                                 disabled={currentPage === totalPages - 1}
                                 className='p-2 border rounded-md disabled:opacity-50'
                              >
                                 <ChevronRight className='h-4 w-4' />
                              </button>
                           </div>
                        </div>
                     )}
                  </>
               ) : (
                  <div className='text-center py-8'>
                     <p className='text-muted-foreground'>{t('noReviews')}</p>
                  </div>
               )}
            </div>

            <Separator className='my-6' />

            {/* Form đánh giá */}
            <div className='flex flex-col gap-4 mt-6'>
               <h3 className='font-medium'>{t('writeReview')}</h3>

               {!userId ? (
                  <div className='bg-blue-50 text-blue-700 p-4 rounded-md'>{t('pleaseLogin')}</div>
               ) : (
                  <>
                     <div className='flex items-center gap-2'>
                        <label>{t('rating')}</label>
                        <div className='flex items-center'>
                           {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                 key={star}
                                 type='button'
                                 onClick={() => setRatingValue(star)}
                                 className='focus:outline-none'
                              >
                                 <Star
                                    className={`w-6 h-6 ${
                                       star <= ratingValue
                                          ? 'fill-yellow-300 text-yellow-300'
                                          : 'fill-current text-gray-300'
                                    }`}
                                 />
                              </button>
                           ))}
                        </div>
                        <span className='text-sm text-gray-500 ml-2'>{t('outOf5', { rating: ratingValue })}</span>
                     </div>
                     <Textarea
                        placeholder={t('enterReview')}
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        className='min-h-[120px] bg-primary-foreground'
                     />

                     {/* Phần tải lên hình ảnh */}
                     <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                           <label
                              htmlFor='rating-images'
                              className='cursor-pointer px-4 py-2 rounded-md bg-primaryColor text-white text-sm font-medium hover:bg-primaryColor/90 transition-colors flex items-center gap-2'
                           >
                              <ImagePlus size={20} />
                              Thêm hình ảnh
                           </label>
                           <input
                              id='rating-images'
                              type='file'
                              accept='image/*'
                              multiple
                              onChange={handleImageChange}
                              className='hidden'
                           />
                           <span className='text-sm text-gray-500'>
                              {ratingImages.length > 0
                                 ? `Đã chọn ${ratingImages.length} hình ảnh`
                                 : 'Chưa có hình ảnh nào'}
                           </span>
                        </div>

                        {/* Hiển thị hình ảnh đã chọn */}
                        {ratingImages.length > 0 && (
                           <div className='grid grid-cols-5 gap-2 mt-2'>
                              {ratingImages.map((image, index) => (
                                 <div key={index} className='relative group'>
                                    <div className='aspect-square rounded-md overflow-hidden border'>
                                       <img
                                          src={URL.createObjectURL(image) || '/placeholder.svg'}
                                          alt={`Preview ${index}`}
                                          className='w-full h-full object-cover'
                                       />
                                    </div>
                                    <button
                                       type='button'
                                       onClick={() => handleRemoveImage(index)}
                                       className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                                    >
                                       <X size={20} />
                                    </button>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>

                     <Button onClick={handleSubmitRating} disabled={createRating.isPending} className='self-start'>
                        <SendHorizontal />
                        {createRating.isPending ? t('sending') : t('sendReview')}
                     </Button>
                  </>
               )}
            </div>
         </div>
      </div>
   )
}
