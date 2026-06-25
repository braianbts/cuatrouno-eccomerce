'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase, Product } from '@/lib/supabase'
import ProductCard from '@/components/product/ProductCard'
import { Search } from 'lucide-react'

const categories = [
  { name: 'Todos', slug: '' },
  { name: 'Proteínas', slug: 'proteinas' },
  { name: 'Creatina', slug: 'creatina' },
  { name: 'Pre-Workout', slug: 'pre-workout' },
  { name: 'Vitaminas', slug: 'vitaminas' },
  { name: 'Quemadores', slug: 'quemadores' },
  { name: 'Aminoácidos', slug: 'aminoacidos' },
  { name: 'Indumentaria', slug: 'indumentaria' },
  { name: 'Otros', slug: 'otros' },
]

function ProductosContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || '')

  useEffect(() => { fetchProducts() }, [activeCategory])

  async function fetchProducts() {
    setLoading(true)
    let query = supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false })
    if (activeCategory) query = query.eq('category', activeCategory)
    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }

  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const filtered = search.trim()
    ? products.filter(p =>
        norm(p.name).includes(norm(search)) ||
        norm(p.brand || '').includes(norm(search))
      )
    : products

  return (
    <div className="min-h-screen bg-white">
      {/* Header bar */}
      <div className="bg-black px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 mb-2">Cuatrouno Suplementos</p>
          <h1 className="text-white font-black text-4xl uppercase tracking-tight">Productos</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/25" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-black/10 focus:border-[#C41515]/50 pl-9 pr-4 py-2.5 text-black placeholder-black/25 focus:outline-none transition-colors text-sm"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className="flex-shrink-0 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest transition-colors whitespace-nowrap border"
                style={
                  activeCategory === cat.slug
                    ? { backgroundColor: '#C41515', color: '#fff', borderColor: '#C41515' }
                    : { backgroundColor: '#fff', color: 'rgba(0,0,0,0.35)', borderColor: 'rgba(0,0,0,0.1)' }
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {!loading && (
          <p className="text-black/25 text-[10px] uppercase tracking-widest mb-5">
            {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-black/5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-black/20 py-32">
            <p className="text-xs uppercase tracking-widest">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-black/5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductosContent />
    </Suspense>
  )
}
