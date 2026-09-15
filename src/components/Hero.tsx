import Link from "next/link";
import { BoltIcon, WhatsAppIcon } from "@/components/icons";
import { STORE_TAGLINE, STORE_WHATSAPP } from "@/lib/constants";

export function Hero() {
  return (
    <section className="border-b border-line py-11 sm:py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
            {STORE_TAGLINE}
          </span>
          <h1 className="mt-2.5 text-balance font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Muévete por la ciudad, <em className="not-italic text-accent">sobre ruedas eléctricas</em>.
          </h1>
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-muted">
            Patines y bicicletas eléctricas, cascos y repuestos — con envío a toda la República
            y atención directa por WhatsApp.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-gold-ink transition hover:brightness-105"
            >
              Ver catálogo
            </Link>
            <a
              href={`https://wa.me/${STORE_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-line px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-ink-muted"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Pedir por WhatsApp
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[18px] bg-brand p-7 text-white shadow-xl">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#C6B6E8]">
            Cobertura Movimax
          </span>
          <BoltIcon className="my-5 h-[100px] w-[84px] drop-shadow-[0_10px_18px_rgba(0,0,0,0.3)]" />
          <h2 className="font-display text-3xl font-bold leading-none">
            Movilidad eléctrica,
            <br />a tu alcance.
          </h2>
          <p className="mt-2 text-sm text-[#D2C4EC]">
            Patines, bicicletas y repuestos listos para enviarse hoy.
          </p>
        </div>
      </div>
    </section>
  );
}
