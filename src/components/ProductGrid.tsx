import type { Category, Product } from "@prisma/client";
import { ProductCard } from "@/components/ProductCard";

export function ProductGrid({
  products,
}: {
  products: (Product & { category: Category })[];
}) {
  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-sm text-ink-muted">
        No hay productos en esta categoría todavía.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
