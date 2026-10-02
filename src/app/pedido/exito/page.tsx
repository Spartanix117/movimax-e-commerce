import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { formatPrice } from "@/lib/format";
import { getAdminDb } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";

type Order = { totalCents: number; status: string; stripeCheckoutSessionId?: string };

export default async function PedidoExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ external_reference?: string }>;
}) {
  const { external_reference } = await searchParams;

  // Best-effort: this is a "thank you" page, so a lookup failure (missing
  // credentials, doc not found) should never stop it from confirming the
  // payment the customer just completed — just skip showing the total.
  let order: Order | null = null;
  try {
    const orderSnap = external_reference
      ? await getAdminDb().collection("orders").doc(external_reference).get()
      : null;
    order = orderSnap?.exists ? (orderSnap.data() as Order) : null;
  } catch {
    order = null;
  }

  // A "pending" order isn't necessarily an unpaid OXXO voucher — a card
  // payment lands here "pending" too for the few seconds before the
  // webhook catches up. Ask Stripe which payment method the customer
  // actually used instead of assuming OXXO, so a card customer doesn't see
  // a false "go pay at OXXO" message.
  let isPendingOxxo = false;
  let isPendingCard = false;
  if (order?.status === "pending" && order.stripeCheckoutSessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(order.stripeCheckoutSessionId, {
        expand: ["payment_intent.payment_method"],
      });
      const paymentIntent =
        typeof session.payment_intent === "object" ? session.payment_intent : null;
      const paymentMethod =
        paymentIntent && typeof paymentIntent.payment_method === "object"
          ? paymentIntent.payment_method
          : null;
      isPendingOxxo = paymentMethod?.type === "oxxo";
      isPendingCard = !isPendingOxxo;
    } catch {
      // Stripe unreachable — fall through to the generic "confirming"
      // message below instead of guessing OXXO.
      isPendingCard = true;
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-5 py-16 text-center sm:px-8">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            isPendingOxxo || isPendingCard ? "bg-purple-soft text-accent" : "bg-success-soft text-success"
          }`}
        >
          <span className="text-2xl">{isPendingOxxo ? "🏪" : isPendingCard ? "⏳" : "✓"}</span>
        </span>
        <h1 className="mt-5 font-display text-3xl font-extrabold">
          {isPendingOxxo
            ? "Ficha OXXO generada"
            : isPendingCard
              ? "Confirmando tu pago…"
              : "¡Pago confirmado!"}
        </h1>
        <p className="mt-3 max-w-[46ch] text-ink-muted">
          {isPendingOxxo
            ? "Te enviamos por correo el comprobante para pagar en cualquier tienda OXXO. Tu pedido se confirma en cuanto se registre el pago."
            : isPendingCard
              ? "Tu pago se está procesando — la confirmación debería llegar en unos segundos. Si después de un minuto sigue igual, contáctanos por WhatsApp."
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
