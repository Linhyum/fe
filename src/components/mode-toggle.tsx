'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export function ModeToggle() {
   const { setTheme, theme } = useTheme()
   const [mounted, setMounted] = React.useState(false)

   React.useEffect(() => {
      setMounted(true)
   }, [])

   if (!mounted) return null // Đảm bảo chỉ render khi đã mounted

   return (
      <button className='text-white' onClick={() => (theme === 'light' ? setTheme('dark') : setTheme('light'))}>
         {theme === 'light' ? <Moon size={20} strokeWidth={1.5} /> : <Sun size={20} strokeWidth={1.5} />}
      </button>
   )
}
