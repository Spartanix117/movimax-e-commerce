import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductGrid } from "@/components/ProductGrid";

// Render this page fresh on every request instead of caching it — stock
// counts and new/removed products should show up immediately, not only
// after a redeploy or once a cache window expires.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: "asc" },
      take: 8,
    }),
  ]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />

        <section id="catalogo" className="py-11 sm:py-13">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-6.5">
              <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                Explora por categoría
              </span>
              <h2 className="mt-1.5 font-display text-3xl font-extrabold">
                ¿Qué necesitas para moverte?
              </h2>
            </div>
            <CategoryGrid categories={categories} />
          </div>
        </section>

        <section id="ofertas" className="pb-11 pt-0 sm:pb-13">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-6.5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                  Los más pedidos
                </span>
                <h2 className="mt-1.5 font-display text-3xl font-extrabold">
                  Destacados de la semana
                </h2>
              </div>
              <Link href="/catalogo" className="text-sm font-semibold text-accent">
                Ver todo el catálogo →
              </Link>
            </div>
            <ProductGrid products={featuredProducts} />
          </div>
        </section>

        <section className="pb-14 pt-0">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-5 rounded-[18px] bg-brand px-6.5 py-7.5 text-white">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#C6B6E8]">
                  Promoción activa
                </span>
                <h3 className="mt-1.5 text-balance font-display text-2xl font-extrabold sm:text-3xl">
                  Envío gratis en compras desde $1,500
                </h3>
                <p className="mt-1 text-sm text-[#D2C4EC]">
                  Válido en todo México, aplica automático en el carrito.
                </p>
              </div>
              <Link
                href="/catalogo"
                className="rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-gold-ink transition hover:brightness-105"
              >
                Aprovechar oferta
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
