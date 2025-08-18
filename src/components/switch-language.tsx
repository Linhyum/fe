'use client'
import React from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Locale, locales } from '@/i18n/config'
import { setUserLocale } from '@/services/locale'
import { Check } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function SwitchLanguage() {
   const t = useTranslations('SwitchLanguage')
   const locale = useLocale() as Locale

   // Mapping của locale với tên hiển thị và đường dẫn hình ảnh cờ
   const localeMap: Record<Locale, { name: string; flagSrc: string }> = {
      vi: { name: 'Tiếng Việt', flagSrc: '/vi.png' },
      en: { name: 'English', flagSrc: '/en.png' }
   }

   // Lấy thông tin của locale hiện tại
   const currentLocale = localeMap[locale]

   return (
      <DropdownMenu>
         <DropdownMenuTrigger className='text-sm' asChild>
            <Button
               variant='ghost'
               className={cn('gap-2 hover:bg-primary/10 focus-visible:ring-0 focus-visible:ring-offset-0 px-3')}
            >
               <>
                  <span className='font-medium flex items-center gap-1 text-white'>
                     <Image
                        src={currentLocale.flagSrc}
                        alt={currentLocale.name}
                        width={20}
                        height={20}
                        className='rounded-full h-5 w-5 flex-shrink-0'
                     />
                     <span>{currentLocale.name}</span>
                  </span>
               </>
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align='end' className='w-[180px] text-sm'>
            {locales.map((loc) => (
               <DropdownMenuItem
                  key={loc}
                  className={cn(
                     'flex items-center gap-2 cursor-pointer',
                     locale === loc && 'bg-primary/10 font-medium'
                  )}
                  onClick={() => setUserLocale(loc)}
               >
                  <Image
                     src={localeMap[loc].flagSrc}
                     alt={localeMap[loc].name}
                     width={24}
                     height={24}
                     className='rounded-full h-6 w-6 flex-shrink-0'
                  />
                  <span>{t(loc)}</span>
                  {locale === loc && <Check size={16} className='ml-auto text-primary' />}
               </DropdownMenuItem>
            ))}
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
