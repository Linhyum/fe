import DiscountManage from '@/app/(admin)/dashboard/discount/discount-manage'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Quản lý mã giảm giá | TechShop',
   description: 'Quản lý mã giảm giá | TechShop'
}
export default function page() {
   return <DiscountManage />
}
