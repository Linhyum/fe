import CategoryManage from '@/app/(admin)/dashboard/category/category-manage'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Quản lý danh mục | TechShop',
   description: 'Quản lý danh mục | TechShop'
}
export default function page() {
   return <CategoryManage />
}
