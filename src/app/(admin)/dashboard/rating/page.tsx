import RatingManage from '@/app/(admin)/dashboard/rating/rating-manage'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Quản lý đánh giá sản phẩm | TechShop',
   description: 'Quản lý đánh giá sản phẩm | TechShop'
}
export default function page() {
   return <RatingManage />
}
