import { Link } from 'react-router-dom'

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

export default function ProductCard({ product }) {
  const { _id, name, price, images, category, stock } = product
  const image = images?.[0]

  return (
    <Link
      to={`/productos/${_id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {category && (
          <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
            {category}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-slate-900">
            {currencyFormatter.format(price)}
          </span>
          {stock === 0 ? (
            <span className="text-xs font-medium text-red-500">Agotado</span>
          ) : (
            <span className="text-xs font-medium text-emerald-600">Disponible</span>
          )}
        </div>
      </div>
    </Link>
  )
}
