import Profile from '@/app/(user)/profile/profile'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Hồ sơ cá nhân | TechShop',
   description: 'Xem thông tin và quản lý tài khoản của bạn'
}
export default function page() {
   return <Profile />
}
