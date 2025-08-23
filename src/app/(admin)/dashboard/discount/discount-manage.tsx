// app/(admin)/discounts/DiscountManage.tsx
'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { Edit, Plus, Search, X } from 'lucide-react'
import { toast } from 'react-toastify'

// UI
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// App
import Paginate from '@/components/paginate'
import { decodeHTML } from '@/lib/utils'
import type {
   CreateDiscountType,
   DiscountType,
   GetDiscountQueryParamsType,
   UpdateDiscountType
} from '@/types/admin.type'
import {
   useAssignDiscountToCategories,
   useAssignDiscountToProducts,
   useCreateDiscount,
   useDeleteDiscountToCategories,
   useDeleteDiscountToProducts,
   useEditPriceDiscountToProducts,
   useGetAllAdminProduct,
   useGetAllCategories,
   useGetAllDiscount,
   useUpdateDiscount
} from '@/queries/useAdmin'

/**
 * Refactor goals
 * - Remove duplication between Add/Edit forms via <DiscountDialog />
 * - Co-locate derived logic (recalc discounted prices, validation, formdata)
 * - Debounced searching for products/categories
 * - Memoized selectors + small pure helpers
 * - Fewer re-renders by lifting small handlers into useCallback
 */

// ------------------------------- Helpers ----------------------------------
const viDate = (dt?: string) => {
   if (!dt) return ''
   const d = new Date(dt)
   return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
   })
}

const pct = (v: number) => `${v}%`

const fmtServerDate = (v: string) => format(new Date(v), 'yyyy-MM-dd HH:mm:ss')

const emptyCreate: CreateDiscountType = {
   name: '',
   type: 'PRODUCT',
   value: 0,
   startDate: '',
   endDate: '',
   isActive: true,
   productIds: [],
   discountedPrices: {},
   categoryIds: [],
   bannerUrl: ''
}

// Guard to avoid accidental NaN
const toNum = (v: string) => (v === '' ? 0 : Number(v))

// ------------------------------- Hooks -------------------------------------
function usePageQuery(initial: Partial<GetDiscountQueryParamsType> = {}) {
   const [currentPage, setCurrentPage] = useState(1)
   const [query, setQuery] = useState<GetDiscountQueryParamsType>({
      page: 0,
      size: 10,
      sortBy: 'id',
      sortDir: 'desc',
      search: '',
      ...initial
   })

   useEffect(() => {
      setQuery((p) => ({ ...p, page: currentPage - 1 }))
   }, [currentPage])

   const setSort = useCallback((value: string) => {
      const [sortBy, sortDir] = value.split('-') as [string, 'asc' | 'desc']
      setCurrentPage(1)
      setQuery((p) => ({ ...p, page: 0, sortBy, sortDir }))
   }, [])

   const setSize = useCallback((size: number) => {
      setCurrentPage(1)
      setQuery((p) => ({ ...p, page: 0, size }))
   }, [])

   const setSearch = useCallback((search: string) => {
      setCurrentPage(1)
      setQuery((p) => ({ ...p, page: 0, search }))
   }, [])

   return { currentPage, setCurrentPage, query, setSort, setSize, setSearch }
}

function useDebounced<T>(value: T, delay = 400) {
   const [v, setV] = useState(value)
   useEffect(() => {
      const t = setTimeout(() => setV(value), delay)
      return () => clearTimeout(t)
   }, [value, delay])
   return v
}

// ---------------------------- Reusable bits --------------------------------
function BannerPicker({
   preview,
   onFile,
   onClear
}: {
   preview?: string | null
   onFile: (f: File) => void
   onClear: () => void
}) {
   return (
      <div className='grid gap-2'>
         <Label htmlFor='banner'>Banner (tùy chọn)</Label>
         <div className='space-y-2'>
            <Input
               id='banner'
               type='file'
               accept='image/*'
               className='cursor-pointer'
               onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onFile(file)
               }}
            />
            {preview && (
               <div className='relative inline-block'>
                  <Image
                     src={preview || '/placeholder.svg'}
                     alt='Banner preview'
                     width={200}
                     height={120}
                     className='rounded border object-cover'
                  />
                  <Button
                     type='button'
                     variant='destructive'
                     size='icon'
                     className='absolute -top-2 -right-2 h-6 w-6'
                     onClick={onClear}
                  >
                     <X className='h-4 w-4' />
                  </Button>
               </div>
            )}
         </div>
      </div>
   )
}

