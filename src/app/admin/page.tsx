'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, Product } from '@/lib/supabase'
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, LogOut, Package, BarChart2, ShoppingBag, TrendingDown, RefreshCw, DollarSign, X, Check, ChevronDown } from 'lucide-react'
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

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'ventas', label: 'Ventas', icon: ShoppingBag },
  { id: 'gastos', label: 'Gastos', icon: TrendingDown },
  { id: 'movimientos', label: 'Movimientos', icon: RefreshCw },
  { id: 'caja', label: 'Caja', icon: DollarSign },
  { id: 'productos', label: 'Productos', icon: Package },
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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-black text-lg">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={18} /></button>
        </div>
        {children}
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

function VentaForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ fecha: localDate(), producto: '', categoria: 'proteinas', cantidad: 1, precio_unitario: 0, metodo_pago: 'mercadopago', costo: 0, notas: '' })
  const [saving, setSaving] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    supabase.from('products').select('*').eq('active', true).order('name').then(({ data }) => setAllProducts(data || []))
  }, [])

  const handleProductInput = (val: string) => {
    setForm(f => ({ ...f, producto: val }))
    setSelectedProduct(null)
    if (val.length > 1) {
      const q = val.toLowerCase()
      setSuggestions(allProducts.filter(p => p.name.toLowerCase().includes(q)).slice(0, 6))
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectProduct = (p: Product) => {
    setSelectedProduct(p)
    setForm(f => ({ ...f, producto: p.name, categoria: p.category || 'otros', precio_unitario: p.price }))
    setShowSuggestions(false)
  }

  const total = form.precio_unitario * form.cantidad

  const save = async () => {
    if (!form.producto || !form.precio_unitario) return
    setSaving(true)
    await supabase.from('ventas').insert({ ...form, total, precio_unitario: Number(form.precio_unitario), costo: Number(form.costo), cantidad: Number(form.cantidad) })
    // Decrement stock if product selected from catalog
    if (selectedProduct) {
      const newStock = Math.max(0, (selectedProduct.stock || 0) - Number(form.cantidad))
      await supabase.from('products').update({ stock: newStock }).eq('id', selectedProduct.id)
    }
    setSaving(false)
    onSave()
  }

  return (
    <Modal title="Nueva Venta" onClose={onClose}>
      <Field label="Fecha"><input type="date" className={inputCls} value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} /></Field>
      <Field label="Producto">
        <div className="relative">
          <input
            type="text"
            className={inputCls}
            placeholder="Buscar producto del catálogo..."
            value={form.producto}
            onChange={e => handleProductInput(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onFocus={() => form.producto.length > 1 && setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-600 rounded-lg overflow-hidden shadow-xl">
              {suggestions.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={() => selectProduct(p)}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-700 transition-colors flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-white text-sm font-semibold">{p.name}</p>
                    <p className="text-zinc-400 text-xs">{p.category} · stock: {p.stock}</p>
                  </div>
                  <p className="text-yellow-400 text-sm font-black flex-shrink-0">${p.price.toLocaleString('es-AR')}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedProduct && (
          <p className="text-xs text-green-400 mt-1">✓ Stock actual: {selectedProduct.stock} u · quedará: {Math.max(0, selectedProduct.stock - form.cantidad)} u</p>
        )}
      </Field>
      <Field label="Categoría">
        <select className={selectCls} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
          {['proteinas','creatina','pre-workout','vitaminas','quemadores','aminoacidos','indumentaria','otros'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cantidad"><input type="number" className={inputCls} min="1" value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: Number(e.target.value) }))} /></Field>
        <Field label="Precio unitario"><input type="number" className={inputCls} placeholder="0" value={form.precio_unitario || ''} onChange={e => setForm(f => ({ ...f, precio_unitario: Number(e.target.value) }))} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Costo unitario"><input type="number" className={inputCls} placeholder="0" value={form.costo || ''} onChange={e => setForm(f => ({ ...f, costo: Number(e.target.value) }))} /></Field>
        <Field label="Método de pago">
          <select className={selectCls} value={form.metodo_pago} onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value }))}>
            <option value="efectivo">Efectivo</option>
            <option value="mercadopago">MercadoPago</option>
            <option value="tiendanube">TiendaNube</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </Field>
      </div>
      {total > 0 && <div className="bg-zinc-800 rounded-lg px-3 py-2 mb-3 flex justify-between text-sm"><span className="text-zinc-400">Total</span><span className="text-yellow-400 font-black">{fmt(total)}</span></div>}
      <Field label="Notas (opcional)"><input type="text" className={inputCls} value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} /></Field>
      <button onClick={save} disabled={saving} className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-3 rounded-xl mt-2">
        {saving ? 'Guardando...' : 'Guardar Venta'}
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

function VentasTab() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('ventas').select('*').order('fecha', { ascending: false }).order('created_at', { ascending: false }).limit(200)
    setVentas(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  const filtered = search ? ventas.filter(v => v.producto.toLowerCase().includes(search.toLowerCase()) || v.metodo_pago.includes(search.toLowerCase())) : ventas
  const total = filtered.reduce((s, v) => s + v.total, 0)

  const del = async (id: string) => {
    if (!confirm('¿Eliminar esta venta?')) return
    await supabase.from('ventas').delete().eq('id', id)
    setVentas(prev => prev.filter(v => v.id !== id))
  }

  const METODO_COLORS: Record<string, string> = { efectivo: 'text-green-400', mercadopago: 'text-blue-400', tiendanube: 'text-purple-400', transferencia: 'text-yellow-400' }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-black">{fmtNum(filtered.length)} ventas</p>
          <p className="text-yellow-400 text-sm font-bold">{fmt(total)}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> Nueva Venta
        </button>
      </div>
      <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm mb-4 focus:outline-none focus:border-yellow-400" />

      {showForm && <VentaForm onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); fetch_() }} />}

      {loading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-zinc-900 rounded-xl h-14 animate-pulse" />)}</div> : (
        <div className="space-y-2">
          {filtered.map(v => (
            <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{v.producto}</p>
                <p className="text-zinc-500 text-xs">{v.fecha} · {v.cantidad} u · <span className={METODO_COLORS[v.metodo_pago] || 'text-zinc-400'}>{v.metodo_pago}</span></p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-black text-sm">{fmt(v.total)}</p>
                {v.ganancia != null && <p className={`text-xs ${v.ganancia >= 0 ? 'text-green-400' : 'text-red-400'}`}>gan. {fmt(v.ganancia)}</p>}
              </div>
              <button onClick={() => del(v.id)} className="text-zinc-600 hover:text-red-400 p-1"><Trash2 size={14} /></button>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-zinc-600 text-center py-12 text-sm">Sin ventas registradas</p>}
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

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()))

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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-white font-black text-2xl">CUATRO<span className="text-yellow-400">UNO</span></p>
            <p className="text-zinc-400 text-sm mt-1">Panel de administración</p>
          </div>
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 mb-3" />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button onClick={handleLogin} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 rounded-xl transition-colors">Ingresar</button>
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
      </div>
    </div>
  )
}
