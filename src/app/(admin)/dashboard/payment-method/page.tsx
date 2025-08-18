import PaymentMethod from '@/app/(admin)/dashboard/payment-method/payment-method'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Quản lý phương thức thanh toán | TechShop',
   description: 'Quản lý phương thức thanh toán | TechShop'
}
export default function page() {
   return <PaymentMethod />
}
