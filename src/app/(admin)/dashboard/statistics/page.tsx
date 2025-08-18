import Statistics from '@/app/(admin)/dashboard/statistics/statistics'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Thống kê doanh thu | TechShop',
   description: 'Thống kê doanh thu | TechShop'
}
export default function page() {
   return <Statistics />
}
