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
  // A real access token is much longer than the "TEST-..." placeholder in
  // .env.example and always starts with TEST- (sandbox) or APP_USR-
  // (producción). Catching an unreplaced placeholder here means a clear
  // message instead of Mercado Pago's opaque "HTTP 403" on preference create.
  if (!/^(TEST|APP_USR)-/.test(accessToken) || accessToken.length < 40) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN en .env no parece un access token real de Mercado Pago (¿sigue el valor de " +
        "ejemplo \"TEST-...\", o copiaste la Public Key en vez del Access Token?). Ve a tu panel de " +
        "desarrolladores de Mercado Pago → tu aplicación → Credenciales de prueba, y copia el Access Token " +
        "completo (empieza con TEST- y es una cadena larga). Ver README, sección 'Pagos con Mercado Pago'."
    );
  }
  cached = new MercadoPagoConfig({ accessToken });
  return cached;
}
