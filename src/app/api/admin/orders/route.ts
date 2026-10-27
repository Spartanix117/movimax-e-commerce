import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { isAuthorized } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "ADMIN_API_KEY no está configurada." }, { status: 500 });
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    // Pending/failed orders have no createdAt-independent reason to sort
    // differently — ordering by document creation (Firestore's natural
    // insertion order via orderBy on the id) would need an index, so we
    // just fetch and sort by createdAt in memory; this collection won't be
    // large enough for that to matter.
    const snapshot = await getAdminDb().collection("orders").get();
    const orders = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const aMs = (a as { createdAt?: { toMillis(): number } }).createdAt?.toMillis() ?? 0;
        const bMs = (b as { createdAt?: { toMillis(): number } }).createdAt?.toMillis() ?? 0;
        return bMs - aMs;
      });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "No se pudo obtener la lista de pedidos." }, { status: 500 });
  }
}
