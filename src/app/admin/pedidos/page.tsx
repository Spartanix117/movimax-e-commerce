'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/format'
import type { FulfillmentStatus, OrderItem } from '@/lib/types'
import { AdminNav } from '@/components/admin/AdminNav'

type Order = {
  id: string
  status: 'pending' | 'paid' | 'failed'
  totalCents: number
  items: OrderItem[]
  fulfillmentStatus?: FulfillmentStatus
  trackingCarrier?: string
  trackingNumber?: string
}

type DraftByOrderId = Record<string, { fulfillmentStatus: FulfillmentStatus; trackingCarrier: string; trackingNumber: string }>

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
}

const STATUS_BADGE: Record<Order['status'], string> = {
  pending: 'bg-purple-soft text-accent',
  paid: 'bg-success-soft text-success',
  failed: 'bg-red-100 text-red-700',
}

const FULFILLMENT_LABEL: Record<FulfillmentStatus, string> = {
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
}

const inputClass =
  'w-full rounded-xl border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20'
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted'

export default function AdminPedidosPage() {
  const [adminKey, setAdminKey] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [keyInput, setKeyInput] = useState('')

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState<DraftByOrderId>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  function authHeaders() {
    return { 'Content-Type': 'application/json', 'x-admin-key': adminKey }
  }

  async function loadAll() {
    setLoading(true)
    const res = await fetch('/api/admin/orders', { headers: authHeaders() })
    const data = await res.json()
    const list: Order[] = Array.isArray(data) ? data : []
    setOrders(list)
    setDrafts(
      Object.fromEntries(
        list.map((o) => [
          o.id,
          {
            fulfillmentStatus: o.fulfillmentStatus ?? 'preparando',
            trackingCarrier: o.trackingCarrier ?? '',
            trackingNumber: o.trackingNumber ?? '',
          },
        ])
      )
    )
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (unlocked) loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked])

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    setAdminKey(keyInput)
    setUnlocked(true)
  }

  async function handleSave(orderId: string) {
    const draft = drafts[orderId]
    if (!draft) return
    setSavingId(orderId)
    setError('')

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(draft),
    })

    setSavingId(null)

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error || 'No se pudo guardar. Intenta de nuevo.')
      return
    }

    loadAll()
  }

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-5">
        <form
          onSubmit={handleUnlock}
          className="w-full max-w-sm rounded-2xl border border-line bg-paper-raised p-7 shadow-sm"
        >
          <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
            Movimax Admin
          </span>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold text-ink">Acceso de administrador</h1>
          <label className={`${labelClass} mt-6`}>Clave de administrador</label>
          <input
            type="password"
            className={inputClass}
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          <button
            type="submit"
            className="mt-5 w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Entrar
          </button>
        </form>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
          Órdenes
        </span>
        <h1 className="mt-1.5 font-display text-3xl font-extrabold text-ink">Pedidos</h1>

        {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

        {loading ? (
          <p className="mt-7 text-ink-muted">Cargando...</p>
        ) : orders.length === 0 ? (
          <p className="mt-7 text-ink-muted">Todavía no hay pedidos.</p>
        ) : (
          <div className="mt-7 flex flex-col gap-4">
            {orders.map((order) => {
              const draft = drafts[order.id]
              return (
                <div key={order.id} className="rounded-2xl border border-line bg-paper-raised p-6 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-ink-muted">{order.id}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>
                    <span className="font-mono text-lg font-bold text-accent tabular-nums">
                      {formatPrice(order.totalCents)}
                    </span>
                  </div>

                  <ul className="mb-4 list-inside list-disc text-sm text-ink-muted">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.quantity}× {item.name}
                      </li>
                    ))}
                  </ul>

                  {order.status !== 'paid' ? (
                    <p className="text-xs text-ink-muted">
                      El envío se puede capturar una vez que el pedido esté pagado.
                    </p>
                  ) : draft ? (
                    <div className="grid grid-cols-1 items-end gap-3 border-t border-line pt-4 sm:grid-cols-3">
                      <div>
                        <label className={labelClass}>Estatus de envío</label>
                        <select
                          className={inputClass}
                          value={draft.fulfillmentStatus}
                          onChange={(e) =>
                            setDrafts({
                              ...drafts,
                              [order.id]: { ...draft, fulfillmentStatus: e.target.value as FulfillmentStatus },
                            })
                          }
                        >
                          {Object.entries(FULFILLMENT_LABEL).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Paquetería</label>
                        <input
                          className={inputClass}
                          placeholder="Ej. Estafeta"
                          value={draft.trackingCarrier}
                          onChange={(e) => setDrafts({ ...drafts, [order.id]: { ...draft, trackingCarrier: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Número de rastreo</label>
                        <input
                          className={inputClass}
                          value={draft.trackingNumber}
                          onChange={(e) => setDrafts({ ...drafts, [order.id]: { ...draft, trackingNumber: e.target.value } })}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <button
                          onClick={() => handleSave(order.id)}
                          disabled={savingId === order.id}
                          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                        >
                          {savingId === order.id ? 'Guardando...' : 'Guardar envío'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
