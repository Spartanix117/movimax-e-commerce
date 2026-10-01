import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getStripe, describeStripeError } from "@/lib/stripe";
import { resolveLineItems, type CheckoutRequestItem } from "@/lib/checkout";
import { getRequestOrigin } from "@/lib/http";

export async function POST(req: NextRequest) {
  let stripe;
  let adminDb;
  try {
    stripe = getStripe();
    adminDb = getAdminDb();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  let body: { items?: CheckoutRequestItem[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo de la solicitud no es JSON válido." }, { status: 400 });
  }
  const requested = body.items ?? [];

  if (requested.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  const lineItems = await resolveLineItems(adminDb, requested);

  if (lineItems.length === 0) {
    return NextResponse.json(
      { error: "Ninguno de los productos del carrito sigue disponible." },
      { status: 400 }
    );
  }

  const totalCents = lineItems.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0);
  const origin = getRequestOrigin(req);

  // Recorded as "pending" now — the webhook is what actually confirms
  // payment, especially for an OXXO ticket that can be paid days later.
  const order = await adminDb.collection("orders").add({
    status: "pending",
    provider: "stripe",
    totalCents,
    items: lineItems.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      priceCents: product.priceCents,
      quantity,
    })),
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "oxxo"],
      payment_method_options: {
        oxxo: { expires_after_days: 3 },
      },
      line_items: lineItems.map(({ product, quantity }) => ({
        quantity,
        price_data: {
          currency: "mxn",
          unit_amount: product.priceCents,
          product_data: { name: product.name },
        },
      })),
      // Mercado Pago's back_urls carry external_reference automatically —
      // this mirrors that so /pedido/exito works for either provider
      // without branching on which one sent the customer there.
      client_reference_id: order.id,
      success_url: `${origin}/pedido/exito?external_reference=${order.id}`,
      cancel_url: `${origin}/pedido/cancelado`,
    });

    if (!session.url) {
      throw new Error("Stripe no devolvió una URL de pago.");
    }

    await order.update({
      stripeCheckoutSessionId: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Nothing to charge for if Stripe rejected the request (invalid
    // credentials, malformed items, etc.) — don't leave an orphaned
    // "pending" order behind.
    await order.delete().catch(() => {});
    return NextResponse.json(
      { error: `Stripe rechazó la solicitud: ${describeStripeError(err)}` },
      { status: 502 }
    );
  }
}
