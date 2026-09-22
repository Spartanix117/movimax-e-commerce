import { NextRequest, NextResponse } from "next/server";
import { Preference, MercadoPagoError } from "mercadopago";
import { getAdminDb } from "@/lib/firebase-admin";
import { getMercadoPagoConfig } from "@/lib/mercadopago";
import type { Product } from "@/lib/types";

// The SDK's own error message often falls back to the generic
// "MercadoPago API error" when the response body carries no `message`/
// `error` field — but `status` and `causes` (the real per-field validation
// detail) are still there. Surface those instead of the generic string.
function describeMercadoPagoError(err: unknown): string {
  if (err instanceof MercadoPagoError) {
    const causeText = err.causes
      .map((c) => (typeof c === "object" && c && "description" in c ? c.description : c))
      .join("; ");
    return [
      `HTTP ${err.status || "?"}`,
      err.error || err.message,
      causeText || null,
    ]
      .filter(Boolean)
      .join(" — ");
  }
  return err instanceof Error ? err.message : "No se pudo crear la preferencia de pago.";
}

type CheckoutRequestItem = { productId: string; quantity: number };

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

  // Never trust prices/quantities from the client — look products up by id
  // and price them from the database, same as any real payment integration.
  const productsSnapshot = await adminDb.collection("products").where("isActive", "==", true).get();
  const products = productsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Product, "id">),
  }));

  const lineItems = requested.flatMap((reqItem) => {
    if (
      typeof reqItem.productId !== "string" ||
      !Number.isInteger(reqItem.quantity) ||
      reqItem.quantity <= 0
    ) {
      return [];
    }
    const product = products.find((p) => p.id === reqItem.productId);
    if (!product || product.stock <= 0) return [];
    const quantity = Math.min(reqItem.quantity, product.stock);
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
  const order = await adminDb.collection("orders").add({
    status: "pending",
    totalCents,
    items: lineItems.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      priceCents: product.priceCents,
      quantity,
    })),
  });

  try {
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
