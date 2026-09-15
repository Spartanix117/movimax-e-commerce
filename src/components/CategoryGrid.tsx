import Link from "next/link";
import type { Category } from "@prisma/client";
import { BikeIcon, DropletIcon, PhoneIcon, ScooterIcon } from "@/components/icons";

const ICONS: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  "patines-electricos": ScooterIcon,
  "bicicletas-electricas": BikeIcon,
  celulares: PhoneIcon,
  impermeabilizantes: DropletIcon,
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => {
        const Icon = ICONS[category.slug] ?? ScooterIcon;
        const content = (
          <>
            <span className="flex h-9.5 w-9.5 items-center justify-center rounded-[10px] bg-purple-soft text-accent">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span className="text-sm font-semibold text-ink">{category.name}</span>
            {category.comingSoon && (
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                Próximamente
              </span>
            )}
          </>
        );

        if (category.comingSoon) {
          return (
            <div
              key={category.id}
              className="flex cursor-default flex-col gap-3.5 rounded-2xl border border-line bg-paper-raised p-4.5 opacity-70"
            >
              {content}
            </div>
          );
        }

        return (
          <Link
            key={category.id}
            href={`/catalogo?categoria=${category.slug}`}
            className="flex flex-col gap-3.5 rounded-2xl border border-line bg-paper-raised p-4.5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
