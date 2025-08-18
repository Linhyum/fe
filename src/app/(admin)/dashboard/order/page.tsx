import OrderManage from '@/app/(admin)/dashboard/order/order-manage'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Quản lý đơn hàng | TechShop',
   description: 'Quản lý đơn hàng | TechShop'
}
export default function page() {
   return <OrderManage />
}
