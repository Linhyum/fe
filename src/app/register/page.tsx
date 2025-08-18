import Register from '@/app/register/register'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Đăng ký | TechShop',
   description: 'Đăng ký vào tài khoản TechShop của bạn để mua sắm và quản lý đơn hàng'
}
export default function page() {
   return <Register />
}
