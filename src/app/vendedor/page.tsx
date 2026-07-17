'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, Product } from '@/lib/supabase'
import { Plus, Minus, ShoppingBag, LogOut, X, Check } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const fmt = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const matchProduct = (p: Product, q: string) => {
  const haystack = norm([p.name, p.brand, p.category, p.flavor].filter(Boolean).join(' '))
  return norm(q).split(/\s+/).filter(Boolean).every(word => haystack.includes(word))
}
const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

type LineItem = { producto: string; categoria: string; cantidad: number; precio_unitario: number; costo: number; selectedProduct: Product | null; query: string }
const emptyLine = (): LineItem => ({ producto: '', categoria: 'proteinas', cantidad: 1, precio_unitario: 0, costo: 0, selectedProduct: null, query: '' })

interface VentaHoy {
  id: string
  fecha: string
  producto: string
  cantidad: number
  precio_unitario: number
  total: number
  metodo_pago: string
}

export default function VendedorPage() {
  const router = useRouter()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [items, setItems] = useState<LineItem[]>([emptyLine()])
  const [fecha, setFecha] = useState(localDate())
  const [metodo, setMetodo] = useState('mercadopago')
  const [notas, setNotas] = useState('')
  const [descuento, setDescuento] = useState(0)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [ventasHoy, setVentasHoy] = useState<VentaHoy[]>([])
  const [loadingVentas, setLoadingVentas] = useState(true)

  const fetchProducts = useCallback(() => {
    supabase.from('products').select('*').eq('active', true).order('name').then(({ data }) => setAllProducts(data || []))
  }, [])

  const fetchVentasHoy = useCallback(() => {
    const hoy = localDate()
    supabase
      .from('ventas')
      .select('id,fecha,producto,cantidad,precio_unitario,total,metodo_pago')
      .eq('fecha', hoy)
      .gt('total', 0)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setVentasHoy(data || []); setLoadingVentas(false) })
  }, [])

  useEffect(() => { fetchProducts(); fetchVentasHoy() }, [fetchProducts, fetchVentasHoy])

  const updateItem = (i: number, patch: Partial<LineItem>) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, ...patch } : it))

  const handleQuery = (i: number, val: string) => {
    updateItem(i, { query: val, producto: val, selectedProduct: null })
    setActiveIdx(i)
  }

  const selectProduct = (i: number, p: Product) => {
    updateItem(i, { query: p.name, producto: p.name, categoria: p.category || 'otros', precio_unitario: p.price, costo: p.costo ?? 0, selectedProduct: p })
    setActiveIdx(null)
  }

  const suggestions = (i: number) => {
    const q = items[i].query
    if (norm(q).length < 2) return []
    const matches = allProducts.filter(p => matchProduct(p, q))
    const starts = matches.filter(p => norm(p.name).startsWith(norm(q)))
    return [...starts, ...matches.filter(p => !norm(p.name).startsWith(norm(q)))].slice(0, 10)
  }

  const subtotal = items.reduce((s, it) => s + it.precio_unitario * it.cantidad, 0)
  const total = Math.max(0, subtotal - descuento)

  const save = async () => {
    const valid = items.filter(it => it.producto && it.precio_unitario > 0)
    if (valid.length === 0) return
    setSaving(true)
    const grupoId = crypto.randomUUID()
    const notasConGrupo = `__g:${grupoId}__|${notas}`
    for (const it of valid) {
      await supabase.from('ventas').insert({
        fecha, producto: it.producto, categoria: it.categoria,
        cantidad: it.cantidad, precio_unitario: it.precio_unitario,
        costo: it.costo, total: it.precio_unitario * it.cantidad,
        metodo_pago: metodo, notas: notasConGrupo,
      })
      if (it.selectedProduct) {
        const newStock = Math.max(0, (it.selectedProduct.stock || 0) - it.cantidad)
        await supabase.from('products').update({ stock: newStock }).eq('id', it.selectedProduct.id)
      }
    }
    if (descuento > 0) {
      await supabase.from('ventas').insert({
        fecha, producto: 'Descuento', categoria: 'otros',
        cantidad: 1, precio_unitario: -descuento, costo: 0,
        total: -descuento, metodo_pago: metodo, notas: notasConGrupo,
      })
    }
    setSaving(false)
    setSaved(true)
    setItems([emptyLine()])
    setDescuento(0)
    setNotas('')
    fetchVentasHoy()
    fetchProducts()
    setTimeout(() => setSaved(false), 3000)
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', body: JSON.stringify({ tipo: 'vendedor' }) })
    router.push('/login/vendedor')
  }

  const totalHoy = ventasHoy.reduce((s, v) => s + v.total, 0)

  const metodoBadge = (m: string) => {
    const map: Record<string, string> = { efectivo: 'bg-green-900 text-green-300', mercadopago: 'bg-blue-900 text-blue-300', transferencia: 'bg-purple-900 text-purple-300', tiendanube: 'bg-orange-900 text-orange-300' }
    return map[m] || 'bg-zinc-800 text-zinc-400'
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Cuatrouno" width={90} height={32} />
          <span className="text-zinc-600 text-sm">Panel de Ventas</span>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm transition-colors">
          <LogOut size={14} /> Salir
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* Form nueva venta */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
            <ShoppingBag size={16} className="text-yellow-400" />
            <h2 className="text-white font-black text-base">Nueva Venta</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* Fecha + método */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-500 text-xs mb-1 block">Fecha</label>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-zinc-500 text-xs mb-1 block">Método de pago</label>
                <select value={metodo} onChange={e => setMetodo(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400">
                  <option value="efectivo">Efectivo</option>
                  <option value="mercadopago">MercadoPago</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tiendanube">TiendaNube</option>
                </select>
              </div>
            </div>

            {/* Productos */}
            <div className="space-y-3">
              {items.map((it, i) => (
                <div key={i} className="bg-zinc-800 rounded-xl p-3 space-y-2">
                  {/* Buscador */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={it.query}
                      onChange={e => handleQuery(i, e.target.value)}
                      onFocus={() => it.query.length > 1 && setActiveIdx(i)}
                      onBlur={() => setTimeout(() => setActiveIdx(null), 150)}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
                    />
                    {activeIdx === i && suggestions(i).length > 0 && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-700 border border-zinc-600 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                        {suggestions(i).map(p => (
                          <button key={p.id} type="button" onMouseDown={() => selectProduct(i, p)}
                            className="w-full text-left px-3 py-2.5 hover:bg-zinc-600 transition-colors flex items-center justify-between gap-2 border-b border-zinc-600 last:border-0">
                            <div className="min-w-0">
                              <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                              <p className="text-zinc-400 text-xs">stock: {p.stock}</p>
                            </div>
                            <p className="text-yellow-400 text-sm font-black shrink-0">{fmt(p.price)}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Cantidad + precio + quitar */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-zinc-700 rounded-lg px-3 py-1.5">
                      <button onClick={() => updateItem(i, { cantidad: Math.max(1, it.cantidad - 1) })} className="text-zinc-400 hover:text-white">
                        <Minus size={12} />
                      </button>
                      <span className="text-white font-black text-sm w-5 text-center">{it.cantidad}</span>
                      <button onClick={() => updateItem(i, { cantidad: it.cantidad + 1 })} className="text-zinc-400 hover:text-white">
                        <Plus size={12} />
                      </button>
                    </div>
                    <input
                      type="number"
                      placeholder="Precio"
                      value={it.precio_unitario || ''}
                      onChange={e => updateItem(i, { precio_unitario: Number(e.target.value) })}
                      className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-yellow-400"
                    />
                    {it.precio_unitario > 0 && (
                      <span className="text-yellow-400 font-black text-sm shrink-0">{fmt(it.precio_unitario * it.cantidad)}</span>
                    )}
                    {items.length > 1 && (
                      <button onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} className="text-zinc-600 hover:text-red-400">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {it.selectedProduct && (
                    <p className="text-xs text-green-400">✓ Stock actual: {it.selectedProduct.stock}</p>
                  )}
                </div>
              ))}
              <button onClick={() => setItems(prev => [...prev, emptyLine()])}
                className="w-full text-zinc-500 hover:text-yellow-400 text-sm py-2 transition-colors">
                + Agregar producto
              </button>
            </div>

            {/* Descuento + notas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-500 text-xs mb-1 block">Descuento ($)</label>
                <input type="number" placeholder="0" value={descuento || ''}
                  onChange={e => setDescuento(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-zinc-500 text-xs mb-1 block">Notas</label>
                <input type="text" value={notas} onChange={e => setNotas(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>
            </div>

            {/* Total */}
            {subtotal > 0 && (
              <div className="bg-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Total a cobrar</span>
                <span className="text-yellow-400 font-black text-xl">{fmt(total)}</span>
              </div>
            )}

            <button onClick={save} disabled={saving || items.every(it => !it.producto)}
              className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-black py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              {saved ? <><Check size={18} /> ¡Venta registrada!</> : saving ? 'Guardando...' : 'Registrar Venta'}
            </button>
          </div>
        </div>

        {/* Ventas del día */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-white font-black text-base">Ventas de hoy</h2>
            {totalHoy > 0 && <span className="text-yellow-400 font-black text-sm">{fmt(totalHoy)}</span>}
          </div>
          {loadingVentas ? (
            <p className="text-zinc-600 text-sm text-center py-8">Cargando...</p>
          ) : ventasHoy.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">Sin ventas hoy todavía</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {ventasHoy.map(v => (
                <div key={v.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{v.producto}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-zinc-500 text-xs">x{v.cantidad}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${metodoBadge(v.metodo_pago)}`}>{v.metodo_pago}</span>
                    </div>
                  </div>
                  <span className="text-white font-black text-sm shrink-0">{fmt(v.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
