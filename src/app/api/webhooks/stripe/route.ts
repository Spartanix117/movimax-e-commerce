import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import { getStripe, describeStripeError } from "@/lib/stripe";
import { markOrderPaid, markOrderFailed } from "@/lib/orders";

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
    getAdminDb();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  // Stripe signs the raw request body — parsing it as JSON first would
  // reformat whitespace and break constructEvent's signature check.
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Falta el header stripe-signature.");
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Firma de webhook inválida: ${describeStripeError(err)}` },
      { status: 400 }
    );
  }

  // We only care about Checkout Session events — other event types this
  // account might be subscribed to don't carry anything this store needs.
  if (!event.type.startsWith("checkout.session.")) {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.client_reference_id;
  if (!orderId) return NextResponse.json({ received: true });

  switch (event.type) {
    case "checkout.session.completed":
      // Card payments are captured synchronously; OXXO stays "unpaid" here
      // until the customer actually pays the voucher at the store — that
      // resolves later via async_payment_succeeded/failed below.
      if (session.payment_status === "paid") {
        await markOrderPaid(orderId, "card", { stripeCheckoutSessionId: session.id });
      }
      break;
    case "checkout.session.async_payment_succeeded":
      await markOrderPaid(orderId, "oxxo", { stripeCheckoutSessionId: session.id });
      break;
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired":
      await markOrderFailed(orderId, { stripeCheckoutSessionId: session.id });
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
