import Purchase from '@/app/(user)/purchase/purchase'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Danh sách đơn hàng | TechShop',
   description: 'Danh sách đơn hàng của bạn'
}
export default function page() {
   return <Purchase />
}
