'use client'

import { useState, useRef } from 'react'
import { supabase, Product } from '@/lib/supabase'
import { X, Upload, Trash2, Loader2 } from 'lucide-react'
import Image from 'next/image'

type Props = {
  product: Product | null
  onClose: () => void
  onSave: () => void
}

type Variant = { name: string; image: string; stock: number }

const categories = [
  'proteinas', 'creatina', 'pre-workout', 'vitaminas', 'quemadores', 'aminoacidos', 'otros'
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function parseVariants(flavor: string | null): Variant[] | null {
  if (!flavor) return null
  try {
    const parsed = JSON.parse(flavor)
    if (Array.isArray(parsed) && parsed[0]?.name) return parsed
  } catch {}
  return null
}

export default function ProductForm({ product, onClose, onSave }: Props) {
  const initialVariants = parseVariants(product?.flavor ?? null)
  const [variants, setVariants] = useState<Variant[] | null>(initialVariants)

  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    compare_price: product?.compare_price?.toString() || '',
    costo: product?.costo?.toString() || '',
    category: product?.category || 'proteinas',
    stock: product?.stock?.toString() || '0',
    brand: product?.brand || '',
    flavor: initialVariants ? '' : (product?.flavor || ''),
    weight: product?.weight || '',
    featured: product?.featured || false,
    active: product?.active ?? true,
    images: product?.images || [],
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && !product ? { slug: slugify(value) } : {}),
    }))
  }

  const handleVariantStock = (index: number, newStock: number) => {
    setVariants((prev) => {
      if (!prev) return prev
      const updated = prev.map((v, i) => i === index ? { ...v, stock: newStock } : v)
      return updated
    })
  }

  const uploadImages = async (files: FileList) => {
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('products').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('products').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
    setUploading(false)
  }

  const removeImage = (url: string) => {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.name || !form.price || !form.category) {
      setError('Nombre, precio y categoría son obligatorios')
      return
    }
    setSaving(true)

    let flavorValue: string | null
    let stockValue: number

    if (variants) {
      flavorValue = JSON.stringify(variants)
      stockValue = variants.reduce((sum, v) => sum + v.stock, 0)
    } else {
      flavorValue = form.flavor || null
      stockValue = parseInt(form.stock) || 0
    }

    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      costo: form.costo ? parseFloat(form.costo) : null,
      category: form.category,
      stock: stockValue,
      brand: form.brand,
      flavor: flavorValue,
      weight: form.weight || null,
      featured: form.featured,
      active: form.active,
      images: form.images,
    }

    if (product) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id)
      if (error) setError(error.message)
      else onSave()
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) setError(error.message)
      else onSave()
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-black text-lg">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Images */}
          <div>
            <label className="text-zinc-400 text-sm mb-2 block">Imágenes</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.images.map((img) => (
                <div key={img} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                  <Image src={img} alt="" fill className="object-cover" />
                  <button
                    onClick={() => removeImage(img)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-20 h-20 border-2 border-dashed border-zinc-700 hover:border-yellow-400 rounded-lg flex flex-col items-center justify-center text-zinc-500 hover:text-yellow-400 transition-colors"
              >
                {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                <span className="text-xs mt-1">{uploading ? '...' : 'Subir'}</span>
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && uploadImages(e.target.files)}
            />
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Nombre *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400"
                placeholder="Whey Protein 5lb"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Marca</label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400"
                placeholder="Optimum Nutrition"
              />
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Slug (URL)</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400 font-mono text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400 resize-none"
              placeholder="Descripción del producto..."
            />
          </div>

          {/* Price / compare price / stock */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Precio *</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400"
                placeholder="15000"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Precio tachado</label>
              <input
                name="compare_price"
                type="number"
                value={form.compare_price}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400"
                placeholder="18000"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Costo</label>
              <input
                name="costo"
                type="number"
                value={form.costo}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400"
                placeholder="0"
              />
            </div>
            {/* Stock: show per-variant editors if product has variants, else single field */}
            {variants ? (
              <div className="col-span-3">
                <label className="text-zinc-400 text-sm mb-2 block">Stock por sabor</label>
                <div className="grid grid-cols-2 gap-3">
                  {variants.map((v, i) => (
                    <div key={v.name} className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5">
                      <span className="text-white text-sm font-bold flex-1">{v.name}</span>
                      <input
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) => handleVariantStock(i, parseInt(e.target.value) || 0)}
                        className="w-16 bg-zinc-700 border border-zinc-600 rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-zinc-500 text-xs mt-2">
                  Stock total: {variants.reduce((s, v) => s + v.stock, 0)}
                </p>
              </div>
            ) : (
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">Stock</label>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            )}
          </div>

          {/* Category / flavor / weight */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Categoría *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {!variants && (
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">Sabor</label>
                <input
                  name="flavor"
                  value={form.flavor}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400"
                  placeholder="Chocolate"
                />
              </div>
            )}
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Peso</label>
              <input
                name="weight"
                value={form.weight}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400"
                placeholder="2kg"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
                className="w-4 h-4 accent-yellow-400"
              />
              <span className="text-zinc-300 text-sm">Destacado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="w-4 h-4 accent-yellow-400"
              />
              <span className="text-zinc-300 text-sm">Activo (visible)</span>
            </label>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              {product ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
