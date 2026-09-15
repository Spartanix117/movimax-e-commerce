import Stripe from "stripe";

let cached: Stripe | null = null;

// Read the key lazily (inside the function, not at module load) so that
// pages which never touch Stripe — the landing page, the catalog, the cart
// preview — keep working even before STRIPE_SECRET_KEY is configured.
// Only the checkout/webhook routes call this, and they fail with a clear
// message instead of taking the whole app down.
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Falta STRIPE_SECRET_KEY en .env — agrega tu llave secreta de prueba de Stripe (ver README)."
    );
  }
  cached = new Stripe(key);
  return cached;
}
