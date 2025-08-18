'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
   isPassword?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, isPassword, ...props }, ref) => {
   const [showPassword, setShowPassword] = React.useState(false)

   const handleTogglePassword = () => {
      setShowPassword((prev) => !prev)
   }

   return (
      <div className='relative w-full'>
         <input
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
               'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50',
               className
            )}
            ref={ref}
            {...props}
         />

         {isPassword && (
            <button
               type='button'
               onClick={handleTogglePassword}
               className='absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground'
               tabIndex={-1}
            >
               {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
            </button>
         )}
      </div>
   )
})
Input.displayName = 'Input'

export { Input }
