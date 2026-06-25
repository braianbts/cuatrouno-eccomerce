import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://cuatrouno-eccomerce.vercel.app'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: product } = await supabase
    .from('products')
    .select('name, description, images, brand, price, category')
    .eq('slug', slug)
    .single()

  if (!product) return { title: 'Producto no encontrado' }

  const image = product.images?.[0] ?? `${SITE_URL}/pop-up.jpg`
  const title = `${product.name} — ${product.brand}`
  const description = product.description
    ? product.description.slice(0, 155)
    : `Comprá ${product.name} de ${product.brand} en Cuatrouno Suplementos. Envíos a todo el país.`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/producto/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/producto/${slug}`,
      images: [{ url: image, width: 1024, height: 1024, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default function ProductoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
