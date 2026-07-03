'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Search, ArrowLeft } from 'lucide-react'

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

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function PreciosMayoristaPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [query, setQuery] = useState('')
  const [marcaFiltro, setMarcaFiltro] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('lista_mayorista')
      .select('*')
      .order('marca')
      .order('descripcion')
      .then(({ data }) => { setProductos(data ?? []); setLoading(false) })
  }, [])

  const marcas = [...new Set(productos.map(p => p.marca).filter(Boolean))].sort()

  const filtered = productos.filter(p => {
    const q = query.toLowerCase()
    const matchQuery = !q || p.descripcion.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q) || p.sabor?.toLowerCase().includes(q)
    const matchMarca = !marcaFiltro || p.marca === marcaFiltro
    return matchQuery && matchMarca
  })

  const updatedAt = productos[0]?.updated_at
    ? new Date(productos[0].updated_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/mayorista" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-xs mb-6 transition-colors">
            <ArrowLeft size={14} /> Volver
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Image src="/logo.png" alt="Cuatrouno" width={120} height={42} className="mb-3 opacity-90" />
              <h1 className="text-white font-black text-2xl">Lista de Precios Mayorista</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Mínimo de compra: <span className="text-yellow-400 font-bold">$300.000</span>
                {updatedAt && <span className="ml-3 text-zinc-600">· Actualizado: {updatedAt}</span>}
              </p>
            </div>
            <div className="text-right">
              <p className="text-zinc-600 text-xs">Precios en ARS · IVA incluido</p>
              <p className="text-zinc-600 text-xs">{filtered.length} productos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="sticky top-16 z-20 bg-black/90 backdrop-blur border-b border-zinc-900 px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar producto, sabor..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
          <select
            value={marcaFiltro}
            onChange={e => setMarcaFiltro(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
          >
            <option value="">Todas las marcas</option>
            {marcas.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="max-w-6xl mx-auto px-4 py-8">
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
                  <th className="text-right px-4 py-3 text-yellow-400">Precio Mayorista</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-t border-zinc-800/60 hover:bg-zinc-900/50 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-950/30'}`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-zinc-400 font-semibold text-xs">{p.marca}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium leading-tight">{p.descripcion}</p>
                      {p.gramos && <p className="text-zinc-600 text-xs mt-0.5">{p.gramos}</p>}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">{p.envase}</td>
                    <td className="px-4 py-3 text-zinc-500 hidden lg:table-cell">{p.sabor}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-yellow-400 font-black text-base">{fmt(p.precio_mayorista)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-zinc-700 text-xs text-center mt-6">
          Los precios pueden variar semanalmente · Para hacer un pedido contactanos por{' '}
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">
            WhatsApp
          </a>
        </p>
      </div>
    </div>
  )
}
