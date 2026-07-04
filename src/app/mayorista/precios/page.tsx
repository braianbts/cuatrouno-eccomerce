'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Search, ArrowLeft, Plus, Minus, ShoppingCart, X } from 'lucide-react'

type Producto = {
  id: string
  cod: string
  marca: string
  descripcion: string
  gramos: string
  envase: string
  sabor: string
  costo: number
  precio_mayorista: number
  updated_at: string
}

type CartItem = Producto & { cantidad: number }

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function PreciosMayoristaPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [marcaActiva, setMarcaActiva] = useState('TODAS')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('lista_mayorista')
      .select('*')
      .order('marca')
      .order('descripcion')
      .then(({ data }) => { setProductos(data ?? []); setLoading(false) })
  }, [])

  const marcas = useMemo(() => ['TODAS', ...new Set(productos.map(p => p.marca).filter(Boolean))], [productos])

  const filtered = useMemo(() => productos.filter(p => {
    const q = query.toLowerCase()
    const matchQuery = !q || p.descripcion.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q) || (p.sabor ?? '').toLowerCase().includes(q)
    const matchMarca = marcaActiva === 'TODAS' || p.marca === marcaActiva
    return matchQuery && matchMarca
  }), [productos, query, marcaActiva])

  const cartItems: CartItem[] = useMemo(() =>
    productos.filter(p => cart[p.id] > 0).map(p => ({ ...p, cantidad: cart[p.id] })),
    [productos, cart]
  )

  const cartTotal = cartItems.reduce((s, i) => s + i.precio_mayorista * i.cantidad, 0)
  const cartCount = cartItems.reduce((s, i) => s + i.cantidad, 0)

  const setQty = (id: string, qty: number) =>
    setCart(c => qty <= 0 ? (({ [id]: _, ...rest }) => rest)(c) : { ...c, [id]: qty })

  const handleCheckout = () => {
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    const lineas = [
      '*Pedido Mayorista — Cuatrouno Suplementos*',
      '_Mínimo de compra: $300.000_',
      '',
      ...cartItems.map(i => `• ${i.descripcion}${i.sabor ? ` (${i.sabor})` : ''} x${i.cantidad} → ${fmt(i.precio_mayorista * i.cantidad)}`),
      '',
      `*TOTAL: ${fmt(cartTotal)}*`,
    ]
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(lineas.join('\n'))}`, '_blank')
    setCart({})
    setCartOpen(false)
  }

  const updatedAt = productos[0]?.updated_at
    ? new Date(productos[0].updated_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-black pb-32">

      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/mayorista" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-xs mb-5 transition-colors">
            <ArrowLeft size={14} /> Volver
          </Link>

          {/* Info banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5">
              <p className="text-2xl mb-2">🚚</p>
              <p className="text-white font-black text-base">Entrega sin costo</p>
              <p className="text-zinc-400 text-sm mt-1">Zona Norte GBA — incluida en tu pedido</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5">
              <p className="text-2xl mb-2">💳</p>
              <p className="text-white font-black text-base">Pago anticipado</p>
              <p className="text-zinc-400 text-sm mt-1">El pedido se gestiona una vez confirmado el pago</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5">
              <p className="text-2xl mb-2">📦</p>
              <p className="text-white font-black text-base">Plazo de entrega</p>
              <p className="text-zinc-400 text-sm mt-1">3 a 5 días hábiles desde la confirmación</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Image src="/logo.png" alt="Cuatrouno" width={120} height={42} className="mb-3 opacity-90" />
              <h1 className="text-white font-black text-2xl">Lista de Precios Mayorista</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Mínimo de compra: <span className="text-yellow-400 font-bold">$300.000</span>
                {updatedAt && <span className="ml-3 text-zinc-600">· Actualizado: {updatedAt}</span>}
              </p>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative self-start sm:self-auto flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black px-5 py-3 rounded-xl transition-colors text-sm"
            >
              <ShoppingCart size={16} />
              Mi pedido
              {cartCount > 0 && (
                <span className="bg-black text-yellow-400 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="sticky top-16 z-20 bg-black/95 backdrop-blur border-b border-zinc-900 px-4 py-3">
        <div className="max-w-6xl mx-auto space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setMarcaActiva('TODAS') }}
              placeholder="Buscar producto, sabor..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
          {/* Marca tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {marcas.map(m => (
              <button
                key={m}
                onClick={() => setMarcaActiva(m)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  marcaActiva === m
                    ? 'bg-yellow-400 text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-zinc-600 text-sm text-center py-20">Cargando lista...</div>
        ) : filtered.length === 0 ? (
          <div className="text-zinc-600 text-sm text-center py-20">Sin resultados</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Marca</th>
                  <th className="text-left px-4 py-3">Descripción</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Presentación</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Sabor</th>
                  <th className="text-right px-4 py-3 text-yellow-400">Precio</th>
                  <th className="text-center px-4 py-3">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const qty = cart[p.id] ?? 0
                  return (
                    <tr key={p.id} className={`border-t border-zinc-800/60 transition-colors ${qty > 0 ? 'bg-yellow-400/5' : i % 2 !== 0 ? 'bg-zinc-950/30' : ''}`}>
                      <td className="px-4 py-3">
                        <span className="text-zinc-500 font-semibold text-xs">{p.marca}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium leading-tight">{p.descripcion}</p>
                        {p.gramos && <p className="text-zinc-600 text-xs mt-0.5">{p.gramos}</p>}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">{p.envase}</td>
                      <td className="px-4 py-3 text-zinc-500 hidden lg:table-cell">{p.sabor}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-yellow-400 font-black">{fmt(p.precio_mayorista)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {qty > 0 ? (
                            <>
                              <button onClick={() => setQty(p.id, qty - 1)} className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors">
                                <Minus size={12} />
                              </button>
                              <span className="text-white font-black w-5 text-center">{qty}</span>
                              <button onClick={() => setQty(p.id, qty + 1)} className="w-7 h-7 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black flex items-center justify-center transition-colors">
                                <Plus size={12} />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => setQty(p.id, 1)} className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-yellow-400 hover:text-black text-zinc-400 flex items-center justify-center transition-colors">
                              <Plus size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cart flotante bottom */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black px-6 py-3.5 rounded-2xl shadow-2xl transition-colors"
          >
            <ShoppingCart size={18} />
            Ver pedido ({cartCount} items) · {fmt(cartTotal)}
          </button>
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <h2 className="text-white font-black text-lg">Mi pedido</h2>
              <button onClick={() => setCartOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cartItems.length === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-10">No agregaste productos todavía</p>
              ) : cartItems.map(item => (
                <div key={item.id} className="flex items-start gap-3 bg-zinc-900 rounded-xl p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm leading-tight">{item.descripcion}</p>
                    {item.sabor && <p className="text-zinc-500 text-xs mt-0.5">{item.sabor}</p>}
                    <p className="text-yellow-400 font-black text-sm mt-1">{fmt(item.precio_mayorista)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setQty(item.id, item.cantidad - 1)} className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center">
                      <Minus size={12} />
                    </button>
                    <span className="text-white font-black w-5 text-center">{item.cantidad}</span>
                    <button onClick={() => setQty(item.id, item.cantidad + 1)} className="w-7 h-7 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black flex items-center justify-center">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-800 px-6 py-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Total</span>
                <span className="text-white font-black text-xl">{fmt(cartTotal)}</span>
              </div>
              {cartTotal < 300000 && (
                <p className="text-amber-400 text-xs">
                  Te faltan {fmt(300000 - cartTotal)} para alcanzar el mínimo de compra.
                </p>
              )}
              <button
                onClick={handleCheckout}
                disabled={cartTotal < 300000}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl transition-colors"
              >
                Enviar pedido por WhatsApp
              </button>
              <p className="text-zinc-600 text-xs text-center">Mínimo de compra: $300.000</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
