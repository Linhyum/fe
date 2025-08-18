import Wishlist from '@/app/(user)/wishlist/wishlist'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Danh sách sản phẩm yêu thích | TechShop',
   description: 'Danh sách sản phẩm yêu thích của bạn'
}
export default function page() {
   return <Wishlist />
}
