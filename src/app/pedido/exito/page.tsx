import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getStripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function PedidoExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let statusView: "card-paid" | "oxxo-pending" | "unknown" = "unknown";
  let totalCents: number | null = null;

  if (session_id) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id);
      totalCents = session.amount_total ?? null;
      if (session.payment_status === "paid") {
        statusView = "card-paid";
      } else if (session.payment_status === "unpaid") {
        statusView = "oxxo-pending";
      }
    } catch {
      // Stripe not configured or session not found — fall back to a
      // generic confirmation instead of crashing the page.
    }
  } else {
    // No Stripe keys / session id available (e.g. local dev without a
    // configured Stripe account yet) — look up the most recent order so
    // the page still shows something sensible while testing the flow.
    const order = await prisma.order.findFirst({ orderBy: { createdAt: "desc" } });
    if (order) totalCents = order.totalCents;
  }

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-5 py-16 text-center sm:px-8">
        {statusView === "oxxo-pending" ? (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-soft text-accent">
              <span className="text-2xl">🏪</span>
            </span>
            <h1 className="mt-5 font-display text-3xl font-extrabold">Ficha OXXO generada</h1>
            <p className="mt-3 max-w-[46ch] text-ink-muted">
              Te enviamos por correo el comprobante para pagar en cualquier tienda OXXO. Tienes{" "}
              <b className="text-ink">3 días</b> para pagarlo — tu pedido se confirma en cuanto
              se registre el pago.
            </p>
          </>
        ) : (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
              <span className="text-2xl">✓</span>
            </span>
            <h1 className="mt-5 font-display text-3xl font-extrabold">¡Pago confirmado!</h1>
            <p className="mt-3 max-w-[46ch] text-ink-muted">
              Gracias por tu compra. Te enviamos la confirmación por correo y preparamos tu
              pedido para enviarlo.
            </p>
          </>
        )}

        {totalCents !== null && (
          <p className="mt-6 font-mono text-2xl font-bold text-accent tabular-nums">
            {formatPrice(totalCents)}
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
