'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import type { FulfillmentStatus, OrderItem } from '@/lib/types'

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

const FULFILLMENT_LABEL: Record<FulfillmentStatus, string> = {
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
}

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
      <main className="max-w-sm mx-auto px-8 py-20">
        <h1 className="text-2xl font-bold mb-6">Acceso de administrador</h1>
        <form onSubmit={handleUnlock}>
          <label className="block text-sm font-semibold mb-1">Clave de administrador</label>
          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2 mb-4"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          <button type="submit" className="bg-black text-white px-5 py-2 rounded-lg font-semibold w-full">
            Entrar
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <Link href="/admin/productos" className="text-sm font-semibold text-blue-600">
          Ir a Productos →
        </Link>
      </div>

      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Todavía no hay pedidos.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const draft = drafts[order.id]
            return (
              <div key={order.id} className="border rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="font-mono text-xs text-gray-400">{order.id}</span>
                    <span
                      className={`ml-3 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        order.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <span className="font-mono font-bold">{formatPrice(order.totalCents)}</span>
                </div>

                <ul className="text-sm text-gray-600 mb-4 list-disc list-inside">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.quantity}× {item.name}
                    </li>
                  ))}
                </ul>

                {order.status !== 'paid' ? (
                  <p className="text-xs text-gray-400">
                    El envío se puede capturar una vez que el pedido esté pagado.
                  </p>
                ) : draft ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Estatus de envío</label>
                      <select
                        className="w-full border rounded-lg px-3 py-2 text-sm"
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
                      <label className="block text-xs font-semibold mb-1">Paquetería</label>
                      <input
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="Ej. Estafeta"
                        value={draft.trackingCarrier}
                        onChange={(e) => setDrafts({ ...drafts, [order.id]: { ...draft, trackingCarrier: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Número de rastreo</label>
                      <input
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={draft.trackingNumber}
                        onChange={(e) => setDrafts({ ...drafts, [order.id]: { ...draft, trackingNumber: e.target.value } })}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <button
                        onClick={() => handleSave(order.id)}
                        disabled={savingId === order.id}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
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
  )
}
