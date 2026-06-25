import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase, Product } from '@/lib/supabase'
import ProductCard from '@/components/product/ProductCard'
import { ArrowRight, Shield, Zap, Truck } from 'lucide-react'
import HeroCarousel from '@/components/home/HeroCarousel'
import TrainingCTA from '@/components/home/TrainingCTA'
import BrandMarquee from '@/components/home/BrandMarquee'

export const metadata: Metadata = {
  title: 'Cuatrouno Suplementos | Tienda de Suplementos en Escobar',
  description: 'Comprá suplementos deportivos de calidad en Escobar, Buenos Aires. Proteínas, creatina, pre-workout, vitaminas y más. Envíos a todo el país. Asesoramiento personalizado.',
  alternates: { canonical: 'https://cuatrouno-eccomerce.vercel.app' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Cuatrouno Suplementos',
  description: 'Tienda de suplementos deportivos en Escobar, Buenos Aires.',
  url: 'https://cuatrouno-eccomerce.vercel.app',
  telephone: '+5493484689931',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Escobar',
    addressRegion: 'Buenos Aires',
    addressCountry: 'AR',
  },
  geo: { '@type': 'GeoCoordinates', latitude: -34.3486727, longitude: -58.794372 },
  image: 'https://cuatrouno-eccomerce.vercel.app/pop-up.jpg',
  sameAs: ['https://www.instagram.com/cuatrouno_suplementos/'],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    opens: '09:00',
    closes: '20:00',
  },
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data } = await supabase
      .from('products').select('*').eq('featured', true).eq('active', true)
      .order('created_at', { ascending: false }).limit(10)
    return data || []
  } catch { return [] }
}

const categories = [
  { name: 'Proteínas', slug: 'proteinas' },
  { name: 'Creatina', slug: 'creatina' },
  { name: 'Pre-Workout', slug: 'pre-workout' },
  { name: 'Vitaminas', slug: 'vitaminas' },
  { name: 'Quemadores', slug: 'quemadores' },
  { name: 'Aminoácidos', slug: 'aminoacidos' },
  { name: 'Indumentaria', slug: 'indumentaria' },
]

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero carousel */}
      <HeroCarousel />

      {/* Trust bar */}
      <div style={{ backgroundColor: '#F5C518' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex flex-row sm:flex-row gap-0 sm:gap-12 justify-around sm:justify-center">
          {[{ icon: Shield, text: 'Marcas oficiales' }, { icon: Zap, text: 'Asesoramiento' }, { icon: Truck, text: 'Envíos gratis' }].map(({ icon: Icon, text }, idx) => (
            <div key={text} className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-black font-black uppercase tracking-widest text-center">
              <Icon size={13} />
              <span className="text-[8px] sm:text-[11px] leading-tight">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cash discount bar */}
      <div style={{ background: 'linear-gradient(90deg, #14532d 0%, #16a34a 50%, #14532d 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
          <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">💵</span>
          <span className="text-white font-black text-[10px] sm:text-xs uppercase tracking-widest">
            5% OFF abonando en efectivo
          </span>
          <span className="text-white/40 text-[10px]">·</span>
          <span className="text-white/70 text-[10px] sm:text-[11px] font-medium normal-case tracking-normal">Consultá en cada producto</span>
        </div>
      </div>

      {/* Categories */}
      <section className="bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6">Categorías</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-px" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/productos?cat=${cat.slug}`}
                className="bg-[#0f0f0f] hover:bg-[#1a0000] px-5 py-7 flex flex-col justify-between min-h-[100px] group transition-colors border-b-2 border-transparent hover:border-[#C41515]"
              >
                <span className="text-white/40 text-[11px] font-black uppercase tracking-widest group-hover:text-white transition-colors">{cat.name}</span>
                <ArrowRight size={12} className="text-white/10 group-hover:text-[#C41515] transition-colors self-end" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured - white */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/20 mb-2">Selección</p>
              <h2 className="text-black font-black text-3xl uppercase tracking-tight">Destacados</h2>
            </div>
            <Link href="/productos" className="text-black/30 hover:text-black text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-black/5">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <BrandMarquee />
      <TrainingCTA />

      {/* CTA - gold */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#f5c518', minHeight: '320px' }}>
        {/* Dot texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.55) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />

        {/* Person — desktop only */}
        <div className="hidden sm:flex absolute inset-0 pointer-events-none select-none overflow-hidden items-end justify-center" style={{ paddingLeft: '20%' }}>
          <img
            src="/entrenador.png"
            alt=""
            style={{
              height: '130%',
              width: 'auto',
              objectFit: 'contain',
              objectPosition: 'bottom',
              mixBlendMode: 'multiply',
              opacity: 0.45,
              filter: 'grayscale(1) contrast(1.2)',
              marginBottom: '-8%',
            }}
          />
        </div>

        {/* Content — texto adelante, centrado */}
        <div className="relative z-10 flex flex-col items-center text-center gap-5 px-6 py-14">
          <p className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: 'rgba(0,0,0,0.4)' }}>— Entrenador certificado</p>
          <h3 className="font-black uppercase tracking-tighter leading-[0.88]" style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', color: '#0f0800' }}>
            ¿NECESITÁS<br/>ASESORAMIENTO?
          </h3>
          <p className="text-sm max-w-sm" style={{ color: 'rgba(0,0,0,0.55)' }}>
            Te ayudo a elegir el suplemento ideal para tus objetivos.
          </p>
          <a
            href={`https://wa.me/5493484689931?text=${encodeURIComponent('Hola! Quiero asesoramiento para elegir suplementos.')}`}
            target="_blank" rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 overflow-hidden font-black px-8 py-4 text-xs uppercase tracking-widest transition-all hover:scale-[1.02]"
            style={{ backgroundColor: '#0f0800', color: '#f5c518' }}
          >
            <span className="relative z-10">Hablar por WhatsApp</span>
            <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </a>
        </div>
      </section>
    </div>
  )
}
