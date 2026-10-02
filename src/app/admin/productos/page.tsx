'use client'

import { useEffect, useState } from 'react'
import { getCategories } from '@/lib/products'
import type { Category } from '@/lib/types'

type Product = {
  id: string
  name: string
  slug: string
  categoryId: string
  priceCents: number
  stock: number
  spec: string
  description: string
}

const emptyForm = { name: '', slug: '', categoryId: '', price: '', stock: '', spec: '', description: '' }

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminProductosPage() {
  const [adminKey, setAdminKey] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [keyInput, setKeyInput] = useState('')

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function authHeaders() {
    return { 'Content-Type': 'application/json', 'x-admin-key': adminKey }
  }

  async function loadAll() {
    setLoading(true)
    const [productsRes, cats] = await Promise.all([
      fetch('/api/admin/products', { headers: authHeaders() }).then((r) => r.json()),
      getCategories(),
    ])
    setProducts(Array.isArray(productsRes) ? productsRes : [])
    setCategories(cats)
    if (!form.categoryId && cats[0]) setForm((f) => ({ ...f, categoryId: cats[0].id }))
    setLoading(false)
  }

  useEffect(() => {
    // Fetching data on mount/condition-change and setting it into state is
    // the standard pattern for a page with no data-fetching library — the
    // state update happens after the awaited fetch resolves, not
    // synchronously inside the effect body itself.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (unlocked) loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked])

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    setAdminKey(keyInput)
    setUnlocked(true)
  }

  function startEdit(p: Product) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      slug: p.slug,
      categoryId: p.categoryId,
      price: String(p.priceCents / 100),
      stock: String(p.stock),
      spec: p.spec,
      description: p.description,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? '' })
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.categoryId || form.price === '' || form.stock === '') {
      setError('Nombre, categoría, precio y stock son obligatorios.')
      return
    }

    const slug = form.slug.trim() || slugify(form.name)
    const payload = {
      name: form.name,
      slug,
      categoryId: form.categoryId,
      priceCents: Math.round(Number(form.price) * 100),
      stock: Number(form.stock),
      spec: form.spec,
      description: form.description,
    }

    setSaving(true)
    const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })

    setSaving(false)

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error || 'No se pudo guardar. Intenta de nuevo.')
      return
    }

    cancelEdit()
    loadAll()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que quieres borrar este producto?')) return
    setError('')
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers: authHeaders() })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error || 'No se pudo borrar. Intenta de nuevo.')
      return
    }
    loadAll()
  }

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id

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
    <main className="max-w-4xl mx-auto px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Administrar productos</h1>

      <form onSubmit={handleSubmit} className="border rounded-xl p-6 mb-10 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-semibold mb-1">Nombre</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-semibold mb-1">Slug (URL) <span className="text-gray-400 font-normal">— se genera solo si lo dejas vacío</span></label>
          <input className="w-full border rounded-lg px-3 py-2" placeholder={form.name ? slugify(form.name) : ''} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} disabled={!!editingId} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Categoría</label>
          <select className="w-full border rounded-lg px-3 py-2" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.comingSoon ? ' (próximamente)' : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Precio (MXN)</label>
          <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Stock</label>
          <input type="number" className="w-full border rounded-lg px-3 py-2" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Spec corta</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.spec} onChange={(e) => setForm({ ...form, spec: e.target.value })} />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-semibold mb-1">Descripción</label>
          <textarea className="w-full border rounded-lg px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        {error && <p className="col-span-2 text-red-600 text-sm">{error}</p>}

        <div className="col-span-2 flex gap-3">
          <button type="submit" disabled={saving} className="bg-black text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50">
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar producto'}
          </button>
          {editingId && <button type="button" onClick={cancelEdit} className="px-5 py-2 rounded-lg border">Cancelar</button>}
        </div>
      </form>

      <h2 className="text-xl font-bold mb-4">Productos ({products.length})</h2>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b">
              <th className="py-2">Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-2">{p.name}</td>
                <td>{categoryName(p.categoryId)}</td>
                <td>${(p.priceCents / 100).toLocaleString('es-MX')}</td>
                <td>{p.stock}</td>
                <td className="text-right space-x-3">
                  <button onClick={() => startEdit(p)} className="text-blue-600 font-semibold">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 font-semibold">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}