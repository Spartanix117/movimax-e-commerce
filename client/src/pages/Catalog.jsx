import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'
import CategoryFilter from '../components/CategoryFilter.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { getProducts } from '../services/api.js'

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    getProducts()
      .then((data) => {
        if (active) setProducts(data.products ?? data)
      })
      .catch(() => {
        if (active) setError('No se pudo conectar con el servidor del catálogo.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))],
    [products],
  )

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category ? product.category === category : true
      const matchesSearch = search
        ? product.name.toLowerCase().includes(search.toLowerCase())
        : true
      return matchesCategory && matchesSearch
    })
  }, [products, category, search])

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-bold text-slate-900">Catálogo de productos</h1>
        <p className="mt-2 text-sm text-slate-600">
          Explora nuestro inventario de comunicación y accesorios disponible al por
          menor y mayoreo.
        </p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </div>

      {loading && (
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          {error} Verifica que el servidor backend esté corriendo en{' '}
          <code className="rounded bg-amber-100 px-1">http://localhost:4000</code>.
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <p className="mt-8 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-600">
          No encontramos productos que coincidan con tu búsqueda.
        </p>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
