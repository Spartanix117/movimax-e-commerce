'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BoltIcon } from '@/components/icons'

const LINKS = [
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/pedidos', label: 'Pedidos' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <header className="border-b border-white/10 bg-brand">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <BoltIcon className="h-5 w-4 shrink-0" />
          <span className="font-display text-lg font-extrabold italic">
            <span className="text-gold">Movi</span>
            <span className="text-white">Max</span>
          </span>
          <span className="rounded-full border border-white/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-[#D9CFEE]">
            Admin
          </span>
        </Link>

        <nav className="flex gap-5">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition ${
                pathname === link.href ? 'text-gold' : 'text-[#D9CFEE] hover:text-gold'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
