import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById } from '../services/api.js'

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    getProductById(id)
      .then((data) => {
        if (active) setProduct(data)
      })
      .catch(() => {
        if (active) setError('No se pudo encontrar este producto.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">Cargando...</div>
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <p className="text-slate-600">{error ?? 'Producto no encontrado.'}</p>
        <Link to="/catalogo" className="mt-4 inline-block text-brand-600 hover:text-brand-700">
          ← Volver al catálogo
        </Link>
      </div>
    )
  }

  const image = product.images?.[0]

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link to="/catalogo" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← Volver al catálogo
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {image ? (
            <img src={image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              Sin imagen
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {product.category}
            </span>
          )}
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-slate-900">
            {currencyFormatter.format(product.price)}
          </p>
          <p className="mt-6 text-slate-600">{product.description}</p>

          <div className="mt-8 flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                product.stock > 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
            </span>
          </div>

          <a
            href="#contacto"
            className="mt-8 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Consultar disponibilidad
          </a>
        </div>
      </div>
    </section>
  )
}
