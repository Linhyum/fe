'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
   Pagination,
   PaginationContent,
   PaginationEllipsis,
   PaginationItem,
   PaginationLink,
   PaginationNext,
   PaginationPrevious
} from '@/components/ui/pagination'

interface Props {
   totalPages: number
   currentPage: number
   handlePageClick: (e: { selected: number }) => void
   setCurrentPage: React.Dispatch<React.SetStateAction<number>>
}

export default function Paginate({ currentPage, totalPages, handlePageClick, setCurrentPage }: Props) {
   const goToPage = (page: number) => {
      setCurrentPage(page)
      handlePageClick({ selected: page - 1 })
   }

   const generatePageNumbers = () => {
      const delta = 2
      const range: number[] = []

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
         range.push(i)
      }

      if (currentPage - delta > 2) range.unshift(-1) // leading ellipsis
      if (currentPage + delta < totalPages - 1) range.push(-2) // trailing ellipsis

      return [1, ...range, totalPages].filter((page, index, self) => self.indexOf(page) === index)
   }

   return (
      <Pagination>
         <PaginationContent className='flex items-center gap-2'>
            <PaginationItem>
               <PaginationPrevious
                  onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
               >
                  <ChevronLeft className='h-4 w-4' />
               </PaginationPrevious>
            </PaginationItem>

            {generatePageNumbers().map((page, idx) => (
               <PaginationItem key={idx}>
                  {page === -1 || page === -2 ? (
                     <PaginationEllipsis />
                  ) : (
                     <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => goToPage(page)}
                        className={
                           page === currentPage
                              ? 'bg-secondaryColor text-white hover:bg-secondaryColor/80'
                              : 'cursor-pointer'
                        }
                     >
                        {page}
                     </PaginationLink>
                  )}
               </PaginationItem>
            ))}

            <PaginationItem>
               <PaginationNext
                  onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
               >
                  <ChevronRight className='h-4 w-4' />
               </PaginationNext>
            </PaginationItem>
         </PaginationContent>
      </Pagination>
   )
}
