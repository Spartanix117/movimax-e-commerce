import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { getProducts } from '../services/api.js'

export default function Landing() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    getProducts({ limit: 4, featured: true })
      .then((data) => {
        if (active) setFeatured(data.products ?? data)
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar los productos destacados.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Productos destacados</h2>
            <p className="mt-1 text-sm text-slate-600">
              Una muestra de lo que encontrarás en nuestro catálogo completo.
            </p>
          </div>
          <Link to="/catalogo" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Ver todo →
          </Link>
        </div>

        {loading && (
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="mt-8 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">{error}</p>
        )}

        {!loading && !error && featured.length === 0 && (
          <p className="mt-8 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            Aún no hay productos destacados. Visita el catálogo completo para ver todo el
            inventario.
          </p>
        )}

        {!loading && !error && featured.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white">
            ¿Vendes al mayoreo? Tenemos precios especiales para ti
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Contáctanos para conocer nuestros paquetes y descuentos por volumen en
            accesorios y equipos de comunicación.
          </p>
          <a
            href="#contacto"
            className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Solicitar cotización
          </a>
        </div>
      </section>
    </>
  )
}
