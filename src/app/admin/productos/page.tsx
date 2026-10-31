'use client'

import { useEffect, useState } from 'react'
import { getCategories } from '@/lib/products'
import type { Category } from '@/lib/types'
import { AdminNav } from '@/components/admin/AdminNav'

type Product = {
  id: string
  name: string
  slug: string
  categoryId: string
  priceCents: number
  stock: number
  spec: string
  description: string
  imageUrl?: string
}

const emptyForm = { name: '', slug: '', categoryId: '', price: '', stock: '', spec: '', description: '', imageUrl: '' }

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const inputClass =
  'w-full rounded-xl border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20'
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted'

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
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function authHeaders() {
    return { 'Content-Type': 'application/json', 'x-admin-key': adminKey }
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)

    const body = new FormData()
    body.append('file', file)
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'x-admin-key': adminKey },
      body,
    })

    setUploading(false)
    e.target.value = ''

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error || 'No se pudo subir la imagen.')
      return
    }

    const { url } = await res.json()
    setForm((f) => ({ ...f, imageUrl: url }))
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
      imageUrl: p.imageUrl ?? '',
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
      imageUrl: form.imageUrl,
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
          Catálogo
        </span>
        <h1 className="mt-1.5 font-display text-3xl font-extrabold text-ink">Administrar productos</h1>

        <form
          onSubmit={handleSubmit}
          className="mt-7 grid grid-cols-2 gap-4 rounded-2xl border border-line bg-paper-raised p-6 shadow-sm"
        >
          <div className="col-span-2">
            <label className={labelClass}>Nombre</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="col-span-2">
            <label className={labelClass}>
              Slug (URL) <span className="font-normal normal-case text-ink-muted">— se genera solo si lo dejas vacío</span>
            </label>
            <input
              className={inputClass}
              placeholder={form.name ? slugify(form.name) : ''}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              disabled={!!editingId}
            />
          </div>

          <div>
            <label className={labelClass}>Categoría</label>
            <select className={inputClass} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.comingSoon ? ' (próximamente)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Precio (MXN)</label>
            <input type="number" step="0.01" className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>

          <div>
            <label className={labelClass}>Stock</label>
            <input type="number" className={inputClass} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>

          <div>
            <label className={labelClass}>Spec corta</label>
            <input className={inputClass} value={form.spec} onChange={(e) => setForm({ ...form, spec: e.target.value })} />
          </div>

          <div className="col-span-2">
            <label className={labelClass}>Descripción</label>
            <textarea className={`${inputClass} min-h-[88px]`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="col-span-2">
            <label className={labelClass}>Foto del producto</label>
            <div className="flex items-center gap-4">
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- small admin-only preview, not worth next/image's config here
                <img src={form.imageUrl} alt="" className="h-16 w-16 rounded-xl border border-line object-cover" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-line text-[10px] text-ink-muted">
                  Sin foto
                </span>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                disabled={uploading}
                className="text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-purple-soft file:px-3 file:py-2 file:text-xs file:font-semibold file:text-accent"
              />
              {uploading && <span className="text-sm text-ink-muted">Subiendo...</span>}
            </div>
          </div>

          {error && <p className="col-span-2 text-sm font-medium text-red-600">{error}</p>}

          <div className="col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar producto'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink-muted"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <h2 className="mt-10 mb-4 font-display text-xl font-bold text-ink">
          Productos <span className="text-ink-muted">({products.length})</span>
        </h2>

        {loading ? (
          <p className="text-ink-muted">Cargando...</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  <th className="py-3 pl-5"></th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th className="pr-5"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper">
                    <td className="py-2.5 pl-5">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- small admin-only thumbnail, not worth next/image's config here
                        <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-lg border border-line object-cover" />
                      ) : (
                        <span className="block h-10 w-10 rounded-lg border border-line bg-paper" />
                      )}
                    </td>
                    <td className="font-medium text-ink">{p.name}</td>
                    <td className="text-ink-muted">{categoryName(p.categoryId)}</td>
                    <td className="font-mono text-ink">${(p.priceCents / 100).toLocaleString('es-MX')}</td>
                    <td className={p.stock > 0 ? 'text-success' : 'text-ink-muted'}>{p.stock}</td>
                    <td className="space-x-4 py-2.5 pr-5 text-right">
                      <button onClick={() => startEdit(p)} className="font-semibold text-accent hover:underline">Editar</button>
                      <button onClick={() => handleDelete(p.id)} className="font-semibold text-red-600 hover:underline">Borrar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
