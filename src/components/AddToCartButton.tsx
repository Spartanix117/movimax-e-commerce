"use client";

import { useCart } from "@/components/cart/CartContext";
import { PlusIcon } from "@/components/icons";

type Props = {
  productId: string;
  name: string;
  priceCents: number;
};

export function AddToCartButton({ productId, name, priceCents }: Props) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() => addItem({ productId, name, priceCents })}
      aria-label={`Agregar ${name} al carrito`}
      className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-line bg-paper text-ink transition hover:border-gold hover:bg-gold hover:text-gold-ink"
    >
      <PlusIcon className="h-3.5 w-3.5" />
    </button>
  );
}
