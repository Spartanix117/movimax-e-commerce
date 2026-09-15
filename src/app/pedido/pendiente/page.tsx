import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function PedidoPendientePage({
  searchParams,
}: {
  searchParams: Promise<{ external_reference?: string }>;
}) {
  const { external_reference } = await searchParams;

  const order = external_reference
    ? await prisma.order.findUnique({ where: { id: external_reference } })
    : null;

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-5 py-16 text-center sm:px-8">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-soft text-accent">
          <span className="text-2xl">🏪</span>
        </span>
        <h1 className="mt-5 font-display text-3xl font-extrabold">Ficha OXXO generada</h1>
        <p className="mt-3 max-w-[46ch] text-ink-muted">
          Te enviamos por correo el comprobante para pagar en cualquier tienda OXXO. Tu pedido se
          confirma en cuanto se registre el pago — normalmente unos minutos después de pagar la
          ficha.
        </p>

        {order && (
          <p className="mt-6 font-mono text-2xl font-bold text-accent tabular-nums">
            {formatPrice(order.totalCents)}
          </p>
        )}

        <Link
          href="/catalogo"
          className="mt-8 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Seguir comprando
        </Link>
      </main>
      <Footer />
    </>
  );
}
