export default function Footer() {
  return (
    <footer id="contacto" className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                M
              </span>
              <span className="text-base font-semibold text-slate-900">Movimax</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Comercio al por menor y mayoreo de comunicación y accesorios.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Enlaces</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <a href="/" className="hover:text-brand-600">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/catalogo" className="hover:text-brand-600">
                  Catálogo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Contacto</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>WhatsApp: +52 000 000 0000</li>
              <li>correo@movimax.com</li>
            </ul>
          </div>
        </div>

        <p className="mt-8 border-t border-slate-200 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Movimax. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
