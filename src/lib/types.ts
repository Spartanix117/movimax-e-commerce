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
}

export type ProductWithCategory = Product & { category: Category }