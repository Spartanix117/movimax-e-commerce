import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";
import type { Category, Product, ProductWithCategory } from "@/lib/types";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductGrid } from "@/components/ProductGrid";

// Re-fetch categories/products from the DB at most once a minute instead of
// baking them into the page at build time — otherwise new products would
// only show up after a redeploy.
export const revalidate = 60;

export default async function Home() {
  const [categoriesSnap, productsSnap] = await Promise.all([
    adminDb.collection("categories").get(),
    adminDb.collection("products").where("isActive", "==", true).limit(8).get(),
  ]);

  const categories: Category[] = categoriesSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Category, "id">),
  }));
  const categoriesById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const featuredProducts: ProductWithCategory[] = productsSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }))
    .filter((p) => categoriesById[p.categoryId])
    .map((p) => ({ ...p, category: categoriesById[p.categoryId] }));

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
                ¿Necesitas algo con qué moverte? Aquí lo tenemos
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
      </main>
      <Footer />
    </>
  );
}
