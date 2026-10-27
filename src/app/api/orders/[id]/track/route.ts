import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

// Public — a customer reaches this with just their order id (shown on the
// success page), no login. Firestore auto-ids are long and random, so this
// is "unguessable by URL" the same way /pedido/exito already works, but we
// still only return what a customer needs to see — never Stripe session
// ids or other internal fields.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let adminDb;
  try {
    adminDb = getAdminDb();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const order = await adminDb.collection("orders").doc(id).get();
  if (!order.exists) {
    return NextResponse.json({ error: "No encontramos ningún pedido con ese número." }, { status: 404 });
  }

  const data = order.data();
  if (!data) {
    return NextResponse.json({ error: "No encontramos ningún pedido con ese número." }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    status: data.status,
    totalCents: data.totalCents,
    items: Array.isArray(data.items)
      ? data.items.map((item: { name: string; quantity: number }) => ({
          name: item.name,
          quantity: item.quantity,
        }))
      : [],
    fulfillmentStatus: data.fulfillmentStatus ?? null,
    trackingCarrier: data.trackingCarrier || null,
    trackingNumber: data.trackingNumber || null,
  });
}
