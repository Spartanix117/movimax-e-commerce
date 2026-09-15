import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

type CheckoutRequestItem = { productId: string; quantity: number };

export async function POST(req: NextRequest) {
  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const body = (await req.json()) as { items?: CheckoutRequestItem[] };
  const requested = body.items ?? [];

  if (requested.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  // Never trust prices/quantities from the client — look products up by id
  // and price them from the database, same as any real payment integration.
  const products = await prisma.product.findMany({
    where: { id: { in: requested.map((i) => i.productId) }, isActive: true },
  });

  const lineItems = requested.flatMap((reqItem) => {
    const product = products.find((p) => p.id === reqItem.productId);
    if (!product || reqItem.quantity <= 0) return [];
    const quantity = Math.min(reqItem.quantity, product.stock || reqItem.quantity);
    return [
      {
        product,
        quantity,
      },
    ];
  });

  if (lineItems.length === 0) {
    return NextResponse.json(
      { error: "Ninguno de los productos del carrito sigue disponible." },
      { status: 400 }
    );
  }

  const totalCents = lineItems.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0);
  const origin = req.nextUrl.origin;

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
    success_url: `${origin}/pedido/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pedido/cancelado`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe no devolvió una URL de pago." },
      { status: 502 }
    );
  }

  // Recorded as "pending" now — the webhook is what actually confirms
  // payment, especially for OXXO where that can happen days later.
  await prisma.order.create({
    data: {
      status: "pending",
      stripeCheckoutSessionId: session.id,
      totalCents,
      items: {
        create: lineItems.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          quantity,
        })),
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
