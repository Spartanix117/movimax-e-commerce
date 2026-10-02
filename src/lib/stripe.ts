import Stripe from "stripe";

let cached: Stripe | null = null;

// Read the key lazily (inside the function, not at module load) so pages
// that never touch Stripe — the landing page, the catalog, the cart
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
  // A real secret key is much longer than the "sk_test_..." placeholder in
  // .env.example and always starts with sk_test_/sk_live_ (or rk_test_/
  // rk_live_ for a restricted key). Catching an unreplaced placeholder here
  // means a clear message instead of Stripe's opaque 401 on session create.
  if (!/^(sk|rk)_(test|live)_/.test(key) || key.length < 40) {
    throw new Error(
      "STRIPE_SECRET_KEY en .env no parece una llave real de Stripe (¿sigue el valor de ejemplo \"sk_test_...\", " +
        "o copiaste la llave publicable en vez de la secreta?). Ve a tu panel de Stripe → Desarrolladores → " +
        "Claves de API, y copia la Clave secreta completa (empieza con sk_test_ en modo de prueba). Ver README, " +
        "sección 'Pagos con Stripe'."
    );
  }
  cached = new Stripe(key);
  return cached;
}

// The SDK's own StripeError always carries `type` and usually `code` — the
// real per-field detail (e.g. which parameter Stripe rejected) — even when
// `message` alone is generic. Surface those instead of a bare string.
export function describeStripeError(err: unknown): string {
  if (err instanceof Stripe.errors.StripeError) {
    return [err.type, err.code, err.message].filter(Boolean).join(" — ");
  }
  return err instanceof Error ? err.message : "Error desconocido de Stripe.";
}
