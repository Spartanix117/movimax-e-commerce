'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { formatPrice } from '@/lib/format'
import type { FulfillmentStatus } from '@/lib/types'

type TrackResult = {
  id: string
  status: 'pending' | 'paid' | 'failed'
  totalCents: number
  items: { name: string; quantity: number }[]
  fulfillmentStatus: FulfillmentStatus | null
  trackingCarrier: string | null
  trackingNumber: string | null
}

const STEPS: { key: FulfillmentStatus; label: string }[] = [
  { key: 'preparando', label: 'Preparando' },
  { key: 'enviado', label: 'Enviado' },
  { key: 'entregado', label: 'Entregado' },
]

export default function RastreoPage() {
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<TrackResult | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = orderId.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch(`/api/orders/${encodeURIComponent(trimmed)}/track`)
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data?.error || 'No se pudo buscar tu pedido. Intenta de nuevo.')
      return
    }
    setResult(data)
  }

  const activeStepIndex = result ? STEPS.findIndex((s) => s.key === result.fulfillmentStatus) : -1

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-14 sm:px-8">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
          Movimax
        </span>
        <h1 className="mt-1.5 font-display text-3xl font-extrabold">Rastrear pedido</h1>
        <p className="mt-2 text-ink-muted">
          Ingresa el número de pedido que te mostramos al finalizar tu compra.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-line px-4 py-3 text-sm"
            placeholder="Número de pedido"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {result && (
          <div className="mt-8 rounded-2xl border border-line bg-paper-raised p-6">
            {result.status === 'failed' ? (
              <p className="text-ink-muted">Este pedido no se completó — el pago no se concretó.</p>
            ) : result.status === 'pending' ? (
              <p className="text-ink-muted">
                Todavía estamos confirmando el pago de este pedido. Si pagaste en OXXO, puede tardar hasta
                unas horas en reflejarse.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  {STEPS.map((step, i) => (
                    <div key={step.key} className="flex flex-1 flex-col items-center text-center">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          i <= activeStepIndex ? 'bg-brand text-white' : 'bg-line text-ink-muted'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="mt-1.5 text-xs font-semibold">{step.label}</span>
                    </div>
                  ))}
                </div>

                {result.trackingNumber && (
                  <p className="mt-5 text-sm text-ink-muted">
                    {result.trackingCarrier ? `${result.trackingCarrier} — ` : ''}
                    Número de rastreo: <span className="font-mono font-semibold">{result.trackingNumber}</span>
                  </p>
                )}
              </>
            )}

            <ul className="mt-5 flex flex-col gap-1 border-t border-line pt-4 text-sm text-ink-muted">
              {result.items.map((item, i) => (
                <li key={i}>
                  {item.quantity}× {item.name}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-lg font-bold text-accent tabular-nums">
              {formatPrice(result.totalCents)}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
