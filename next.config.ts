import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js blocks dev-server requests from origins other than localhost by
  // default — needed here so testing through an ngrok tunnel (required for
  // Mercado Pago's webhook to reach us) doesn't break client interactivity.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok-free.dev"],
};

export default nextConfig;