type Product = { id: number; name: string; price: number; image?: string }

type ProductPickerProps = {
   selected: number[]
   setSelected: (ids: number[], discountedPricesUpdate?: Record<number, number>) => void
   pctValue: number
   search: string
   onSearch: (v: string) => void
}

function ProductPicker({ selected, setSelected, pctValue, search, onSearch }: ProductPickerProps) {
   const debounced = useDebounced(search)
   const getAllAdminProduct = useGetAllAdminProduct({ search: debounced })
   const products: Product[] = getAllAdminProduct.data?.data.data.content || []

   const onToggle = useCallback(
      (p: Product, checked: boolean) => {
         if (checked) {
            const autoPrice = Math.round(p.price * (1 - pctValue / 100))
            setSelected([...selected, p.id], { [p.id]: autoPrice })
         } else {
            setSelected(
               selected.filter((id) => id !== p.id),
               { [p.id]: 0 }
            )
         }
      },
      [pctValue, selected, setSelected]
   )

   return (
      <div className='grid gap-2'>
         <Label>Chọn sản phẩm áp dụng</Label>
         <Input
            placeholder='Tìm kiếm sản phẩm...'
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className='w-full'
         />
         <div className='border rounded-md p-2 max-h-40 overflow-y-auto space-y-2'>
            {getAllAdminProduct.isLoading ? (
               <div className='text-sm text-muted-foreground'>Đang tải...</div>
            ) : products.length === 0 ? (
               <div className='text-sm text-muted-foreground'>Không tìm thấy sản phẩm</div>
            ) : (
               products.map((p) => {
                  const isSelected = selected.includes(p.id)
                  const discountedPrice = Math.round(p.price * (1 - pctValue / 100))
                  return (
                     <div key={p.id} className='flex items-center space-x-2 p-2 hover:bg-primary-foreground rounded'>
                        <input
                           type='checkbox'
                           className='rounded'
                           id={`product-${p.id}`}
                           checked={isSelected}
                           onChange={(e) => onToggle(p, e.target.checked)}
                        />
                        <label htmlFor={`product-${p.id}`} className='flex-1 cursor-pointer'>
                           <div className='flex gap-1 items-center'>
                              <Image
                                 src={p.image || '/placeholder.svg'}
                                 alt=''
                                 width={50}
                                 height={50}
                                 className='rounded w-10 h-10'
                              />
                              <div>
                                 <div title={decodeHTML(p.name)} className='font-medium text-sm max-w-[450px] truncate'>
                                    {decodeHTML(p.name)}
                                 </div>
                                 <div className='text-xs text-muted-foreground'>
                                    Giá gốc: {p.price?.toLocaleString('vi-VN')}đ
                                 </div>
                              </div>
                              {isSelected && (
                                 <div className='text-xs text-green-600 font-medium'>
                                    Giá sau giảm: {discountedPrice.toLocaleString('vi-VN')}đ
                                 </div>
                              )}
                           </div>
                        </label>
                     </div>
                  )
               })
            )}
         </div>
         <div className='text-xs text-muted-foreground'>Đã chọn: {selected.length} sản phẩm</div>
      </div>
   )
}

type Category = { id: number; categoryName: string; status?: boolean }

type CategoryPickerProps = {
   selected: number[]
   setSelected: (ids: number[]) => void
   search: string
   onSearch: (v: string) => void
}

