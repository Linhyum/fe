import { getALllProductFlashSale } from '@/apiRequest/flash-sale'
import { useQuery } from '@tanstack/react-query'

export const useGetProductFlashSale = () => {
   return useQuery({
      queryKey: ['product-flash-sale'],
      queryFn: getALllProductFlashSale
   })
}
