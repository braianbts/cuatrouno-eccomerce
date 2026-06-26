import Image from 'next/image'
import Link from 'next/link'
import { supabase, Product } from '@/lib/supabase'

async function getIndumentaria(): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'indumentaria')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(4)
  return data || []
}

export default async function IndumentariaSection() {
  const products = await getIndumentaria()
  if (products.length === 0) return null

  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: '16/6.2' }}>
      {/* Background image */}
      <Image
        src="/sectionindumentaria.jpg"
        alt="Indumentaria Cuatrouno Training Club"
        fill
        className="object-cover object-center"
        quality={95}
        sizes="100vw"
      />

      {/* Cards overlay — right ~40% matching red rectangle */}
      <div className="absolute inset-0 flex items-center justify-end pr-[4%]">
        <div className="flex flex-col gap-2 w-[36%]">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Training Club</p>
          <div className="grid grid-cols-2 gap-2">
            {products.slice(0, 4).map(p => (
              <Link
                key={p.id}
                href={`/producto/${p.slug}`}
                className="group bg-black/60 backdrop-blur-sm border border-white/10 hover:border-[#C41515]/60 transition-all duration-200 overflow-hidden"
              >
                <div className="relative aspect-square bg-black/40">
                  {p.images?.[0] && (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="px-2 py-1.5">
                  <p className="text-white text-[9px] font-black uppercase leading-tight line-clamp-1 group-hover:text-[#C41515] transition-colors">
                    {p.name}
                  </p>
                  <p className="text-[#C41515] text-[9px] font-black mt-0.5">
                    ${p.price.toLocaleString('es-AR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/productos?cat=indumentaria"
            className="text-center text-white font-black text-[9px] uppercase tracking-widest py-2 mt-1 transition-all hover:opacity-80"
            style={{ backgroundColor: '#C41515' }}
          >
            Ver toda la ropa →
          </Link>
        </div>
      </div>
    </section>
  )
}
