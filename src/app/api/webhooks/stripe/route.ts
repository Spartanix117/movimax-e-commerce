import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

// Marks the order paid exactly once even if Stripe retries the webhook —
// updateMany's count tells us whether *this* call is the one that flipped
// it, so we only decrement stock a single time per order.
async function markOrderPaid(sessionId: string, paymentMethod: "card" | "oxxo") {
  const { count } = await prisma.order.updateMany({
    where: { stripeCheckoutSessionId: sessionId, status: "pending" },
    data: { status: "paid", paymentMethod },
  });
  if (count === 0) return;

  const order = await prisma.order.findUnique({
    where: { stripeCheckoutSessionId: sessionId },
    include: { items: true },
  });
  if (!order) return;

  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }
}

async function markOrderFailed(sessionId: string) {
  await prisma.order.updateMany({
    where: { stripeCheckoutSessionId: sessionId, status: "pending" },
    data: { status: "failed" },
  });
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Falta STRIPE_WEBHOOK_SECRET en .env (ver README)." },
      { status: 500 }
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Missing stripe-signature header");
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Firma de webhook inválida: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // Card payments are captured synchronously; OXXO stays "unpaid" here
      // until the customer actually pays the voucher at the store.
      if (session.payment_status === "paid") {
        await markOrderPaid(session.id, "card");
      }
      break;
    }
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      await markOrderPaid(session.id, "oxxo");
      break;
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      await markOrderFailed(session.id);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
