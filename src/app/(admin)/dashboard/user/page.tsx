import UserManage from '@/app/(admin)/dashboard/user/user-manage'
import { Metadata } from 'next'
import React from 'react'
export const metadata: Metadata = {
   title: 'Quản lý người dùng | TechShop',
   description: 'Quản lý người dùng | TechShop'
}
export default function page() {
   return <UserManage />
}
