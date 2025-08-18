import BrandManage from '@/app/(admin)/dashboard/brand/brand-manage'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Quản lý thương hiệu | TechShop',
   description: 'Quản lý thương hiệu | TechShop'
}
export default function page() {
   return <BrandManage />
}
