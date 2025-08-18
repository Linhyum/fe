import type { Metadata } from 'next'
import './globals.css'
import { Manrope } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AppProvider from '@/context/app.context'
import { ThemeProvider } from '@/components/theme-provider'
import NextTopLoader from 'nextjs-toploader'
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
export const metadata: Metadata = {
   title: 'TechShop | Cửa hàng điện tử chính hãng',
   description: 'Mua sắm điện thoại, laptop và các thiết bị điện tử chính hãng với giá tốt nhất tại TechShop',
   icons: {
      icon: '/favicon.png'
   }
}

export default async function RootLayout({
   children
}: Readonly<{
   children: React.ReactNode
}>) {
   const locale = await getLocale()
   return (
      <html lang={'en'} suppressHydrationWarning>
         <body suppressHydrationWarning className={`${manrope.className} antialiased text-sm font-normal`}>
            <NextIntlClientProvider>
               <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
                  <AppProvider>
                     <NextTopLoader color='#ff424e' showSpinner={false} />
                     <main>{children}</main>
                  </AppProvider>
                  <ToastContainer position='top-center' autoClose={2000} />
               </ThemeProvider>
            </NextIntlClientProvider>
         </body>
      </html>
   )
}
