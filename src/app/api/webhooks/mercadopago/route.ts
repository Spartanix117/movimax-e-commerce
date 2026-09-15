import { NextRequest, NextResponse } from "next/server";
import { Payment, WebhookSignatureValidator } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { getMercadoPagoConfig } from "@/lib/mercadopago";

// Marks the order paid exactly once even if Mercado Pago retries the
// notification — updateMany's count tells us whether *this* call is the
// one that flipped it, so we only decrement stock a single time per order.
async function markOrderPaid(orderId: string, mpPaymentId: string, paymentMethod?: string) {
  const { count } = await prisma.order.updateMany({
    where: { id: orderId, status: "pending" },
    data: { status: "paid", mpPaymentId, paymentMethod },
  });
  if (count === 0) return;

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return;

  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }
}

async function markOrderFailed(orderId: string, mpPaymentId: string) {
  await prisma.order.updateMany({
    where: { id: orderId, status: "pending" },
    data: { status: "failed", mpPaymentId },
  });
}

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

  const payment = await new Payment(mpConfig).get({ id: dataId });
  const orderId = payment.external_reference;
  if (!orderId) return NextResponse.json({ received: true });

  if (payment.status === "approved") {
    await markOrderPaid(orderId, String(payment.id), payment.payment_type_id);
  } else if (payment.status === "rejected" || payment.status === "cancelled") {
    await markOrderFailed(orderId, String(payment.id));
  }
  // "pending" / "in_process" (e.g. an unpaid OXXO ticket) — leave as is,
  // we'll get another notification once it's actually paid.

  return NextResponse.json({ received: true });
}
