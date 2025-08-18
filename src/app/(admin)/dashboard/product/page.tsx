import ProductManage from '@/app/(admin)/dashboard/product/product-manage'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Quản lý sản phẩm | TechShop',
   description: 'Quản lý sản phẩm | TechShop'
}
export default function page() {
   return <ProductManage />
}
