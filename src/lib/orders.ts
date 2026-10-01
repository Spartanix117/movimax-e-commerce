import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

// Marks the order paid exactly once even if the payment provider retries
// the notification, so stock is decremented only for the first successful
// update. Shared by the Mercado Pago and Stripe webhooks so both providers
// transition orders through Firestore the exact same way — only the
// provider-specific id fields in `extraFields` differ (e.g. mpPaymentId vs
// stripeCheckoutSessionId).
export async function markOrderPaid(
  orderId: string,
  paymentMethod: string | undefined,
  extraFields: Record<string, string>
) {
  const adminDb = getAdminDb();
  const orderRef = adminDb.collection("orders").doc(orderId);
  const transitioned = await adminDb.runTransaction(async (transaction) => {
    const order = await transaction.get(orderRef);
    if (!order.exists || order.data()?.status === "paid") return false;

    transaction.update(orderRef, {
      status: "paid",
      paymentMethod,
      ...extraFields,
    });
    return true;
  });

  if (!transitioned) return;

  const order = await orderRef.get();
  if (!order.exists) return;
  const orderData = order.data();
  if (!orderData) return;

  for (const item of orderData.items) {
    await adminDb.collection("products").doc(item.productId).update({
      stock: FieldValue.increment(-item.quantity),
    });
  }
}

export async function markOrderFailed(orderId: string, extraFields: Record<string, string>) {
  await getAdminDb().collection("orders").doc(orderId).update({
    status: "failed",
    ...extraFields,
  });
}
