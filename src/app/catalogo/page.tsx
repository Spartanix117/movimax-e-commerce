import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { comingSoon: false },
      orderBy: { createdAt: "asc" },
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoria ? { category: { slug: categoria } } : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === categoria);

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
