export interface ResponseData<Data> {
   success: boolean
   message: string
   data: Data
   timestamp: string
}

export interface ResponseDataWithPaginate<Data> {
   content: Data
   pageable: Pageable
   last: boolean
   totalPages: number
   totalElements: number
   first: boolean
   size: number
   number: number
   sort: Sort2
   numberOfElements: number
   empty: boolean
}
export interface Pageable {
   pageNumber: number
   pageSize: number
   sort: Sort
   offset: number
   unpaged: boolean
   paged: boolean
}

export interface Sort {
   empty: boolean
   sorted: boolean
   unsorted: boolean
}

export interface Sort2 {
   empty: boolean
   sorted: boolean
   unsorted: boolean
}
