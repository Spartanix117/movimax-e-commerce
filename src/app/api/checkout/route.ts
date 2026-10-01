import { NextRequest, NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { getAdminDb } from "@/lib/firebase-admin";
import { getMercadoPagoConfig, describeMercadoPagoError } from "@/lib/mercadopago";
import { resolveLineItems, type CheckoutRequestItem } from "@/lib/checkout";
import { getRequestOrigin } from "@/lib/http";

export async function POST(req: NextRequest) {
  let mpConfig;
  let adminDb;
  try {
    mpConfig = getMercadoPagoConfig();
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
    provider: "mercadopago",
    totalCents,
    items: lineItems.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      priceCents: product.priceCents,
      quantity,
    })),
  });

  try {
    // Mercado Pago rejects auto_return with invalid_auto_return unless
    // back_urls.success is a real https URL — which localhost never is.
    // Skip it for plain http testing (the user lands on Mercado Pago's own
    // "volver al sitio" screen and clicks back manually); ngrok/production
    // origins are https, so they keep the automatic redirect.
    const isHttps = origin.startsWith("https://");
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
        ...(isHttps ? { auto_return: "approved" as const } : {}),
        notification_url: `${origin}/api/webhooks/mercadopago`,
      },
    });

    // Mercado Pago only returns sandbox_init_point when the preference was
    // created with a test credential — checking that directly is more
    // reliable than guessing from the access token's prefix, which isn't a
    // consistent "TEST-" vs "APP_USR-" split across all accounts.
    const payUrl = preference.sandbox_init_point || preference.init_point;

    if (!payUrl) {
      throw new Error("Mercado Pago no devolvió una URL de pago.");
    }

    await order.update({
      mpPreferenceId: preference.id,
    });

    return NextResponse.json({ url: payUrl });
  } catch (err) {
    // Nothing to charge for if Mercado Pago rejected the request (invalid
    // credentials, malformed items, etc.) — don't leave an orphaned
    // "pending" order behind.
    await order.delete().catch(() => {});
    return NextResponse.json(
      { error: `Mercado Pago rechazó la solicitud: ${describeMercadoPagoError(err)}` },
      { status: 502 }
    );
  }
}