function CategoryPicker({ selected, setSelected, search, onSearch }: CategoryPickerProps) {
   const debounced = useDebounced(search)
   const getAllCategories = useGetAllCategories({ search: debounced })
   const categories: Category[] = (getAllCategories.data?.data.data.content || []).filter((c) => c.status)

   const toggle = useCallback(
      (c: Category, checked: boolean) => {
         setSelected(checked ? [...selected, c.id] : selected.filter((id) => id !== c.id))
      },
      [selected, setSelected]
   )

   return (
      <div className='grid gap-2'>
         <Label>Chọn danh mục áp dụng</Label>
         <Input
            placeholder='Tìm kiếm danh mục...'
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className='w-full'
         />
         <div className='border rounded-md p-2 max-h-40 overflow-y-auto space-y-2'>
            {getAllCategories.isLoading ? (
               <div className='text-sm text-muted-foreground'>Đang tải...</div>
            ) : categories.length === 0 ? (
               <div className='text-sm text-muted-foreground'>Không tìm thấy danh mục</div>
            ) : (
               categories.map((c) => {
                  const isSelected = selected.includes(c.id)
                  return (
                     <div key={c.id} className='flex items-center space-x-2 p-2 hover:bg-primary-foreground rounded'>
                        <input
                           type='checkbox'
                           className='rounded'
                           id={`category-${c.id}`}
                           checked={isSelected}
                           onChange={(e) => toggle(c, e.target.checked)}
                        />
                        <label htmlFor={`category-${c.id}`} className='flex-1 cursor-pointer'>
                           <div className='font-medium text-sm'>{c.categoryName}</div>
                        </label>
                     </div>
                  )
               })
            )}
         </div>
         <div className='text-xs text-muted-foreground'>Đã chọn: {selected.length} danh mục</div>
      </div>
   )
}

// ----------------------------- Dialog Form ---------------------------------

type Mode = 'create' | 'edit'

type DiscountDialogProps = {
   mode: Mode
   open: boolean
   onOpenChange: (v: boolean) => void
   base?: DiscountType | null
   afterSubmit?: () => void
   allDiscounts?: DiscountType[]
}

