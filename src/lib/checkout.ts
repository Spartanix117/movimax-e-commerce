import type { Firestore } from "firebase-admin/firestore";
import type { Product } from "@/lib/types";

export type CheckoutRequestItem = { productId: string; quantity: number };
export type ResolvedLineItem = { product: Product; quantity: number };

// Never trust prices/quantities from the client — look products up by id
// and price them from the database, same as any real payment integration.
// Shared by every checkout route (Mercado Pago, Stripe, ...) so they all
// price and validate the cart identically instead of drifting apart.
export async function resolveLineItems(
  adminDb: Firestore,
  requested: CheckoutRequestItem[]
): Promise<ResolvedLineItem[]> {
  const productsSnapshot = await adminDb.collection("products").where("isActive", "==", true).get();
  const products = productsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Product, "id">),
  }));

  return requested.flatMap((reqItem) => {
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
}
