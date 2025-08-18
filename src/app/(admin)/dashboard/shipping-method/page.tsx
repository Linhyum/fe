import ShippingMethod from '@/app/(admin)/dashboard/shipping-method/shipping-method'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Quản lý phương thức vận chuyển | TechShop',
   description: 'Quản lý phương thức vận chuyển | TechShop'
}
export default function page() {
   return <ShippingMethod />
}
