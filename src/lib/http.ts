import type { NextRequest } from "next/server";

// req.nextUrl.origin is unreliable behind a reverse proxy in Next's dev
// server (Turbopack): tested through an ngrok tunnel, it reports the right
// protocol (from x-forwarded-proto) but the wrong host — the local dev
// server's own "localhost:3000" instead of the public ngrok domain. That
// breaks any URL we hand to a third party (Mercado Pago's back_urls/
// notification_url, Stripe's success_url/cancel_url): they'd point at an
// address only reachable on this machine. Prefer the forwarded headers
// ngrok/any reverse proxy sets when present, since those reflect what the
// browser/payment provider actually used to reach us.
export function getRequestOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
    return `${forwardedProto}://${forwardedHost}`;
  }
  return req.nextUrl.origin;
}
