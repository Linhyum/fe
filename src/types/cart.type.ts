export interface Cart {
   id: number
   userId: number
   createAt: string
   items: CartItem[]
   totalPrice: number
   totalItems: number
   selectedTotalPrice?: number
   selectedTotalItems?: number
}

export interface CartItem {
   id: number
   productId: number
   productName: string
   productImage: string
   quantity: number
   price: number
   totalPrice: number
   createAt: string
   stock: number
   selected: boolean
   originalPrice: number
}
