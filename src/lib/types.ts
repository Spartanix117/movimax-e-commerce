export type Category = {
  id: string
  slug: string
  name: string
  comingSoon?: boolean
}

export type Product = {
    id: string
    name: string
    slug: string
    description: string
    spec: string
    priceCents: number
    stock: number
    categoryId: string
    isActive?: boolean
    imageUrl?: string
}

export type ProductWithCategory = Product & { category: Category }

export type OrderItem = {
    productId: string
    name: string
    priceCents: number
    quantity: number
}

// Only set once status is "paid" — an order that hasn't been paid for yet
// has nothing to prepare or ship.
export type FulfillmentStatus = "preparando" | "enviado" | "entregado"

export type Order = {
    id: string
    status: "pending" | "paid" | "failed"
    provider: string
    totalCents: number
    items: OrderItem[]
    paymentMethod?: string
    fulfillmentStatus?: FulfillmentStatus
    trackingCarrier?: string
    trackingNumber?: string
}