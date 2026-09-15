import { NextRequest, NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { getMercadoPagoConfig } from "@/lib/mercadopago";

type CheckoutRequestItem = { productId: string; quantity: number };

export async function POST(req: NextRequest) {
  let mpConfig;
  try {
    mpConfig = getMercadoPagoConfig();
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
    return [{ product, quantity }];
  });

  if (lineItems.length === 0) {
    return NextResponse.json(
      { error: "Ninguno de los productos del carrito sigue disponible." },
      { status: 400 }
    );
  }

  const totalCents = lineItems.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0);
  const origin = req.nextUrl.origin;

  // Recorded as "pending" now — the webhook is what actually confirms
  // payment, especially for an OXXO ticket that can be paid days later.
  const order = await prisma.order.create({
    data: {
      status: "pending",
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

  const preference = await new Preference(mpConfig).create({
    body: {
      items: lineItems.map(({ product, quantity }) => ({
        id: product.id,
        title: product.name,
        quantity,
        currency_id: "MXN",
        unit_price: product.priceCents / 100,
      })),
      external_reference: order.id,
      back_urls: {
        success: `${origin}/pedido/exito`,
        pending: `${origin}/pedido/pendiente`,
        failure: `${origin}/pedido/cancelado`,
      },
      auto_return: "approved",
      notification_url: `${origin}/api/webhooks/mercadopago`,
    },
  });

  const payUrl = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith("TEST-")
    ? preference.sandbox_init_point
    : preference.init_point;

  if (!payUrl) {
    return NextResponse.json(
      { error: "Mercado Pago no devolvió una URL de pago." },
      { status: 502 }
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { mpPreferenceId: preference.id },
  });

  return NextResponse.json({ url: payUrl });
}
