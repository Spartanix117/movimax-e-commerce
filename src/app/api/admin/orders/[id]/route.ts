import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { isAuthorized } from "@/lib/admin-auth";
import type { FulfillmentStatus } from "@/lib/types";

const VALID_STATUSES: FulfillmentStatus[] = ["preparando", "enviado", "entregado"];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "ADMIN_API_KEY no está configurada." }, { status: 500 });
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo de la solicitud no es JSON válido." }, { status: 400 });
  }

  const { fulfillmentStatus, trackingCarrier, trackingNumber } = body;

  if (!VALID_STATUSES.includes(fulfillmentStatus as FulfillmentStatus)) {
    return NextResponse.json(
      { error: `fulfillmentStatus debe ser uno de: ${VALID_STATUSES.join(", ")}.` },
      { status: 400 }
    );
  }
  if (
    (trackingCarrier != null && typeof trackingCarrier !== "string") ||
    (trackingNumber != null && typeof trackingNumber !== "string")
  ) {
    return NextResponse.json({ error: "trackingCarrier y trackingNumber deben ser texto." }, { status: 400 });
  }

  try {
    const adminDb = getAdminDb();
    const orderRef = adminDb.collection("orders").doc(id);
    const order = await orderRef.get();
    if (!order.exists) {
      return NextResponse.json({ error: "El pedido no existe." }, { status: 404 });
    }
    // Shipping status only makes sense once the order is actually paid —
    // an unpaid or failed order has nothing to prepare or ship.
    if (order.data()?.status !== "paid") {
      return NextResponse.json(
        { error: "Solo se puede actualizar el envío de un pedido ya pagado." },
        { status: 400 }
      );
    }

    await orderRef.update({
      fulfillmentStatus,
      trackingCarrier: typeof trackingCarrier === "string" ? trackingCarrier.trim() : "",
      trackingNumber: typeof trackingNumber === "string" ? trackingNumber.trim() : "",
    });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el pedido." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
