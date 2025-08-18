import ForgotPassword from '@/app/forgot-password/forgot-password'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Quên mật khẩu | TechShop',
   description: 'Quên mật khẩu của tài khoản TechShop của bạn'
}
export default function page() {
   return <ForgotPassword />
}
