import Login from '@/app/login/login'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Đăng nhập | TechShop',
   description: 'Đăng nhập vào tài khoản TechShop của bạn để mua sắm và quản lý đơn hàng'
}
export default function page() {
   return <Login />
}
