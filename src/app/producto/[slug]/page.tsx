'use client'

// Dynamic metadata is handled server-side via generateMetadata in a separate server component.
// For client pages, OG is set globally in layout.tsx.

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { supabase, Product } from '@/lib/supabase'
import { useCart } from '@/store/cart'
import { ShoppingCart, MessageCircle, ChevronLeft, Check } from 'lucide-react'
import Link from 'next/link'

type Variant = { name: string; image: string; stock: number }

function parseVariants(flavor: string | null): Variant[] | null {
  if (!flavor) return null
  try {
    const parsed = JSON.parse(flavor)
    if (Array.isArray(parsed) && parsed[0]?.name) return parsed
  } catch {}
  return null
}

export default function ProductoPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const add = useCart((s) => s.add)

  useEffect(() => {
    supabase.from('products').select('*').eq('slug', slug).single()
      .then(({ data }) => {
        setProduct(data)
        setLoading(false)
        const variants = parseVariants(data?.flavor ?? null)
        if (variants) setSelectedVariant(variants[0])
      })
  }, [slug])

  const variants = product ? parseVariants(product.flavor) : null

  const activeStock = selectedVariant ? selectedVariant.stock : product?.stock ?? 0
  const activeImage = selectedVariant ? selectedVariant.image : product?.images?.[selectedImg]

  const handleVariantSelect = (v: Variant) => {
    setSelectedVariant(v)
    setQuantity(1)
  }

  const handleAdd = () => {
    if (!product) return
    const cartProduct = selectedVariant
      ? { ...product, name: `${product.name} - ${selectedVariant.name}`, stock: selectedVariant.stock }
      : product
    add(cartProduct, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    if (!product) return
    const displayName = selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name
    add(selectedVariant ? { ...product, name: displayName } : product, quantity)
    const msg = encodeURIComponent(
      `Hola! Quiero comprar:\n\n• *${displayName}* x${quantity} = $${(product.price * quantity).toLocaleString('es-AR')}\n\n¿Cómo coordino el pago?`
    )
    window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${msg}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white max-w-7xl mx-auto px-4 py-10 animate-pulse">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-black/5" />
          <div className="space-y-4 pt-4">
            <div className="h-3 bg-black/5 w-1/4" />
            <div className="h-8 bg-black/5 w-3/4" />
            <div className="h-6 bg-black/5 w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white max-w-7xl mx-auto px-4 py-32 text-center text-black/20">
        <p className="text-xs uppercase tracking-widest mb-4">Producto no encontrado</p>
        <Link href="/productos" className="text-xs uppercase tracking-widest hover:text-black transition-colors" style={{ color: '#C41515' }}>
          ← Volver
        </Link>
      </div>
    )
  }

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/productos" className="inline-flex items-center gap-1 text-black/30 hover:text-black text-[10px] font-bold uppercase tracking-widest mb-10 transition-colors">
          <ChevronLeft size={12} /> Productos
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image */}
          <div className="space-y-2">
            <div className="relative aspect-square bg-white border border-black/5 overflow-hidden">
              {activeImage ? (
                <Image src={activeImage} alt={product.name} fill className="object-contain p-6" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black/10 font-black text-6xl">C1</div>
              )}
              {discount && (
                <span className="absolute top-0 left-0 text-white text-[10px] font-black px-2 py-1" style={{ backgroundColor: '#C41515' }}>
                  -{discount}%
                </span>
              )}
            </div>
            {/* Thumbnail strip — only show when no variant selector */}
            {!variants && product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className="relative w-14 h-14 flex-shrink-0 overflow-hidden bg-white border transition-all"
                    style={{ borderColor: selectedImg === i ? '#C41515' : 'rgba(0,0,0,0.1)', opacity: selectedImg === i ? 1 : 0.5 }}
                  >
                    <Image src={img} alt="" fill className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/30 mb-3">{product.brand}</p>
            <h1 className="text-black font-black text-2xl md:text-3xl uppercase tracking-tight mb-6 leading-tight">
              {product.name}
              {selectedVariant && (
                <span className="text-black/40 font-bold"> — {selectedVariant.name}</span>
              )}
            </h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-black text-5xl" style={{ color: '#C41515' }}>
                ${product.price.toLocaleString('es-AR')}
              </span>
              {product.compare_price && (
                <span className="text-black/25 text-xl line-through font-bold">
                  ${product.compare_price.toLocaleString('es-AR')}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 mb-8 pb-8 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-black/5" />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#16a34a' }}>
                  💵 efectivo · ${Math.round(product.price * 0.95).toLocaleString('es-AR')} <span className="opacity-60 font-normal normal-case tracking-normal">— 5% off</span>
                </span>
                <div className="h-px flex-1 bg-black/5" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-black/5" />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#2563eb' }}>
                  💳 3 cuotas de ${Math.ceil(product.price / 0.894 / 3).toLocaleString('es-AR')} <span className="opacity-60 font-normal normal-case tracking-normal">— sin interés</span>
                </span>
                <div className="h-px flex-1 bg-black/5" />
              </div>
              <p className="text-center text-[9px] text-black/30">* No disponible con American Express</p>
            </div>

            {/* Flavor / variant selector */}
            {variants && (
              <div className="mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-3">Sabor</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.name}
                      onClick={() => handleVariantSelect(v)}
                      disabled={v.stock === 0}
                      className="relative px-4 py-2 text-xs font-black uppercase tracking-wider border transition-all"
                      style={
                        v.stock === 0
                          ? { borderColor: 'rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.2)', cursor: 'not-allowed', textDecoration: 'line-through' }
                          : selectedVariant?.name === v.name
                          ? { borderColor: '#C41515', backgroundColor: '#C41515', color: '#fff' }
                          : { borderColor: 'rgba(0,0,0,0.15)', color: 'rgba(0,0,0,0.7)' }
                      }
                    >
                      {v.name}
                      {v.stock === 0 && <span className="ml-1 text-[9px] normal-case font-normal">sin stock</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Plain flavor label (non-variant) */}
            {!variants && product.flavor && (
              <p className="text-black/40 text-sm mb-6">Sabor: <span className="font-bold text-black/70">{product.flavor}</span></p>
            )}

            {product.description && (
              <p className="text-black/50 text-sm leading-relaxed mb-8">{product.description}</p>
            )}

            <div className="flex items-center gap-2 mb-6">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-1"
                style={{
                  backgroundColor: activeStock > 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  color: activeStock > 0 ? '#16a34a' : '#dc2626',
                }}
              >
                {activeStock > 0 ? 'En stock' : 'Sin stock'}
              </span>
            </div>

            {activeStock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-black/30 text-[10px] font-bold uppercase tracking-widest">Cantidad</span>
                <div className="flex items-center bg-white border border-black/10">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 text-black/40 hover:text-black flex items-center justify-center transition-colors text-lg">−</button>
                  <span className="text-black font-black w-9 text-center text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(activeStock, quantity + 1))} className="w-9 h-9 text-black/40 hover:text-black flex items-center justify-center transition-colors text-lg">+</button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={handleAdd}
                disabled={activeStock === 0 || (variants !== null && !selectedVariant)}
                className="w-full flex items-center justify-center gap-2 font-black py-4 text-xs uppercase tracking-widest transition-all text-white"
                style={
                  added ? { backgroundColor: '#22c55e' }
                  : activeStock === 0 ? { backgroundColor: '#ccc', cursor: 'not-allowed' }
                  : { backgroundColor: '#C41515' }
                }
              >
                {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                {added ? 'Agregado' : activeStock === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </button>
              {activeStock > 0 && (
                <button
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-2 font-black py-4 text-xs uppercase tracking-widest transition-colors text-white"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle size={16} />
                  Comprar por WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
