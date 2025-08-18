import Cart from '@/app/(user)/cart/cart'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Giỏ hàng | TechShop',
   description: 'Quản lý giỏ hàng của bạn'
}
export default function page() {
   return <Cart />
}
