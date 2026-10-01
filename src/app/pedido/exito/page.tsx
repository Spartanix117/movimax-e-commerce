import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { formatPrice } from "@/lib/format";
import { getAdminDb } from "@/lib/firebase-admin";

export default async function PedidoExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ external_reference?: string }>;
}) {
  const { external_reference } = await searchParams;

  // Best-effort: this is a "thank you" page, so a lookup failure (missing
  // credentials, doc not found) should never stop it from confirming the
  // payment the customer just completed — just skip showing the total.
  let order: { totalCents: number; status: string } | null = null;
  try {
    const orderSnap = external_reference
      ? await getAdminDb().collection("orders").doc(external_reference).get()
      : null;
    order = orderSnap?.exists ? (orderSnap.data() as { totalCents: number; status: string }) : null;
  } catch {
    order = null;
  }

  // Mercado Pago only sends the customer here once the payment is actually
  // approved (it has its own /pedido/pendiente back_url for an unpaid OXXO
  // ticket). Stripe has a single success_url for both card and OXXO, so an
  // OXXO voucher lands here too, still "pending" — show that state instead
  // of falsely confirming a payment that hasn't happened yet.
  const isPending = order?.status === "pending";

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-5 py-16 text-center sm:px-8">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            isPending ? "bg-purple-soft text-accent" : "bg-success-soft text-success"
          }`}
        >
          <span className="text-2xl">{isPending ? "🏪" : "✓"}</span>
        </span>
        <h1 className="mt-5 font-display text-3xl font-extrabold">
          {isPending ? "Ficha OXXO generada" : "¡Pago confirmado!"}
        </h1>
        <p className="mt-3 max-w-[46ch] text-ink-muted">
          {isPending
            ? "Te enviamos por correo el comprobante para pagar en cualquier tienda OXXO. Tu pedido se confirma en cuanto se registre el pago."
            : "Gracias por tu compra. Te enviamos la confirmación por correo y preparamos tu pedido para enviarlo."}
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
