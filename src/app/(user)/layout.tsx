import Footer from '@/components/footer'
import Header from '@/components/header'
import React from 'react'

export default function UserLayout({
   children
}: Readonly<{
   children: React.ReactNode
}>) {
   return (
      <>
         <Header />
         {children}
         <Footer />
      </>
   )
}
