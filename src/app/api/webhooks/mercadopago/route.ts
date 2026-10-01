import { NextRequest, NextResponse } from "next/server";
import { Payment, WebhookSignatureValidator } from "mercadopago";
import { getAdminDb } from "@/lib/firebase-admin";
import { getMercadoPagoConfig, describeMercadoPagoError } from "@/lib/mercadopago";
import { markOrderPaid, markOrderFailed } from "@/lib/orders";

export async function POST(req: NextRequest) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Falta MERCADOPAGO_WEBHOOK_SECRET en .env (ver README)." },
      { status: 500 }
    );
  }

  let mpConfig;
  try {
    mpConfig = getMercadoPagoConfig();
    getAdminDb();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const dataId = req.nextUrl.searchParams.get("data.id") ?? req.nextUrl.searchParams.get("id");
  const type = req.nextUrl.searchParams.get("type") ?? req.nextUrl.searchParams.get("topic");

  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId,
      secret,
      toleranceSeconds: 300,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Firma de webhook inválida: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  // We only care about payment notifications — merchant_order and other
  // topics don't carry anything this store needs to act on.
  if (type !== "payment" || !dataId) {
    return NextResponse.json({ received: true });
  }

  let payment;
  try {
    payment = await new Payment(mpConfig).get({ id: dataId });
  } catch (err) {
    // A revoked/regenerated access token (or any other rejection from
    // Mercado Pago) shouldn't 500 with no explanation — same clear error
    // shape the checkout route already gives.
    return NextResponse.json(
      { error: `Mercado Pago rechazó la consulta del pago: ${describeMercadoPagoError(err)}` },
      { status: 502 }
    );
  }
  const orderId = payment.external_reference;
  if (!orderId) return NextResponse.json({ received: true });

  if (payment.status === "approved") {
    await markOrderPaid(orderId, payment.payment_type_id, { mpPaymentId: String(payment.id) });
  } else if (payment.status === "rejected" || payment.status === "cancelled") {
    await markOrderFailed(orderId, { mpPaymentId: String(payment.id) });
  }
  // "pending" / "in_process" (e.g. an unpaid OXXO ticket) — leave as is,
  // we'll get another notification once it's actually paid.

  return NextResponse.json({ received: true });
}
