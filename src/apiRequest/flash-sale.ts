import http from '@/lib/http'
import { ProductFlashSaleType } from '@/types/flash-sale.type'
import { ResponseData } from '@/types/utils.type'

export const getALllProductFlashSale = () => http.get<ResponseData<ProductFlashSaleType[]>>('/flash-sales/current')
