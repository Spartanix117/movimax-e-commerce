import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase'
import type { Category, Product, ProductWithCategory } from './types'

export async function getCategories(): Promise<Category[]> {
    const snapshot = await getDocs(collection(db, 'categories'))
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }))
}

async function getCategoriesById(): Promise<Record<string, Category>> {
    const categories = await getCategories()
    return Object.fromEntries(categories.map((c) => [c.id, c]))
}

function attachCategory(product: Product, categoriesById: Record<string, Category>): ProductWithCategory {
    return { ...product, category: categoriesById[product.categoryId] }
}

export async function getAllProductsBySlug(slug: string): Promise<ProductWithCategory[]> {
    const categoriesById = await getCategoriesById()
    const category = Object.values(categoriesById).find((c) => c.slug === slug)
    if (!category) return []

    const q = query(collection(db, 'products'), where('categoryId', '==', category.id))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) =>
        attachCategory({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }, categoriesById)
    )
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
    const q = query(collection(db, 'products'), where('slug', '==', slug))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null

    const categoriesById = await getCategoriesById()
    const docSnap = snapshot.docs[0]
    return attachCategory({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) }, categoriesById)
}
