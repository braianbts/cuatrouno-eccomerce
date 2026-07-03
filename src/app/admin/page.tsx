'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, Product } from '@/lib/supabase'
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, LogOut, Package, BarChart2, ShoppingBag, TrendingDown, RefreshCw, DollarSign, X, Check, ChevronDown, Activity } from 'lucide-react'
import ProductForm from '@/components/admin/ProductForm'
import Image from 'next/image'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Venta {
  id: string
  fecha: string
  producto: string
  categoria: string
  cantidad: number
  precio_unitario: number
  total: number
  metodo_pago: string
  costo: number
  ganancia: number
  notas?: string
  created_at: string
  factura_emitida?: boolean
  factura_numero?: number
  factura_cae?: string
  factura_vto_cae?: string
}

interface Gasto {
  id: string
  fecha: string
  descripcion: string
  categoria: string
  monto: number
  metodo_pago: string
  notas?: string
  created_at: string
}

interface Movimiento {
  id: string
  fecha: string
  producto: string
  tipo: string
  cantidad: number
  precio_unitario: number
  total: number
  motivo?: string
  created_at: string
}

interface CajaEntry {
  id: string
  fecha: string
  tipo: string
  monto: number
  descripcion?: string
  metodo_pago: string
  created_at: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
const fmtNum = (n: number) => new Intl.NumberFormat('es-AR').format(n)
const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'ventas', label: 'Ventas', icon: ShoppingBag },
  { id: 'gastos', label: 'Gastos', icon: TrendingDown },
  { id: 'movimientos', label: 'Movimientos', icon: RefreshCw },
  { id: 'caja', label: 'Caja', icon: DollarSign },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'visitas', label: 'Visitas', icon: Activity },
]

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color = 'yellow' }: { label: string; value: string; sub?: string; color?: 'yellow' | 'green' | 'red' | 'white' }) {
  const colors = {
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    red: 'text-red-400',
    white: 'text-white',
  }
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">{label}</p>
      <p className={`font-black text-2xl ${colors[color]}`}>{value}</p>
      {sub && <p className="text-zinc-600 text-xs mt-1">{sub}</p>}
    </div>
  )
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className={`bg-zinc-900 border border-zinc-700 rounded-2xl w-full flex flex-col ${wide ? 'max-w-5xl' : 'max-w-md'}`} style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
          <h3 className="text-white font-black text-lg">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400"
const selectCls = inputCls

// ─── Venta Form ──────────────────────────────────────────────────────────────

type LineItem = { producto: string; categoria: string; cantidad: number; precio_unitario: number; costo: number; selectedProduct: Product | null; query: string }
const emptyLine = (): LineItem => ({ producto: '', categoria: 'proteinas', cantidad: 1, precio_unitario: 0, costo: 0, selectedProduct: null, query: '' })

function VentaForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [fecha, setFecha] = useState(localDate())
  const [metodo_pago, setMetodoPago] = useState('mercadopago')
  const [notas, setNotas] = useState('')
  const [descuento, setDescuento] = useState(0)
  const [items, setItems] = useState<LineItem[]>([emptyLine()])
  const [saving, setSaving] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  useEffect(() => {
    supabase.from('products').select('*').eq('active', true).order('name').then(({ data }) => setAllProducts(data || []))
  }, [])

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
    const q = norm(items[i].query)
    if (q.length < 2) return []
    const matches = allProducts.filter(p => norm(p.name).includes(q))
    const starts = matches.filter(p => norm(p.name).startsWith(q))
    const rest = matches.filter(p => !norm(p.name).startsWith(q))
    return [...starts, ...rest].slice(0, 12)
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
        metodo_pago, notas: notasConGrupo,
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
        total: -descuento, metodo_pago, notas: notasConGrupo,
      })
    }

    setSaving(false)
    onSave()
  }

  return (
    <Modal title="Nueva Venta" onClose={onClose} wide>
      {/* Header fijo */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Fecha"><input type="date" className={inputCls} value={fecha} onChange={e => setFecha(e.target.value)} /></Field>
        <Field label="Método">
          <select className={selectCls} value={metodo_pago} onChange={e => setMetodoPago(e.target.value)}>
            <option value="efectivo">Efectivo</option>
            <option value="mercadopago">MercadoPago</option>
            <option value="transferencia">Transferencia</option>
            <option value="tiendanube">TiendaNube</option>
          </select>
        </Field>
      </div>

      {/* Tabla productos */}
      <div className="border border-zinc-700 rounded-xl mb-3">
        {/* Header */}
        <div className="grid grid-cols-[1fr_64px_110px_100px_32px] gap-2 bg-zinc-800 px-3 py-2 rounded-t-xl border-b border-zinc-700">
          {['Producto','Cant.','Precio vta.','Costo',''].map(h => (
            <span key={h} className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{h}</span>
          ))}
        </div>

        {/* Rows — overflow visible para que el dropdown escape */}
        <div className="divide-y divide-zinc-800">
          {items.map((it, i) => (
            <div key={i} className="px-3 py-2.5 space-y-1.5">
              <div className="grid grid-cols-[1fr_64px_110px_100px_32px] gap-2 items-center">
                {/* Buscador */}
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
                    placeholder="Buscar producto..."
                    value={it.query}
                    onChange={e => handleQuery(i, e.target.value)}
                    onFocus={() => it.query.length > 1 && setActiveIdx(i)}
                    onBlur={() => setTimeout(() => setActiveIdx(null), 150)}
                  />
                  {activeIdx === i && suggestions(i).length > 0 && (
                    <div className="absolute z-[100] top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-600 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
                      {suggestions(i).map(p => (
                        <button key={p.id} type="button" onMouseDown={() => selectProduct(i, p)}
                          className="w-full text-left px-3 py-2 hover:bg-zinc-700 transition-colors flex items-center justify-between gap-3 border-b border-zinc-700 last:border-0">
                          <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                            <p className="text-zinc-400 text-xs">{p.category} · stock: {p.stock}</p>
                          </div>
                          <p className="text-yellow-400 text-sm font-black flex-shrink-0">${p.price.toLocaleString('es-AR')}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input type="number" min="1" value={it.cantidad}
                  onChange={e => updateItem(i, { cantidad: Number(e.target.value) })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-yellow-400" />
                <input type="number" placeholder="0" value={it.precio_unitario || ''}
                  onChange={e => updateItem(i, { precio_unitario: Number(e.target.value) })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
                <input type="number" placeholder="0" value={it.costo || ''}
                  onChange={e => updateItem(i, { costo: Number(e.target.value) })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
                <button type="button" onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}
                  className={`text-zinc-600 hover:text-red-400 transition-colors text-xl leading-none text-center ${items.length === 1 ? 'invisible' : ''}`}>×</button>
              </div>
              {it.selectedProduct && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-green-400">✓ Stock: {it.selectedProduct.stock} → quedará {Math.max(0, it.selectedProduct.stock - it.cantidad)}</span>
                  {it.precio_unitario > 0 && <span className="text-yellow-400 text-xs font-black ml-auto">{fmt(it.precio_unitario * it.cantidad)}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={() => setItems(prev => [...prev, emptyLine()])}
          className="w-full text-zinc-500 hover:text-yellow-400 hover:bg-zinc-800/50 text-xs font-black py-2.5 transition-colors border-t border-zinc-700 rounded-b-xl">
          + Agregar producto
        </button>
      </div>

      {/* Footer fijo */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Descuento ($)">
          <input type="number" className={inputCls} placeholder="0" value={descuento || ''} onChange={e => setDescuento(Number(e.target.value))} />
        </Field>
        <Field label="Notas">
          <input type="text" className={inputCls} value={notas} onChange={e => setNotas(e.target.value)} />
        </Field>
      </div>

      {subtotal > 0 && (
        <div className="bg-zinc-800 rounded-lg px-3 py-2 mb-3 flex gap-4 text-sm justify-end items-center">
          <span className="text-zinc-400">Subtotal <span className="text-white font-bold">{fmt(subtotal)}</span></span>
          {descuento > 0 && <span className="text-red-400">Desc. <span className="font-bold">−{fmt(descuento)}</span></span>}
          <span className="text-yellow-400 font-black text-base">Total {fmt(total)}</span>
        </div>
      )}

      <button onClick={save} disabled={saving} className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-3 rounded-xl">
        {saving ? 'Guardando...' : `Guardar Venta${items.length > 1 ? ` (${items.length} productos)` : ''}`}
      </button>
    </Modal>
  )
}

// ─── Gasto Form ──────────────────────────────────────────────────────────────

function GastoForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ fecha: localDate(), descripcion: '', categoria: 'mercaderia', monto: 0, metodo_pago: 'efectivo', notas: '' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.descripcion || !form.monto) return
    setSaving(true)
    await supabase.from('gastos').insert({ ...form, monto: Number(form.monto) })
    setSaving(false)
    onSave()
  }

  return (
    <Modal title="Nuevo Gasto" onClose={onClose}>
      <Field label="Fecha"><input type="date" className={inputCls} value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} /></Field>
      <Field label="Descripción"><input type="text" className={inputCls} placeholder="Ej: Reposición Star Whey" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoría">
          <select className={selectCls} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
            {['mercaderia','alquiler','servicios','marketing','logistica','administrativo','varios'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Método">
          <select className={selectCls} value={form.metodo_pago} onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value }))}>
            <option value="efectivo">Efectivo</option>
            <option value="mercadopago">MercadoPago</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </Field>
      </div>
      <Field label="Monto"><input type="number" className={inputCls} placeholder="0" value={form.monto || ''} onChange={e => setForm(f => ({ ...f, monto: Number(e.target.value) }))} /></Field>
      <Field label="Notas (opcional)"><input type="text" className={inputCls} value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} /></Field>
      <button onClick={save} disabled={saving} className="w-full bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-black py-3 rounded-xl mt-2">
        {saving ? 'Guardando...' : 'Registrar Gasto'}
      </button>
    </Modal>
  )
}

// ─── Movimiento Form ──────────────────────────────────────────────────────────

function MovimientoForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ fecha: localDate(), producto: '', tipo: 'entrada', cantidad: 1, precio_unitario: 0, motivo: '' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.producto || !form.cantidad) return
    setSaving(true)
    const total = Number(form.precio_unitario) * Number(form.cantidad)
    await supabase.from('movimientos').insert({ ...form, total, cantidad: Number(form.cantidad), precio_unitario: Number(form.precio_unitario) })
    setSaving(false)
    onSave()
  }

  return (
    <Modal title="Nuevo Movimiento" onClose={onClose}>
      <Field label="Fecha"><input type="date" className={inputCls} value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} /></Field>
      <Field label="Producto"><input type="text" className={inputCls} placeholder="Ej: Star Whey 2lb" value={form.producto} onChange={e => setForm(f => ({ ...f, producto: e.target.value }))} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo">
          <select className={selectCls} value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
            <option value="entrada">Entrada (compra)</option>
            <option value="salida">Salida (venta)</option>
            <option value="ajuste">Ajuste</option>
            <option value="devolucion">Devolución</option>
          </select>
        </Field>
        <Field label="Cantidad"><input type="number" className={inputCls} min="1" value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: Number(e.target.value) }))} /></Field>
      </div>
      <Field label="Precio unitario (costo)"><input type="number" className={inputCls} placeholder="0" value={form.precio_unitario || ''} onChange={e => setForm(f => ({ ...f, precio_unitario: Number(e.target.value) }))} /></Field>
      <Field label="Motivo"><input type="text" className={inputCls} placeholder="Ej: Reposición mensual" value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} /></Field>
      <button onClick={save} disabled={saving} className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-black py-3 rounded-xl mt-2">
        {saving ? 'Guardando...' : 'Registrar Movimiento'}
      </button>
    </Modal>
  )
}

