import Order from '@/app/(user)/order/order'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Thanh toán đơn hàng | TechShop',
   description: 'Thanh toán đơn hàng của bạn'
}
export default function page() {
   return <Order />
}
