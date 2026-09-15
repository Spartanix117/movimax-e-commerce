import { MercadoPagoConfig } from "mercadopago";

let cached: MercadoPagoConfig | null = null;

// Read the access token lazily (inside the function, not at module load) so
// pages that never touch Mercado Pago — the landing page, the catalog, the
// cart preview — keep working even before MERCADOPAGO_ACCESS_TOKEN is
// configured. Only the checkout/webhook routes call this, and they fail
// with a clear message instead of taking the whole app down.
export function getMercadoPagoConfig(): MercadoPagoConfig {
  if (cached) return cached;
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "Falta MERCADOPAGO_ACCESS_TOKEN en .env — agrega tu access token de prueba de Mercado Pago (ver README)."
    );
  }
  cached = new MercadoPagoConfig({ accessToken });
  return cached;
}