// ─── Caja Form ────────────────────────────────────────────────────────────────

function CajaForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ fecha: localDate(), tipo: 'ingreso', monto: 0, descripcion: '', metodo_pago: 'efectivo' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.monto) return
    setSaving(true)
    await supabase.from('caja').insert({ ...form, monto: Number(form.monto) })
    setSaving(false)
    onSave()
  }

  return (
    <Modal title="Movimiento de Caja" onClose={onClose}>
      <Field label="Fecha"><input type="date" className={inputCls} value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo">
          <select className={selectCls} value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
            <option value="apertura">Apertura</option>
            <option value="cierre">Cierre</option>
          </select>
        </Field>
        <Field label="Método">
          <select className={selectCls} value={form.metodo_pago} onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value }))}>
            <option value="efectivo">Efectivo</option>
            <option value="mercadopago">MercadoPago</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </Field>
      </div>
      <Field label="Monto"><input type="number" className={inputCls} placeholder="0" value={form.monto || ''} onChange={e => setForm(f => ({ ...f, monto: Number(e.target.value) }))} /></Field>
      <Field label="Descripción"><input type="text" className={inputCls} placeholder="Ej: Ventas del día" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} /></Field>
      <button onClick={save} disabled={saving} className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black py-3 rounded-xl mt-2">
        {saving ? 'Guardando...' : 'Registrar en Caja'}
      </button>
    </Modal>
  )
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const hoy = localDate(now)

  useEffect(() => {
    Promise.all([
      supabase.from('ventas').select('*').gte('fecha', `${mesActual}-01`),
      supabase.from('gastos').select('*').gte('fecha', `${mesActual}-01`),
    ]).then(([v, g]) => {
      setVentas(v.data || [])
      setGastos(g.data || [])
      setLoading(false)
    })
  }, [mesActual])

  const ventasMes = ventas.reduce((s, v) => s + v.total, 0)
  const ventasHoy = ventas.filter(v => v.fecha === hoy).reduce((s, v) => s + v.total, 0)
  const ticketsMes = ventas.length
  const ticketsHoy = ventas.filter(v => v.fecha === hoy).length
  const ticketProm = ticketsMes > 0 ? ventasMes / ticketsMes : 0
  const ganBruta = ventas.reduce((s, v) => s + (v.ganancia || v.total - v.costo * v.cantidad), 0)
  const gastosMes = gastos.reduce((s, g) => s + g.monto, 0)
  const ganNeta = ganBruta - gastosMes
  const margenBruto = ventasMes > 0 ? (ganBruta / ventasMes) * 100 : 0
  const margenNeto = ventasMes > 0 ? (ganNeta / ventasMes) * 100 : 0

  // Top productos
  const topMap: Record<string, { total: number; units: number }> = {}
  ventas.forEach(v => {
    if (!topMap[v.producto]) topMap[v.producto] = { total: 0, units: 0 }
    topMap[v.producto].total += v.total
    topMap[v.producto].units += v.cantidad
  })
  const top5 = Object.entries(topMap).sort((a, b) => b[1].total - a[1].total).slice(0, 5)

  // Métodos de pago
  const metodos: Record<string, { total: number; tickets: number }> = {}
  ventas.forEach(v => {
    if (!metodos[v.metodo_pago]) metodos[v.metodo_pago] = { total: 0, tickets: 0 }
    metodos[v.metodo_pago].total += v.total
    metodos[v.metodo_pago].tickets++
  })

  if (loading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-zinc-900 rounded-xl h-24 animate-pulse" />)}</div>

  return (
    <div className="space-y-6">
      {/* Month label */}
      <div className="flex items-center gap-2">
        <span className="text-zinc-500 text-xs uppercase tracking-widest">Mes:</span>
        <span className="text-yellow-400 text-xs font-black uppercase">{now.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Ventas HOY" value={fmt(ventasHoy)} sub={`${ticketsHoy} tickets`} color="yellow" />
        <KpiCard label="Ventas MES" value={fmt(ventasMes)} sub={`${ticketsMes} tickets`} color="white" />
        <KpiCard label="Ticket promedio" value={fmt(ticketProm)} color="white" />
        <KpiCard label="Margen bruto" value={`${margenBruto.toFixed(1)}%`} color="green" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <KpiCard label="Ganancia bruta" value={fmt(ganBruta)} color="green" />
        <KpiCard label="Gastos del mes" value={fmt(gastosMes)} color="red" />
        <KpiCard label={`Ganancia neta (${margenNeto.toFixed(1)}%)`} value={fmt(ganNeta)} color={ganNeta >= 0 ? 'green' : 'red'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Productos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-400 text-[10px] uppercase tracking-widest mb-4">Top Productos del Mes</p>
          <div className="space-y-3">
            {top5.map(([producto, data], i) => (
              <div key={producto} className="flex items-center gap-3">
                <span className="text-zinc-600 text-xs w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{producto}</p>
                  <p className="text-zinc-500 text-xs">{fmtNum(data.units)} unidades</p>
                </div>
                <p className="text-yellow-400 font-black text-sm">{fmt(data.total)}</p>
              </div>
            ))}
            {top5.length === 0 && <p className="text-zinc-600 text-xs">Sin ventas registradas</p>}
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-400 text-[10px] uppercase tracking-widest mb-4">Métodos de Pago</p>
          <div className="space-y-3">
            {Object.entries(metodos).map(([metodo, data]) => {
              const pct = ventasMes > 0 ? (data.total / ventasMes) * 100 : 0
              return (
                <div key={metodo}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white capitalize">{metodo}</span>
                    <span className="text-zinc-400">{fmt(data.total)} <span className="text-zinc-600">({pct.toFixed(1)}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {Object.keys(metodos).length === 0 && <p className="text-zinc-600 text-xs">Sin datos</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Ventas Tab ───────────────────────────────────────────────────────────────

const parseGrupoId = (notas: string | null | undefined) => { const m = (notas || '').match(/^__g:([^_]+)__\|/); return m ? m[1] : null }
const parseNotas = (notas: string | null | undefined) => (notas || '').replace(/^__g:[^_]+__\|/, '')
type VentaGrupo = { grupoId: string | null; key: string; items: Venta[]; descuento: number; total: number; fecha: string; metodo_pago: string; notas: string }

function buildAfipVisorUrl(v: Venta, grupoTotal: number, puntoVenta = 4): string {
  const data = {
    ver: 1,
    fecha: v.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    cuit: 20398279442,
    ptoVta: puntoVenta,
    tipoCmp: 11,
    nroCmp: v.factura_numero,
    importe: grupoTotal,
    moneda: 'PES',
    ctz: 1,
    tipoDocRec: 99,
    nroDocRec: 0,
    tipoCodAut: 'E',
    codAut: Number(v.factura_cae),
  }
  const b64 = btoa(JSON.stringify(data))
  return `https://www.afip.gob.ar/fe/qr/?p=${b64}`
}

function buildGrupos(ventas: Venta[]): VentaGrupo[] {
  const map = new Map<string, VentaGrupo>()
  const order: VentaGrupo[] = []
  for (const v of ventas) {
    const gid = parseGrupoId(v.notas)
    if (gid) {
      if (!map.has(gid)) {
        const g: VentaGrupo = { grupoId: gid, key: gid, items: [], descuento: 0, total: 0, fecha: v.fecha, metodo_pago: v.metodo_pago, notas: parseNotas(v.notas) }
        map.set(gid, g); order.push(g)
      }
      const g = map.get(gid)!
      if (v.producto === 'Descuento') g.descuento += Math.abs(v.total)
      else g.items.push(v)
      g.total += v.total
    } else {
      order.push({ grupoId: null, key: v.id, items: [v], descuento: 0, total: v.total, fecha: v.fecha, metodo_pago: v.metodo_pago, notas: parseNotas(v.notas) })
    }
  }
  return order
}

function VentasTab() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [emitiendo, setEmitiendo] = useState<string | null>(null)

  const emitirFactura = async (g: VentaGrupo) => {
    if (!confirm(`¿Emitir Factura C por ${fmt(g.total)}?`)) return
    setEmitiendo(g.key)
    try {
      const ventaId = g.items[0].id
      const res = await fetch('/api/factura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ventaId, importe: g.total }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      fetch_()
      if (data.urlVisor && confirm(`✅ Factura C N° ${data.numero}\nCAE: ${data.cae}\nVto: ${data.vencimientoCAE}\n\n¿Ver comprobante en AFIP?`)) {
        window.open(data.urlVisor, '_blank')
      }
    } catch (err: unknown) {
      alert(`❌ Error: ${err instanceof Error ? err.message : 'desconocido'}`)
    } finally {
      setEmitiendo(null)
    }
  }

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('ventas').select('*').order('fecha', { ascending: false }).order('created_at', { ascending: false }).limit(200)
    setVentas(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  const filtered = search ? ventas.filter(v => norm(v.producto).includes(norm(search)) || v.metodo_pago.includes(norm(search))) : ventas
  const totalFiltrado = filtered.reduce((s, v) => s + v.total, 0)
  const grupos = buildGrupos(filtered)

  const delGrupo = async (g: VentaGrupo) => {
    if (!confirm(`¿Eliminar esta venta${g.items.length > 1 ? ` (${g.items.length} productos)` : ''}?`)) return
    const allRows = g.grupoId ? ventas.filter(v => parseGrupoId(v.notas) === g.grupoId) : g.items
    const ids = allRows.map(v => v.id)
    for (const id of ids) await supabase.from('ventas').delete().eq('id', id)
    setVentas(prev => prev.filter(v => !ids.includes(v.id)))
  }

  const toggle = (key: string) => setExpanded(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  const METODO_COLORS: Record<string, string> = { efectivo: 'text-green-400', mercadopago: 'text-blue-400', tiendanube: 'text-purple-400', transferencia: 'text-yellow-400' }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-black">{fmtNum(grupos.length)} ventas</p>
          <p className="text-yellow-400 text-sm font-bold">{fmt(totalFiltrado)}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> Nueva Venta
        </button>
      </div>
      <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm mb-4 focus:outline-none focus:border-yellow-400" />
      {showForm && <VentaForm onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); fetch_() }} />}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-zinc-900 rounded-xl h-14 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {grupos.map(g => {
            const isMulti = g.items.length > 1 || g.descuento > 0
            const isOpen = expanded.has(g.key)
            const label = isMulti ? `${g.items.length} producto${g.items.length !== 1 ? 's' : ''}${g.descuento > 0 ? ` · desc. ${fmt(g.descuento)}` : ''}` : g.items[0]?.producto || ''
            return (
              <div key={g.key} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className={`p-3 flex items-center gap-3 ${isMulti ? 'cursor-pointer hover:bg-zinc-800/50' : ''}`} onClick={() => isMulti && toggle(g.key)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{label}</p>
                    <p className="text-zinc-500 text-xs">{g.fecha} · <span className={METODO_COLORS[g.metodo_pago] || 'text-zinc-400'}>{g.metodo_pago}</span>{g.notas && <span className="text-zinc-600"> · {g.notas}</span>}</p>
                  </div>
                  <p className="text-yellow-400 font-black text-sm flex-shrink-0">{fmt(g.total)}</p>
                  {g.items[0]?.factura_emitida
                    ? <button onClick={e => { e.stopPropagation(); window.open(buildAfipVisorUrl(g.items[0], g.total, 4), '_blank') }} className="text-[9px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-400/30 hover:border-emerald-400 px-1.5 py-0.5 rounded flex-shrink-0 transition-colors">F.C #{g.items[0].factura_numero}</button>
                    : <button onClick={e => { e.stopPropagation(); emitirFactura(g) }} disabled={emitiendo === g.key} className="text-[9px] font-black uppercase tracking-wider text-zinc-400 hover:text-white border border-zinc-700 hover:border-white/40 px-1.5 py-0.5 rounded flex-shrink-0 transition-colors disabled:opacity-50">{emitiendo === g.key ? '...' : 'Facturar'}</button>
                  }
                  {isMulti && <span className="text-zinc-500 text-[10px]">{isOpen ? '▲' : '▼'}</span>}
                  <button onClick={e => { e.stopPropagation(); delGrupo(g) }} className="text-zinc-600 hover:text-red-400 p-1 flex-shrink-0"><Trash2 size={14} /></button>
                </div>
                {isMulti && isOpen && (
                  <div className="border-t border-zinc-800 divide-y divide-zinc-800">
                    {g.items.map(v => (
                      <div key={v.id} className="px-4 py-2 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-300 text-xs font-semibold truncate">{v.producto}</p>
                          <p className="text-zinc-600 text-xs">{v.cantidad} u · {fmt(v.precio_unitario)} c/u</p>
                        </div>
                        <p className="text-yellow-400 text-xs font-black">{fmt(v.total)}</p>
                      </div>
                    ))}
                    {g.descuento > 0 && (
                      <div className="px-4 py-2 flex justify-between">
                        <p className="text-zinc-500 text-xs">Descuento</p>
                        <p className="text-red-400 text-xs font-black">−{fmt(g.descuento)}</p>
                      </div>
                    )}
                    <div className="px-4 py-2 flex justify-between bg-zinc-800/60">
                      <p className="text-zinc-400 text-xs font-black uppercase tracking-widest">Total</p>
                      <p className="text-yellow-400 text-sm font-black">{fmt(g.total)}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {grupos.length === 0 && <p className="text-zinc-600 text-center py-12 text-sm">Sin ventas registradas</p>}
        </div>
      )}
    </div>
  )
}

// ─── Gastos Tab ───────────────────────────────────────────────────────────────

function GastosTab() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('gastos').select('*').order('fecha', { ascending: false }).limit(200)
    setGastos(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  const total = gastos.reduce((s, g) => s + g.monto, 0)

  const del = async (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return
    await supabase.from('gastos').delete().eq('id', id)
    setGastos(prev => prev.filter(g => g.id !== id))
  }

  const CAT_COLORS: Record<string, string> = { mercaderia: 'bg-blue-900 text-blue-300', alquiler: 'bg-red-900 text-red-300', servicios: 'bg-yellow-900 text-yellow-300', marketing: 'bg-purple-900 text-purple-300', logistica: 'bg-green-900 text-green-300', administrativo: 'bg-zinc-700 text-zinc-300', varios: 'bg-zinc-800 text-zinc-400' }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-black">{gastos.length} gastos</p>
          <p className="text-red-400 text-sm font-bold">{fmt(total)}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-black px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> Nuevo Gasto
        </button>
      </div>

      {showForm && <GastoForm onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); fetch_() }} />}

      {loading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-zinc-900 rounded-xl h-14 animate-pulse" />)}</div> : (
        <div className="space-y-2">
          {gastos.map(g => (
            <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{g.descripcion}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${CAT_COLORS[g.categoria] || 'bg-zinc-800 text-zinc-400'}`}>{g.categoria}</span>
                  <span className="text-zinc-500 text-xs">{g.fecha} · {g.metodo_pago}</span>
                </div>
              </div>
              <p className="text-red-400 font-black text-sm">{fmt(g.monto)}</p>
              <button onClick={() => del(g.id)} className="text-zinc-600 hover:text-red-400 p-1"><Trash2 size={14} /></button>
            </div>
          ))}
          {gastos.length === 0 && <p className="text-zinc-600 text-center py-12 text-sm">Sin gastos registrados</p>}
        </div>
      )}
    </div>
  )
}

// ─── Movimientos Tab ──────────────────────────────────────────────────────────

function MovimientosTab() {
  const [movs, setMovs] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('movimientos').select('*').order('fecha', { ascending: false }).limit(200)
    setMovs(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  const del = async (id: string) => {
    if (!confirm('¿Eliminar?')) return
    await supabase.from('movimientos').delete().eq('id', id)
    setMovs(prev => prev.filter(m => m.id !== id))
  }

  const TIPO_STYLE: Record<string, string> = { entrada: 'text-green-400', salida: 'text-red-400', ajuste: 'text-yellow-400', devolucion: 'text-blue-400' }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-white font-black">{movs.length} movimientos</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-black px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {showForm && <MovimientoForm onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); fetch_() }} />}

      {loading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-zinc-900 rounded-xl h-14 animate-pulse" />)}</div> : (
        <div className="space-y-2">
          {movs.map(m => (
            <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{m.producto}</p>
                <p className="text-zinc-500 text-xs">{m.fecha} · {m.motivo || '—'}</p>
              </div>
              <div className="text-right">
                <p className={`font-black text-sm ${TIPO_STYLE[m.tipo] || 'text-white'}`}>{m.tipo === 'entrada' ? '+' : '-'}{fmtNum(m.cantidad)} u</p>
                {m.total > 0 && <p className="text-zinc-500 text-xs">{fmt(m.total)}</p>}
              </div>
              <button onClick={() => del(m.id)} className="text-zinc-600 hover:text-red-400 p-1"><Trash2 size={14} /></button>
            </div>
          ))}
          {movs.length === 0 && <p className="text-zinc-600 text-center py-12 text-sm">Sin movimientos registrados</p>}
        </div>
      )}
    </div>
  )
}

// ─── Caja Tab ─────────────────────────────────────────────────────────────────

function CajaTab() {
  const [entries, setEntries] = useState<CajaEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('caja').select('*').order('fecha', { ascending: false }).order('created_at', { ascending: false }).limit(100)
    setEntries(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  const ingresos = entries.filter(e => ['ingreso', 'apertura'].includes(e.tipo)).reduce((s, e) => s + e.monto, 0)
  const egresos = entries.filter(e => ['egreso', 'cierre'].includes(e.tipo)).reduce((s, e) => s + e.monto, 0)
  const saldo = ingresos - egresos

  const del = async (id: string) => {
    if (!confirm('¿Eliminar?')) return
    await supabase.from('caja').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div>
      {/* Saldo summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Ingresos</p>
          <p className="text-green-400 font-black">{fmt(ingresos)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Egresos</p>
          <p className="text-red-400 font-black">{fmt(egresos)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Saldo</p>
          <p className={`font-black ${saldo >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>{fmt(saldo)}</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-black px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> Movimiento
        </button>
      </div>

      {showForm && <CajaForm onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); fetch_() }} />}

      {loading ? <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-zinc-900 rounded-xl h-14 animate-pulse" />)}</div> : (
        <div className="space-y-2">
          {entries.map(e => (
            <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full flex-shrink-0 ${['ingreso', 'apertura'].includes(e.tipo) ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{e.descripcion || e.tipo}</p>
                <p className="text-zinc-500 text-xs">{e.fecha} · {e.metodo_pago} · <span className="capitalize">{e.tipo}</span></p>
              </div>
              <p className={`font-black text-sm ${['ingreso', 'apertura'].includes(e.tipo) ? 'text-green-400' : 'text-red-400'}`}>
                {['ingreso', 'apertura'].includes(e.tipo) ? '+' : '-'}{fmt(e.monto)}
              </p>
              <button onClick={() => del(e.id)} className="text-zinc-600 hover:text-red-400 p-1"><Trash2 size={14} /></button>
            </div>
          ))}
          {entries.length === 0 && <p className="text-zinc-600 text-center py-12 text-sm">Sin movimientos en caja</p>}
        </div>
      )}
    </div>
  )
}

// ─── Productos Tab ────────────────────────────────────────────────────────────

function ProductosTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  const toggleActive = async (p: Product) => {
    await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, active: !p.active } : x))
  }

  const toggleFeatured = async (p: Product) => {
    await supabase.from('products').update({ featured: !p.featured }).eq('id', p.id)
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, featured: !p.featured } : x))
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const filtered = products.filter(p => !search || norm(p.name).includes(norm(search)) || norm(p.category || '').includes(norm(search)))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-black">{products.length} productos</p>
          <div className="relative mt-2">
            <input type="text" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} className="bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm px-3 py-2 pl-8 w-64 rounded-lg focus:outline-none focus:border-yellow-400" />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {showForm && (
        <ProductForm product={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSave={() => { setShowForm(false); setEditing(null); fetch_() }} />
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-zinc-900 rounded-xl h-16 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className={`flex items-center gap-4 bg-zinc-900 border rounded-xl p-3 transition-colors ${p.active ? 'border-zinc-800' : 'border-zinc-800 opacity-50'}`}>
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                {p.images?.[0] ? <Image src={p.images[0]} alt={p.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{p.name}</p>
                <p className="text-zinc-500 text-xs">{p.brand} · {p.category}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-yellow-400 font-bold text-sm">${p.price.toLocaleString('es-AR')}</p>
                <p className="text-zinc-500 text-xs">Stock: {p.stock}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleFeatured(p)} title="Destacado" className={`p-2 rounded-lg transition-colors ${p.featured ? 'text-yellow-400' : 'text-zinc-600 hover:text-zinc-300'}`}><Star size={16} fill={p.featured ? 'currentColor' : 'none'} /></button>
                <button onClick={() => toggleActive(p)} title={p.active ? 'Desactivar' : 'Activar'} className={`p-2 rounded-lg transition-colors ${p.active ? 'text-green-400' : 'text-zinc-600 hover:text-zinc-300'}`}>{p.active ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                <button onClick={() => { setEditing(p); setShowForm(true) }} title="Editar" className="p-2 text-zinc-400 hover:text-white rounded-lg transition-colors"><Pencil size={16} /></button>
                <button onClick={() => del(p.id)} title="Eliminar" className="p-2 text-zinc-600 hover:text-red-400 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Visitas Tab ──────────────────────────────────────────────────────────────

interface PageRow { path: string; total: number }
interface DayRow { day: string; total: number }

function VisitasTab() {
  const [totalViews, setTotalViews] = useState<number | null>(null)
  const [todayViews, setTodayViews] = useState<number | null>(null)
  const [pages, setPages] = useState<PageRow[]>([])
  const [days, setDays] = useState<DayRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshed, setRefreshed] = useState<Date | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const todayStart = new Date(); todayStart.setHours(0,0,0,0)

      const [totalRes, todayRes, pagesRes, daysRes] = await Promise.all([
        supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', since30),
        supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase.from('page_views').select('path').gte('created_at', since30),
        supabase.from('page_views').select('created_at').gte('created_at', since30),
      ])

      setTotalViews(totalRes.count ?? 0)
      setTodayViews(todayRes.count ?? 0)

      // aggregate pages
      const pathMap: Record<string, number> = {}
      for (const row of pagesRes.data || []) {
        pathMap[row.path] = (pathMap[row.path] || 0) + 1
      }
      setPages(Object.entries(pathMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, total]) => ({ path, total })))

      // aggregate by day (last 7 days)
      const dayMap: Record<string, number> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0)
        dayMap[d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })] = 0
      }
      for (const row of daysRes.data || []) {
        const d = new Date(row.created_at)
        const key = d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })
        if (key in dayMap) dayMap[key]++
      }
      setDays(Object.entries(dayMap).map(([day, total]) => ({ day, total })))

      setRefreshed(new Date())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const fmtN = (n: number | null) => n != null ? n.toLocaleString('es-AR') : '—'
  const maxDay = Math.max(...days.map(d => d.total), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-black text-lg uppercase tracking-tight">Visitas del sitio</h2>
        <div className="flex items-center gap-3">
          {refreshed && <span className="text-zinc-600 text-xs">{refreshed.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>}
          <button onClick={load} disabled={loading} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {error && <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Vistas hoy</p>
          <p className={`font-black text-3xl ${loading ? 'animate-pulse text-zinc-700' : 'text-yellow-400'}`}>{loading ? '···' : fmtN(todayViews)}</p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Vistas últimos 30 días</p>
          <p className={`font-black text-3xl ${loading ? 'animate-pulse text-zinc-700' : 'text-blue-400'}`}>{loading ? '···' : fmtN(totalViews)}</p>
        </div>
      </div>

      {/* Bar chart last 7 days */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6">
        <h3 className="text-white font-black text-sm uppercase tracking-widest mb-5">Últimos 7 días</h3>
        {loading ? (
          <div className="flex items-end gap-2 h-24">{[...Array(7)].map((_, i) => <div key={i} className="flex-1 bg-zinc-700 rounded animate-pulse" style={{ height: `${30 + i * 10}%` }} />)}</div>
        ) : (
          <div className="flex items-end gap-2 h-24">
            {days.map(({ day, total }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-zinc-500 text-[9px]">{total > 0 ? total : ''}</span>
                <div
                  className="w-full rounded-t transition-all"
                  style={{ height: `${Math.max(4, Math.round((total / maxDay) * 80))}px`, backgroundColor: total > 0 ? '#C41515' : 'rgba(255,255,255,0.06)' }}
                />
                <span className="text-zinc-600 text-[9px] text-center leading-tight">{day}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top pages */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6">
        <h3 className="text-white font-black text-sm uppercase tracking-widest mb-5">Páginas más visitadas — últimos 30 días</h3>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-zinc-700 rounded-xl animate-pulse" />)}</div>
        ) : pages.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-8">Sin datos aún.</p>
        ) : (
          <div className="space-y-2">
            {pages.map((p, i) => {
              const pct = Math.round((p.total / (pages[0]?.total || 1)) * 100)
              const LABELS: Record<string, { label: string; tag: string }> = {
                '/': { label: 'Inicio', tag: 'home' },
                '/productos': { label: 'Catálogo de productos', tag: 'catálogo' },
                '/contacto': { label: 'Contacto', tag: 'contacto' },
              }
              const known = LABELS[p.path]
              const isProducto = p.path.startsWith('/producto/')
              const slug = isProducto ? p.path.replace('/producto/', '') : ''
              const productName = slug
                .split('-')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')
              const label = known?.label ?? (isProducto ? productName : p.path)
              const tag = known?.tag ?? (isProducto ? 'producto' : 'página')
              return (
                <div key={p.path} className="flex items-center gap-3 bg-zinc-900 rounded-xl px-4 py-3">
                  <span className="text-zinc-600 text-xs font-black w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-white text-sm font-semibold truncate">{label}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ backgroundColor: isProducto ? 'rgba(196,21,21,0.15)' : 'rgba(255,255,255,0.06)', color: isProducto ? '#C41515' : '#71717a' }}>
                        {tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: '#C41515' }} />
                      </div>
                      <span className="text-zinc-400 text-xs font-black flex-shrink-0">{p.total} visitas</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <p className="text-zinc-700 text-xs text-center">Tracking propio · últimos 30 días</p>
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'cuatrouno2024') {
      setAuthed(true)
      setError('')
    } else {
      setError('Contraseña incorrecta')
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Dot texture */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        {/* Red glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(196,21,21,0.12) 0%, transparent 65%)' }} />

        <div className="relative w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-10">
            <img src="/logo.png" alt="Cuatrouno" className="h-40 w-auto mx-auto mb-5 drop-shadow-lg" />
            <p className="text-zinc-600 text-[10px] uppercase tracking-[0.35em]">Panel de administración</p>
          </div>

          {/* Glass card */}
          <div className="rounded-2xl p-8 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}>
            {/* Red top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #C41515, transparent)' }} />

            <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-2">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none transition-all mb-4 text-sm"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${error ? '#C41515' : 'rgba(255,255,255,0.08)'}`,
              }}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs mb-4 flex items-center gap-1.5">
                <span className="font-black">✕</span> {error}
              </p>
            )}
            <button
              onClick={handleLogin}
              className="w-full font-black py-3.5 rounded-xl transition-all text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #C41515 0%, #8b0000 100%)' }}
            >
              <span className="relative z-10">Ingresar</span>
              <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #e01515 0%, #a00000 100%)' }} />
            </button>
          </div>

          <p className="text-zinc-700 text-xs text-center mt-6 uppercase tracking-widest">Cuatrouno Suplementos © 2026</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <p className="text-white font-black text-lg">CUATRO<span className="text-red-500">UNO</span> <span className="text-zinc-500 font-normal text-sm">SUPLEMENTOS · Administrador</span></p>
        <button onClick={() => setAuthed(false)} className="p-2 text-zinc-500 hover:text-white transition-colors"><LogOut size={18} /></button>
      </div>

      {/* Tabs */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 sm:px-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-zinc-500 hover:text-white'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'ventas' && <VentasTab />}
        {activeTab === 'gastos' && <GastosTab />}
        {activeTab === 'movimientos' && <MovimientosTab />}
        {activeTab === 'caja' && <CajaTab />}
        {activeTab === 'productos' && <ProductosTab />}
        {activeTab === 'visitas' && <VisitasTab />}
      </div>
    </div>
  )
}
