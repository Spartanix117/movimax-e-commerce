"use client";

import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/format";
import { STORE_WHATSAPP } from "@/lib/constants";
import { CloseIcon, MinusIcon, PlusIcon, WhatsAppIcon } from "@/components/icons";

function buildWhatsAppOrderUrl(
  items: { name: string; priceCents: number; quantity: number }[],
  subtotalCents: number
) {
  const lines = items.map(
    (i) => `• ${i.name} x${i.quantity} — ${formatPrice(i.priceCents * i.quantity)}`
  );
  const message = [
    "Hola, quiero hacer un pedido en Movimax:",
    "",
    ...lines,
    "",
    `Total: ${formatPrice(subtotalCents)}`,
  ].join("\n");
  return `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function CartDrawer() {
  const { items, isOpen, close, removeItem, setQuantity, subtotalCents } = useCart();

  return (
    <>
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Carrito de compras"
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-paper-raised shadow-2xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl font-bold text-ink">Tu carrito</h2>
          <button
            onClick={close}
            aria-label="Cerrar carrito"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink hover:border-ink-muted"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-8 text-center text-sm text-ink-muted">
              Todavía no agregas productos.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.productId} className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                    <p className="mt-1 font-mono text-sm text-accent tabular-nums">
                      {formatPrice(item.priceCents)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        aria-label={`Quitar una unidad de ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink hover:border-ink-muted"
                      >
                        <MinusIcon className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center font-mono text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        aria-label={`Agregar una unidad de ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink hover:border-ink-muted"
                      >
                        <PlusIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-xs font-medium text-ink-muted hover:text-accent"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className="border-t border-line px-5 py-4"
          style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-muted">Subtotal</span>
            <span className="font-mono text-lg font-semibold text-accent tabular-nums">
              {formatPrice(subtotalCents)}
            </span>
          </div>
          <a
            href={items.length > 0 ? buildWhatsAppOrderUrl(items, subtotalCents) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={items.length === 0}
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-semibold text-white transition ${
              items.length === 0 ? "pointer-events-none opacity-50" : "hover:brightness-105"
            }`}
          >
            <WhatsAppIcon className="h-4 w-4" />
            Finalizar pedido por WhatsApp
          </a>
          <p className="mt-2 text-center text-xs text-ink-muted">
            Confirmamos disponibilidad y envío directo por WhatsApp.
          </p>
        </div>
      </aside>
    </>
  );
}
