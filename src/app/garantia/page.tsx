import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { STORE_WHATSAPP } from "@/lib/constants";

export default function GarantiaPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-14 sm:px-8">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
          Movimax
        </span>
        <h1 className="mt-1.5 font-display text-3xl font-extrabold">Garantía</h1>

        <div className="mt-6 flex flex-col gap-6 text-ink-muted [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink">
          <section>
            <h2>¿Qué cubre?</h2>
            <p className="mt-2">
              Todos los patines y bicicletas eléctricas que vendemos cuentan con garantía del fabricante
              contra defectos de fabricación en motor, batería y controlador por un periodo de{" "}
              <strong>90 días</strong> a partir de la fecha de compra.
            </p>
          </section>

          <section>
            <h2>¿Qué no cubre?</h2>
            <p className="mt-2">
              Daños por mal uso, caídas, exposición al agua más allá de lo indicado en la ficha técnica,
              desgaste normal (llantas, frenos, baterías por ciclos de carga) o modificaciones no
              autorizadas al equipo.
            </p>
          </section>

          <section>
            <h2>¿Cómo la solicito?</h2>
            <p className="mt-2">
              Escríbenos por WhatsApp con tu número de pedido y una descripción del problema — si puedes,
              incluye fotos o un video corto. Te confirmamos si procede la garantía y los siguientes pasos.
            </p>
            <a
              href={`https://wa.me/${STORE_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Contactar por WhatsApp
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