function DiscountDialog({ mode, open, onOpenChange, base, afterSubmit, allDiscounts = [] }: DiscountDialogProps) {
   const isEdit = mode === 'edit'

   const [form, setForm] = useState<CreateDiscountType | UpdateDiscountType>(
      isEdit && base
         ? {
              id: base.id,
              name: base.name || `Discount ${base.id}`,
              type: base.type || 'PRODUCT',
              value: base.value,
              startDate: base.startDate,
              endDate: base.endDate,
              isActive: base.isActive,
              productIds: base.productIds || [],
              discountedPrices: base.discountedPrices || {},
              categoryIds: base.categoryIds || [],
              bannerUrl: base.bannerUrl
           }
         : emptyCreate
   )

   useEffect(() => {
      if (!open) return
      setForm(
         isEdit && base
            ? {
                 id: base.id,
                 name: base.name || `Discount ${base.id}`,
                 type: base.type || 'PRODUCT',
                 value: base.value,
                 startDate: base.startDate,
                 endDate: base.endDate,
                 isActive: base.isActive,
                 productIds: base.productIds || [],
                 discountedPrices: base.discountedPrices || {},
                 categoryIds: base.categoryIds || [],
                 bannerUrl: base.bannerUrl
              }
            : emptyCreate
      )
   }, [open, isEdit, base])

   // banner
   const [bannerFile, setBannerFile] = useState<File | null>(null)
   const [bannerPreview, setBannerPreview] = useState<string | null>(null)
   const fileToPreview = useCallback((file: File) => {
      const r = new FileReader()
      r.onload = (e) => setBannerPreview(e.target?.result as string)
      r.readAsDataURL(file)
   }, [])

   const onBanner = useCallback(
      (f: File) => {
         setBannerFile(f)
         fileToPreview(f)
      },
      [fileToPreview]
   )
   const clearBanner = useCallback(() => {
      setBannerFile(null)
      setBannerPreview(null)
   }, [])

   // api hooks
   const createDiscount = useCreateDiscount()
   const updateDiscount = useUpdateDiscount()
   const assignDiscountToProducts = useAssignDiscountToProducts()
   const assignDiscountToCategories = useAssignDiscountToCategories()
   const deleteDiscountToProducts = useDeleteDiscountToProducts()
   const deleteDiscountToCategories = useDeleteDiscountToCategories()
   const editPriceDiscountToProducts = useEditPriceDiscountToProducts()

   // derived
   const pctValue = form.value > 0 ? form.value : 0

   // recalc only when necessary; preserves user-entered custom prices
   useEffect(() => {
      if (form.type !== 'PRODUCT' || pctValue <= 0 || !('productIds' in form)) return
      if (!form.productIds?.length) return

      setForm((prev) => {
         if (!prev || prev.type !== 'PRODUCT') return prev
         const nextPrices = { ...(prev.discountedPrices || {}) }
         // why: don't overwrite when user set a custom price (non-zero existing)
         for (const pid of prev?.productIds!) {
            if (!nextPrices[pid]) nextPrices[pid] = nextPrices[pid] || 0
         }
         return { ...prev, discountedPrices: nextPrices }
      })
   }, [pctValue, form.type, (form as any).productIds?.join(',')])

   const validate = (): string | null => {
      if (!form.name?.trim()) return 'Tên mã giảm giá không được để trống'
      if (form.value <= 0) return 'Giá trị giảm giá phải lớn hơn 0'
      if (!form.startDate || !form.endDate) return 'Vui lòng chọn ngày giờ bắt đầu và kết thúc'
      if (new Date(form.startDate) >= new Date(form.endDate)) return 'Ngày giờ bắt đầu phải nhỏ hơn ngày giờ kết thúc'
      if (form.type === 'PRODUCT' && (form as CreateDiscountType).productIds?.length === 0)
         return 'Vui lòng chọn ít nhất một sản phẩm'
      if (form.type === 'CATEGORY' && (form as CreateDiscountType).categoryIds?.length === 0)
         return 'Vui lòng chọn ít nhất một danh mục'
      return null
   }

   const buildFormData = (d: CreateDiscountType | UpdateDiscountType) => {
      const fd = new FormData()
      const discountPayload: any = {
         ...(isEdit ? { id: (d as UpdateDiscountType).id } : {}),
         name: d.name,
         type: d.type,
         value: d.value,
         startDate: fmtServerDate(d.startDate),
         endDate: fmtServerDate(d.endDate),
         isActive: d.isActive,
         discountedPrices: d.discountedPrices,
         ...(d.type === 'PRODUCT' ? { productIds: (d as CreateDiscountType).productIds } : {}),
         ...(d.type === 'CATEGORY' ? { categoryIds: (d as CreateDiscountType).categoryIds } : {}),
         ...(isEdit ? { bannerUrl: (d as UpdateDiscountType).bannerUrl } : {})
      }
      fd.append('discount', new Blob([JSON.stringify(discountPayload)], { type: 'application/json' }))
      if (bannerFile) fd.append('banner', bannerFile)
      return fd
   }

   const onSubmit = async () => {
      const err = validate()
      if (err) return toast.error(err)

      try {
         if (!isEdit) {
            await createDiscount.mutateAsync(buildFormData(form))
            onOpenChange(false)
            afterSubmit?.()
            return
         }

         const editing = form as UpdateDiscountType
         await updateDiscount.mutateAsync({ id: editing.id, formData: buildFormData(editing) })

         const original = allDiscounts.find((d) => d.id === editing.id)
         if (editing.type === 'PRODUCT') {
            const prevIds = original?.productIds || []
            const nextIds = editing.productIds || []
            const toAdd = nextIds.filter((id) => !prevIds.includes(id))
            const toRemove = prevIds.filter((id: any) => !nextIds.includes(id))

            if (toAdd.length) {
               await assignDiscountToProducts.mutateAsync({
                  discountId: editing.id,
                  productIds: toAdd,
                  discountedPrices: Object.fromEntries(toAdd.map((id) => [id, editing.discountedPrices?.[id] || 0]))
               })
            }
            if (toRemove.length) {
               await deleteDiscountToProducts.mutateAsync({ discountId: editing.id, productIds: toRemove })
            }
            const productPrices = editing.discountedPrices || {}
            if (Object.keys(productPrices).length) {
               await editPriceDiscountToProducts.mutateAsync({ discountId: editing.id, productPrices })
            }
         } else {
            const prevIds = original?.categoryIds || []
            const nextIds = editing.categoryIds || []
            const toAdd = nextIds.filter((id) => !prevIds.includes(id))
            const toRemove = prevIds.filter((id: any) => !nextIds.includes(id))
            if (toAdd.length)
               await assignDiscountToCategories.mutateAsync({ discountId: editing.id, categoryIds: toAdd })
            if (toRemove.length)
               await deleteDiscountToCategories.mutateAsync({ discountId: editing.id, categoryIds: toRemove })
         }

         toast.success('Cập nhật mã giảm giá thành công!')
         onOpenChange(false)
         afterSubmit?.()
      } catch (e) {
         toast.error('Có lỗi xảy ra khi xử lý mã giảm giá')
         console.error(e)
      }
   }

   const pending =
      createDiscount.isPending ||
      updateDiscount.isPending ||
      assignDiscountToProducts.isPending ||
      assignDiscountToCategories.isPending ||
      deleteDiscountToProducts.isPending ||
      deleteDiscountToCategories.isPending ||
      editPriceDiscountToProducts.isPending

   // product/category search local state
   const [productSearch, setProductSearch] = useState('')
   const [categorySearch, setCategorySearch] = useState('')

   // controlled setters that also sync discountedPrices
   const setProducts = useCallback((ids: number[], pricePatch?: Record<number, number>) => {
      setForm((prev) => {
         if (!prev) return prev as any
         const discountedPrices = { ...(prev.discountedPrices || {}) }
         if (pricePatch) {
            for (const [k, v] of Object.entries(pricePatch)) {
               const id = Number(k)
               if (v === 0) delete discountedPrices[id]
               else discountedPrices[id] = v
            }
         }
         return { ...prev, productIds: ids, discountedPrices }
      })
   }, [])

   const setCategories = useCallback((ids: number[]) => setForm((prev) => ({ ...(prev as any), categoryIds: ids })), [])

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
               <DialogTitle>{isEdit ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}</DialogTitle>
            </DialogHeader>

            <div className='grid gap-4 py-4'>
               <div className='grid gap-2'>
                  <Label htmlFor='name'>Tên mã giảm giá</Label>
                  <Input
                     id='name'
                     value={form.name}
                     onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                     placeholder='Nhập tên mã giảm giá'
                  />
               </div>

               <BannerPicker
                  preview={bannerPreview || (isEdit ? (form as UpdateDiscountType).bannerUrl || null : null)}
                  onFile={onBanner}
                  onClear={clearBanner}
               />

               <div className='grid gap-2'>
                  <Label htmlFor='type'>Loại áp dụng</Label>
                  <Select
                     value={form.type}
                     onValueChange={(v) =>
                        setForm((p) => ({
                           ...p,
                           type: v as 'PRODUCT' | 'CATEGORY',
                           productIds: [],
                           categoryIds: [],
                           discountedPrices: {}
                        }))
                     }
                  >
                     <SelectTrigger>
                        <SelectValue placeholder='Chọn loại áp dụng' />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value='PRODUCT'>Sản phẩm</SelectItem>
                        <SelectItem value='CATEGORY'>Danh mục</SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               <div className='grid gap-2'>
                  <Label htmlFor='value'>Giá trị (%)</Label>
                  <Input
                     id='value'
                     type='number'
                     min='0'
                     max='100'
                     value={form.value}
                     onChange={(e) => setForm((p) => ({ ...p, value: toNum(e.target.value) }))}
                     placeholder='Nhập giá trị phần trăm'
                  />
               </div>

               {form.type === 'PRODUCT' ? (
                  <ProductPicker
                     selected={(form as any).productIds || []}
                     setSelected={setProducts}
                     pctValue={pctValue}
                     search={productSearch}
                     onSearch={setProductSearch}
                  />
               ) : (
                  <CategoryPicker
                     selected={(form as any).categoryIds || []}
                     setSelected={setCategories}
                     search={categorySearch}
                     onSearch={setCategorySearch}
                  />
               )}

               <div className='grid grid-cols-1 gap-4'>
                  <div className='grid gap-2'>
                     <Label htmlFor='startDate'>Ngày giờ bắt đầu</Label>
                     <Input
                        id='startDate'
                        type='datetime-local'
                        value={form.startDate}
                        onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                     />
                  </div>
                  <div className='grid gap-2'>
                     <Label htmlFor='endDate'>Ngày giờ kết thúc</Label>
                     <Input
                        id='endDate'
                        type='datetime-local'
                        value={form.endDate}
                        onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                     />
                  </div>
               </div>

               <div className='flex items-center space-x-2'>
                  <Switch
                     id='isActive'
                     checked={form.isActive}
                     onCheckedChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
                  />
                  <Label htmlFor='isActive'>{isEdit ? 'Kích hoạt' : 'Kích hoạt ngay'}</Label>
               </div>
            </div>

            <DialogFooter>
               <Button variant='outline' onClick={() => onOpenChange(false)}>
                  Hủy
               </Button>
               <Button onClick={onSubmit} disabled={pending}>
                  {pending ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm mã giảm giá'}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   )
}

// ------------------------------- Main --------------------------------------
export default function DiscountManage() {
   const { currentPage, setCurrentPage, query, setSort, setSize, setSearch } = usePageQuery()
   const [searchTerm, setSearchTerm] = useState('')
   const debouncedTerm = useDebounced(searchTerm)

   useEffect(() => {
      setSearch(debouncedTerm.trim())
   }, [debouncedTerm, setSearch])

   const getAllDiscount = useGetAllDiscount(query)
   const discounts: DiscountType[] = getAllDiscount.data?.data.data.content || []
   const totalPages = getAllDiscount.data?.data.data.totalPages || 0

   const [addOpen, setAddOpen] = useState(false)
   const [editOpen, setEditOpen] = useState(false)
   const [selectedEdit, setSelectedEdit] = useState<DiscountType | null>(null)

   const openEdit = useCallback((d: DiscountType) => {
      setSelectedEdit(d)
      setEditOpen(true)
   }, [])

   const refreshList = useCallback(() => {
      getAllDiscount.refetch?.()
   }, [getAllDiscount])

   const sortValue = `${query.sortBy}-${query.sortDir}`

   return (
      <div className='container mx-auto p-6'>
         <div className='flex items-center justify-between flex-wrap gap-3'>
            <h1 className='text-2xl font-bold'>Quản lý mã giảm giá</h1>
            <Button onClick={() => setAddOpen(true)}>
               <Plus className='mr-2 h-4 w-4' /> Thêm mã giảm giá
            </Button>
         </div>

         <div className='flex items-center flex-wrap gap-4 my-5'>
            <div className='flex items-center gap-2'>
               <Input
                  placeholder='Tìm kiếm mã giảm giá...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='sm:w-[250px]'
               />
               <Button
                  className='h-10 w-10 flex-shrink-0'
                  size='icon'
                  variant='outline'
                  onClick={() => setSearch(searchTerm.trim())}
               >
                  <Search />
               </Button>
               {query.search && (
                  <Button
                     variant='ghost'
                     size='sm'
                     onClick={() => {
                        setSearchTerm('')
                        setSearch('')
                     }}
                  >
                     Xóa
                  </Button>
               )}
            </div>
            <div className='flex items-center gap-2'>
               <span className='text-sm'>Hiển thị:</span>
               <Select value={String(query.size ?? 10)} onValueChange={(v) => setSize(Number(v))}>
                  <SelectTrigger className='w-[80px]'>
                     <SelectValue placeholder='10' />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value='5'>5</SelectItem>
                     <SelectItem value='10'>10</SelectItem>
                     <SelectItem value='20'>20</SelectItem>
                     <SelectItem value='50'>50</SelectItem>
                  </SelectContent>
               </Select>
            </div>
            <div className='flex items-center gap-2'>
               <span className='text-sm'>Sắp xếp:</span>
               <Select value={sortValue} onValueChange={setSort}>
                  <SelectTrigger className='w-[180px]'>
                     <SelectValue placeholder='Mới nhất' />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value='id-desc'>Mới nhất</SelectItem>
                     <SelectItem value='id-asc'>Cũ nhất</SelectItem>
                     <SelectItem value='value-desc'>Giá trị cao nhất</SelectItem>
                     <SelectItem value='value-asc'>Giá trị thấp nhất</SelectItem>
                     <SelectItem value='priority-desc'>Ưu tiên cao</SelectItem>
                     <SelectItem value='priority-asc'>Ưu tiên thấp</SelectItem>
                  </SelectContent>
               </Select>
            </div>
         </div>

         {getAllDiscount.isLoading ? (
            <div className='text-center py-4'>Đang tải...</div>
         ) : (
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className='w-[80px]'>ID</TableHead>
                     <TableHead>Tên</TableHead>
                     <TableHead>Loại</TableHead>
                     <TableHead>Giá trị</TableHead>
                     <TableHead>Banner</TableHead>
                     <TableHead>Ngày giờ bắt đầu</TableHead>
                     <TableHead>Ngày giờ kết thúc</TableHead>
                     <TableHead>Trạng thái</TableHead>
                     <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {discounts.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={9} className='text-center'>
                           Không có mã giảm giá nào
                        </TableCell>
                     </TableRow>
                  ) : (
                     discounts.map((d) => (
                        <TableRow key={d.id}>
                           <TableCell>{d.id}</TableCell>
                           <TableCell>{d.name}</TableCell>
                           <TableCell>
                              <span
                                 className={`px-2 py-1 rounded-full text-xs ${
                                    d.type === 'PRODUCT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                 }`}
                              >
                                 {d.type === 'PRODUCT' ? 'Sản phẩm' : 'Danh mục'}
                              </span>
                           </TableCell>
                           <TableCell className='font-medium'>{pct(d.value)}</TableCell>
                           <TableCell>
                              {(d.bannerUrl as any) ? (
                                 <Image
                                    src={d.bannerUrl || '/placeholder.svg'}
                                    alt='Banner'
                                    width={60}
                                    height={40}
                                    className='rounded object-cover'
                                 />
                              ) : (
                                 <span className='text-muted-foreground text-sm'>Không có</span>
                              )}
                           </TableCell>
                           <TableCell className='text-sm'>{viDate(d.startDate)}</TableCell>
                           <TableCell className='text-sm'>{viDate(d.endDate)}</TableCell>
                           <TableCell>
                              {d.isActive ? (
                                 <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                                    Hoạt động
                                 </span>
                              ) : (
                                 <span className='px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs'>
                                    Không hoạt động
                                 </span>
                              )}
                           </TableCell>
                           <TableCell className='text-right'>
                              <Button variant='outline' size='icon' className='mr-2' onClick={() => openEdit(d)}>
                                 <Edit className='h-4 w-4' />
                              </Button>
                           </TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         )}

         {totalPages > 1 && (
            <div className='mt-4 flex justify-center'>
               <Paginate
                  totalPages={totalPages}
                  handlePageClick={(e: { selected: number }) => setCurrentPage(e.selected + 1)}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
               />
            </div>
         )}

         {/* Create */}
         <DiscountDialog mode='create' open={addOpen} onOpenChange={setAddOpen} afterSubmit={refreshList} />
         {/* Edit */}
         <DiscountDialog
            mode='edit'
            open={editOpen}
            onOpenChange={setEditOpen}
            base={selectedEdit}
            afterSubmit={refreshList}
            allDiscounts={discounts}
         />
      </div>
   )
}
