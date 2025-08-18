import ProductDetail from '@/app/(user)/[id]/product-detail'
import { getIdFromNameId } from '@/lib/utils'
import { ProductType } from '@/types/product.type'
import { ResponseData } from '@/types/utils.type'
import { Metadata } from 'next'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
   const id = (await params).id
   return <ProductDetail id={id} />
}
