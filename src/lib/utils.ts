import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs))
}
export const formatCurrency = (number: number) => {
   return number?.toLocaleString() + 'đ'
}
export const formatNumberToK = (number: number) => {
   if (number < 1000) return number
   return `${(number / 1000).toFixed(1)}k`
}
//xoá các kí tự đặc biệt
const removeSpecialCharacter = (str: string) =>
   // eslint-disable-next-line no-useless-escape
   str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, '')

export const generateNameId = ({ name, id }: { name: string; id: number }) => {
   return `${removeSpecialCharacter(name).replace(/\s/g, '-')}-i-${id}` // /\s/g là dấu cách
}
//lấy ra id từ url trên(generateNameId)
export const getIdFromNameId = (nameId: string) => {
   const arr = nameId.split('-i-')
   return arr[1]
}
export function decodeHTML(str: string) {
   const txt = document.createElement('textarea')
   txt.innerHTML = str
   return txt.value
}
export function formatShortCurrency(value: number) {
   if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
   if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
   if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
   return value
}
