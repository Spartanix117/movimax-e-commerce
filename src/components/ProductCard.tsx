import type { Category, Product } from "@prisma/client";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatPrice } from "@/lib/format";
import { BikeIcon, ScooterIcon } from "@/components/icons";

const MEDIA_ICONS: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  "patines-electricos": ScooterIcon,
  "bicicletas-electricas": BikeIcon,
};

export function ProductCard({
  product,
}: {
  product: Product & { category: Category };
}) {
  const Icon = MEDIA_ICONS[product.category.slug] ?? ScooterIcon;
  const outOfStock = product.stock <= 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-sm">
      <div className="flex aspect-[4/3] items-center justify-center border-b border-line bg-[radial-gradient(120%_140%_at_15%_0%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_60%)] bg-paper text-ink-muted">
        <Icon className="h-12 w-12" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
          {product.category.name}
        </span>
        <h3 className="text-[0.98rem] font-semibold leading-snug text-ink">{product.name}</h3>
        <p className="flex-1 text-sm text-ink-muted">{product.spec}</p>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            outOfStock ? "text-ink-muted" : "text-success"
          }`}
        >
          <i
            className={`h-1.5 w-1.5 rounded-full ${outOfStock ? "bg-ink-muted" : "bg-success"}`}
          />
          {outOfStock ? "Agotado" : "En stock"}
        </span>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-mono text-[1.05rem] font-bold text-accent tabular-nums">
            {formatPrice(product.priceCents)}
          </span>
          {!outOfStock && (
            <AddToCartButton
              productId={product.id}
              name={product.name}
              priceCents={product.priceCents}
            />
          )}
        </div>
      </div>
    </article>
  );
}
