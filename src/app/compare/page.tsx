import Compare from '@/app/compare/compare'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'So sánh sản phẩm | TechShop',
   description: 'So sánh sản phẩm của TechShop'
}
export default function page() {
   return <Compare />
}
