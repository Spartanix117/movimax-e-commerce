import Link from "next/link";
import { BoltIcon, WhatsAppIcon } from "@/components/icons";
import { STORE_CITY, STORE_TAGLINE, STORE_WHATSAPP } from "@/lib/constants";

export function Footer() {
  return (
    <footer id="contacto" className="bg-brand text-[#EFE7FA]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 py-11 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <BoltIcon className="h-6 w-5 shrink-0" />
            <span className="font-display text-2xl font-extrabold italic">
              <span className="text-gold">Movi</span>
              <span className="text-white">Max</span>
            </span>
          </Link>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#C6B6E8]">
            {STORE_TAGLINE}
          </p>
          <div className="mt-2.5 h-1 w-16 rounded-full bg-gold" />
          <p className="mt-3.5 max-w-[32ch] text-sm text-[#C6B6E8]">
            Movilidad eléctrica en línea. Celulares y accesorios, disponibles en tienda física.{" "}
            {STORE_CITY}.
          </p>
          <a
            href={`https://wa.me/${STORE_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-bold text-gold-ink"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            +52 33 1234 5678
          </a>
        </div>

        <div>
          <h4 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-gold">
            Movilidad eléctrica
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><Link href="/catalogo?categoria=patines-electricos" className="hover:text-gold">Patines eléctricos</Link></li>
            <li><Link href="/catalogo?categoria=bicicletas-electricas" className="hover:text-gold">Bicicletas eléctricas</Link></li>
            <li><Link href="/catalogo?categoria=cascos-y-seguridad" className="hover:text-gold">Cascos y seguridad</Link></li>
            <li><Link href="/catalogo?categoria=repuestos-y-accesorios" className="hover:text-gold">Repuestos y accesorios</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-gold">Tienda</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><Link href="/catalogo" className="hover:text-gold">Catálogo completo</Link></li>
            <li><Link href="/#" className="hover:text-gold">Rastrear pedido</Link></li>
            <li><Link href="/#" className="hover:text-gold">Garantía</Link></li>
            <li><Link href="/#" className="hover:text-gold">Preguntas frecuentes</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-gold">Horario</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li>Lun – Vie · 10:00–20:00</li>
            <li>Sábado · 10:00–17:00</li>
            <li>Domingo · Cerrado</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-white/10 px-5 py-4 text-xs text-[#C6B6E8] sm:px-8">
        <span>© {new Date().getFullYear()} Movimax. Todos los derechos reservados.</span>
        <div className="flex gap-2">
          {["IG", "FB", "TT"].map((label) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/20 font-mono text-[11px] font-semibold hover:border-gold hover:text-gold"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
