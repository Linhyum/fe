import ResetPassword from '@/app/reset-password/reset-password'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Đặt lại mật khẩu | TechShop',
   description: 'Đặt lại mật khẩu của tài khoản TechShop của bạn'
}
export default function page() {
   return <ResetPassword />
}
