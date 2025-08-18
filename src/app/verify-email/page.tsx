import VerityEmail from '@/app/verify-email/verify-email'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Xác thực email | TechShop',
   description: 'Xác thực email của tài khoản TechShop của bạn'
}
export default function page() {
   return <VerityEmail />
}
