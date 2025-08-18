import { InputNumber, InputNumberProps } from '@/components/input-number'
import { useState } from 'react'
interface Props extends InputNumberProps {
   max?: number
   onIncrease?: (value: number) => void
   onDecrease?: (value: number) => void
   onType?: (value: number) => void
   onFocusOut?: (value: number) => void
   classNameWrapper?: string
   disabledButtons?: boolean
}
export default function QuantityController({
   max,
   onIncrease,
   onDecrease,
   onType,
   classNameWrapper,
   value,
   disabledButtons,
   onFocusOut,
   ...rest
}: Props) {
   const [localValue, setLocalValue] = useState<number>(Number(value || 1))

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let _value = Number(e.target.value)
      if (max !== undefined && _value > max) {
         _value = max
      } else if (_value < 1) {
         _value = 1
      }
      if (max !== undefined && _value <= max && _value >= 1) {
         onType?.(_value)
         setLocalValue(_value)
      }
   }

   const increase = () => {
      let _value = Number(value || localValue) + 1
      if (max !== undefined && _value > max) {
         _value = max
      } else if (max !== undefined && _value <= max) {
         onIncrease?.(_value)
         setLocalValue(_value)
      }
   }

   const decrease = () => {
      let _value = Number(value || localValue) - 1
      if (_value < 1) {
         _value = 1
      } else if (_value >= 1) {
         onDecrease?.(_value)
         setLocalValue(_value)
      }
   }

   const handleBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
      onFocusOut?.(Number(e.target.value))
   }

   return (
      <div className={`flex text-base ${classNameWrapper}`}>
         <button
            disabled={disabledButtons}
            onClick={decrease}
            className='flex h-8 w-8 items-center justify-center rounded-l-sm border border-gray-300 text-gray-600 dark:text-white disabled:bg-gray-50'
         >
            <svg
               xmlns='http://www.w3.org/2000/svg'
               fill='none'
               viewBox='0 0 24 24'
               strokeWidth='1.5'
               stroke='currentColor'
               className='h-4 w-4'
            >
               <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 12h-15' />
            </svg>
         </button>

         <InputNumber
            className=''
            classNameInput='h-8 w-14 border-b border-t border-gray-300 dark:bg-slate-800 dark:text-white p-1 text-center outline-none text-sm'
            classNameError='hidden'
            onChange={handleChange}
            value={value || localValue}
            onBlur={handleBlur}
            {...rest}
         />

         <button
            disabled={disabledButtons}
            onClick={increase}
            className='flex h-8 w-8 items-center justify-center rounded-r-sm border border-gray-300 text-gray-600 dark:text-white disabled:bg-gray-50'
         >
            <svg
               xmlns='http://www.w3.org/2000/svg'
               fill='none'
               viewBox='0 0 24 24'
               strokeWidth='1.5'
               stroke='currentColor'
               className='h-4 w-4'
            >
               <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
            </svg>
         </button>
      </div>
   )
}
