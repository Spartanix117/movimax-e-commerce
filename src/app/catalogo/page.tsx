import Link from "next/link";
import { getAdminDb } from "@/lib/firebase-admin";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import type { Category, Product, ProductWithCategory } from "@/lib/types";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const adminDb = getAdminDb();
  const [categoriesSnap, productsSnap] = await Promise.all([
    adminDb.collection("categories").get(),
    adminDb.collection("products").where("isActive", "==", true).get(),
  ]);

  // Filtering "coming soon" in memory avoids a composite index (where + orderBy
  // on different fields) and keeps categories that lack the comingSoon field.
  const categories: Category[] = categoriesSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Category, "id">) }))
    .filter((c) => !c.comingSoon);

  const categoriesById = Object.fromEntries(categories.map((c) => [c.id, c]));
  const activeCategory = categories.find((c) => c.slug === categoria);

  const products: ProductWithCategory[] = productsSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }))
    .filter((p) => categoriesById[p.categoryId])
    .filter((p) => !activeCategory || p.categoryId === activeCategory.id)
    .map((p) => ({ ...p, category: categoriesById[p.categoryId] }));

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-9 sm:px-8">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
          Movilidad eléctrica
        </span>
        <h1 className="mt-1.5 font-display text-3xl font-extrabold sm:text-4xl">
          {activeCategory ? activeCategory.name : "Todo el catálogo"}
        </h1>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/catalogo"
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              !activeCategory
                ? "border-brand bg-brand text-white"
                : "border-line text-ink-muted hover:border-ink-muted"
            }`}
          >
            Todos
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalogo?categoria=${category.slug}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                activeCategory?.id === category.id
                  ? "border-brand bg-brand text-white"
                  : "border-line text-ink-muted hover:border-ink-muted"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="mt-7">
          <ProductGrid products={products} />
        </div>
      </main>
      <Footer />
    </>
  );
}
