import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
            Mayoreo y menudeo
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Comunicación y accesorios al mejor precio
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            En Movimax encuentras celulares, accesorios y equipos de comunicación
            para tu negocio o uso personal, con la mejor relación calidad-precio.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/catalogo"
              className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Explorar catálogo
            </Link>
            <a
              href="#contacto"
              className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Contactar ventas
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Marcas', value: '+20' },
            { label: 'Productos', value: '+500' },
            { label: 'Clientes', value: '+1,000' },
            { label: 'Años de experiencia', value: '+5' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <p className="text-3xl font-bold text-brand-600">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
