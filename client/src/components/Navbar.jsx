import { Link, NavLink } from 'react-router-dom'

const linkClasses = ({ isActive }) =>
  `text-sm font-medium transition-colors hover:text-brand-600 ${
    isActive ? 'text-brand-600' : 'text-slate-600'
  }`

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
            M
          </span>
          <span className="text-lg font-semibold text-slate-900">Movimax</span>
        </Link>

        <div className="hidden items-center gap-8 sm:flex">
          <NavLink to="/" className={linkClasses} end>
            Inicio
          </NavLink>
          <NavLink to="/catalogo" className={linkClasses}>
            Catálogo
          </NavLink>
          <a href="#contacto" className="text-sm font-medium text-slate-600 hover:text-brand-600">
            Contacto
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            title="Próximamente: inicio de sesión de usuarios"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
            disabled
          >
            Ingresar
          </button>
          <Link
            to="/catalogo"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            Ver catálogo
          </Link>
        </div>
      </nav>
    </header>
  )
}
