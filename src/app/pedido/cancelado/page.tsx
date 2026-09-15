import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PedidoCanceladoPage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-5 py-16 text-center sm:px-8">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-soft text-accent">
          <span className="text-2xl">×</span>
        </span>
        <h1 className="mt-5 font-display text-3xl font-extrabold">Pago cancelado</h1>
        <p className="mt-3 max-w-[42ch] text-ink-muted">
          No se realizó ningún cargo. Tu carrito sigue guardado si quieres intentarlo de nuevo.
        </p>
        <Link
          href="/catalogo"
          className="mt-8 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Volver al catálogo
        </Link>
      </main>
      <Footer />
    </>
  );
}
