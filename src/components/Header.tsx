"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { BoltIcon, CartIcon, MenuIcon, CloseIcon } from "@/components/icons";

const NAV_LINKS = [
  { href: "/catalogo", label: "Movilidad eléctrica" },
  { href: "/#ofertas", label: "Ofertas" },
  { href: "/#contacto", label: "Contacto" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, open } = useCart();

  return (
    <header
      className="sticky z-40 border-b border-white/10 bg-brand/95 backdrop-blur"
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-center justify-between gap-4 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <BoltIcon className="h-6 w-5 shrink-0" />
            <span className="font-display text-2xl font-extrabold italic">
              <span className="text-gold">Movi</span>
              <span className="text-white">Max</span>
            </span>
          </Link>

          <nav className="hidden gap-7 sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#D9CFEE] transition hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 sm:hidden"
            >
              {menuOpen ? <CloseIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
            </button>
            <button
              onClick={open}
              aria-label="Abrir carrito"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <CartIcon className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 font-mono text-[11px] font-bold text-gold-ink tabular-nums">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-white/10 py-3 sm:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-1 py-2.5 text-sm font-medium text-white hover:bg-white/10 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
