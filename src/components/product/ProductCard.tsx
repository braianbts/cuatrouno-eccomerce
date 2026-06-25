'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Product } from '@/lib/supabase'
import { useCart } from '@/store/cart'

type Props = { product: Product }

export default function ProductCard({ product }: Props) {
  const add = useCart((s) => s.add)

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null

  return (
    <div className="group bg-white border border-black/5 hover:border-[#C41515]/30 transition-all duration-200 flex flex-col">
      <Link href={`/producto/${product.slug}`} className="relative block aspect-square bg-white overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/10 text-3xl font-black">C1</div>
        )}
        {discount && (
          <span className="absolute top-0 left-0 text-white text-[9px] font-black px-1.5 py-0.5" style={{ backgroundColor: '#C41515' }}>
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-black/40 font-bold text-[10px] uppercase tracking-widest border border-black/10 px-2 py-1">
              Sin stock
            </span>
          </div>
        )}
      </Link>

      <div className="px-3 pb-3 pt-2 flex flex-col flex-1 border-t border-black/5">
        <Link href={`/producto/${product.slug}`} className="flex-1">
          <p className="text-black/30 text-[9px] font-bold uppercase tracking-widest mb-1">{product.brand}</p>
          <h3 className="text-black/80 font-bold text-[11px] leading-tight line-clamp-2 uppercase group-hover:text-black transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="font-black text-base" style={{ color: '#C41515' }}>
              ${product.price.toLocaleString('es-AR')}
            </span>
            {product.compare_price && (
              <span className="text-black/25 text-[10px] line-through">
                ${product.compare_price.toLocaleString('es-AR')}
              </span>
            )}
          </div>

          <button
            onClick={() => product.stock > 0 && add(product)}
            disabled={product.stock === 0}
            className="w-full disabled:opacity-30 disabled:cursor-not-allowed text-white font-black py-2 text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
            style={product.stock > 0 ? { backgroundColor: '#C41515' } : { backgroundColor: '#999' }}
          >
            <ShoppingCart size={11} />
            {product.stock === 0 ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}
