'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { vi } from 'date-fns/locale'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DatePickerProps {
   value?: Date
   onChange?: (date: Date | undefined) => void
}

export function DatePicker({ value, onChange }: DatePickerProps) {
   const [selectedMonth, setSelectedMonth] = React.useState<number>(value ? value.getMonth() : new Date().getMonth())
   const [selectedYear, setSelectedYear] = React.useState<number>(
      value ? value.getFullYear() : new Date().getFullYear()
   )

   // Tạo danh sách năm từ 1900 đến năm hiện tại
   const years = React.useMemo(() => {
      const currentYear = new Date().getFullYear()
      return Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)
   }, [])

   // Tạo danh sách tháng
   const months = React.useMemo(() => {
      return Array.from({ length: 12 }, (_, i) => ({
         value: i,
         label: format(new Date(2024, i, 1), 'MMMM', { locale: vi })
      }))
   }, [])

   const handleYearChange = (year: string) => {
      const newYear = parseInt(year)
      setSelectedYear(newYear)
      if (value) {
         const newDate = new Date(value)
         newDate.setFullYear(newYear)
         onChange?.(newDate)
      }
   }

   const handleMonthChange = (month: string) => {
      const newMonth = parseInt(month)
      setSelectedMonth(newMonth)
      if (value) {
         const newDate = new Date(value)
         newDate.setMonth(newMonth)
         onChange?.(newDate)
      }
   }

   return (
      <Popover>
         <PopoverTrigger asChild>
            <Button
               variant={'outline'}
               className={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground')}
            >
               <CalendarIcon className='mr-2 h-4 w-4' />
               {value ? format(value, 'dd/MM/yyyy', { locale: vi }) : <span>Chọn ngày</span>}
            </Button>
         </PopoverTrigger>
         <PopoverContent className='w-auto p-0' align='start'>
            <div className='flex gap-2 p-3 border-b'>
               <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
                  <SelectTrigger className='w-[140px]'>
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                           {month.label}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>

               <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className='w-[100px]'>
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                           {year}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>
            <Calendar
               mode='single'
               selected={value}
               onSelect={onChange}
               month={new Date(selectedYear, selectedMonth)}
               onMonthChange={(date) => {
                  setSelectedMonth(date.getMonth())
                  setSelectedYear(date.getFullYear())
               }}
               initialFocus
               locale={vi}
            />
         </PopoverContent>
      </Popover>
   )
}
