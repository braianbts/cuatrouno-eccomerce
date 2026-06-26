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

  const electricStyles = `
    @keyframes electric-pulse {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    @keyframes electric-pulse2 {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    .elec-top .elec-spark { animation: electric-pulse 1.8s linear infinite; }
    .elec-top .elec-spark2 { animation: electric-pulse 1.8s linear infinite 0.9s; }
    .elec-bot .elec-spark { animation: electric-pulse2 2.2s linear infinite 0.3s; }
    .elec-bot .elec-spark2 { animation: electric-pulse2 2.2s linear infinite 1.4s; }
    @keyframes float-shirt {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-10px); }
    }
    @keyframes smoke1 {
      0%   { transform: translateY(0) scale(1);   opacity: 0.18; }
      50%  { transform: translateY(-18px) scale(1.15); opacity: 0.28; }
      100% { transform: translateY(0) scale(1);   opacity: 0.18; }
    }
    @keyframes smoke2 {
      0%   { transform: translateY(0) scale(1.05); opacity: 0.12; }
      50%  { transform: translateY(-12px) scale(0.95); opacity: 0.22; }
      100% { transform: translateY(0) scale(1.05); opacity: 0.12; }
    }
    @keyframes smoke3 {
      0%   { transform: translateY(0) scaleX(1);   opacity: 0.08; }
      50%  { transform: translateY(-8px) scaleX(1.1); opacity: 0.16; }
      100% { transform: translateY(0) scaleX(1);   opacity: 0.08; }
    }
  `

  const ElectricTop = () => (
    <div className="elec-top absolute top-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: '4px' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #C41515 0%, rgba(196,21,21,0.4) 60%, transparent 100%)' }} />
      <div className="elec-spark absolute top-0 h-full w-[30%]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,80,80,0.0) 20%, rgba(255,180,180,0.9) 50%, rgba(255,80,80,0.0) 80%, transparent 100%)', filter: 'blur(1px)' }} />
      <div className="elec-spark2 absolute top-0 h-full w-[20%]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,60,60,0.0) 20%, rgba(255,255,255,0.7) 50%, rgba(255,60,60,0.0) 80%, transparent 100%)', filter: 'blur(0.5px)' }} />
      <div className="absolute inset-0 scale-y-[3] origin-top opacity-40" style={{ background: 'linear-gradient(90deg, #C41515 0%, rgba(196,21,21,0.3) 60%, transparent 100%)' }} />
    </div>
  )

  const ElectricBot = () => (
    <div className="elec-bot absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: '4px' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #C41515 0%, rgba(196,21,21,0.4) 60%, transparent 100%)' }} />
      <div className="elec-spark absolute top-0 h-full w-[30%]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,80,80,0.0) 20%, rgba(255,180,180,0.9) 50%, rgba(255,80,80,0.0) 80%, transparent 100%)', filter: 'blur(1px)' }} />
      <div className="elec-spark2 absolute top-0 h-full w-[20%]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,60,60,0.0) 20%, rgba(255,255,255,0.7) 50%, rgba(255,60,60,0.0) 80%, transparent 100%)', filter: 'blur(0.5px)' }} />
      <div className="absolute inset-0 scale-y-[3] origin-bottom opacity-40" style={{ background: 'linear-gradient(90deg, #C41515 0%, rgba(196,21,21,0.3) 60%, transparent 100%)' }} />
    </div>
  )

  return (
    <>
      <style>{electricStyles}</style>

      {/* ── DESKTOP ── */}
      <section className="hidden sm:block relative w-full overflow-hidden bg-black" style={{ aspectRatio: '16/5.8' }}>
        <Image src="/sectionindumentariadesktopsinremera.jpg" alt="Indumentaria Cuatrouno Training Club" fill className="object-contain object-left" quality={95} sizes="100vw" />

        <ElectricTop />
        <ElectricBot />

        {/* Remera flotando — izquierda 20%, bottom 20% */}
        <div className="absolute pointer-events-none" style={{ left: '13%', bottom: '30%', width: '19%' }}>
          <div style={{ position: 'relative' }}>
            {/* Humo detrás desktop */}
            <div style={{ position: 'absolute', inset: '-40% -50%', zIndex: 0, animation: 'float-shirt 3s ease-in-out infinite' }}>
              <div style={{ position: 'absolute', inset: '15% 10%', borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 65%, rgba(196,21,21,0.35) 0%, rgba(196,21,21,0.12) 40%, transparent 70%)', filter: 'blur(14px)', animation: 'smoke1 4s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 60%, rgba(230,230,255,0.30) 0%, rgba(160,160,200,0.14) 45%, transparent 68%)', filter: 'blur(18px)', animation: 'smoke2 5s ease-in-out infinite 0.5s' }} />
              <div style={{ position: 'absolute', inset: '-10% -5%', borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 70%, rgba(200,200,220,0.18) 0%, rgba(100,100,150,0.06) 55%, transparent 75%)', filter: 'blur(24px)', animation: 'smoke3 6s ease-in-out infinite 1s' }} />
              <div style={{ position: 'absolute', inset: '25% 20%', borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 60%, rgba(255,60,60,0.45) 0%, transparent 50%)', filter: 'blur(10px)', animation: 'smoke1 3.5s ease-in-out infinite 0.3s' }} />
            </div>
            <Image src="/remerasinfondo.png" alt="Remera Training Club" width={0} height={0} sizes="22vw" style={{ width: '100%', height: 'auto', display: 'block', position: 'relative', zIndex: 1, animation: 'float-shirt 3s ease-in-out infinite' }} />
          </div>
        </div>

        {/* Cards — derecha */}
        <div className="absolute inset-0 flex items-center justify-end pr-[30%] pb-[4%]">
          <div className="flex flex-col gap-2 w-[25%]">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Training Club</p>
            <div className="grid grid-cols-1 gap-2">
              {products.slice(0, 1).map(p => (
                <Link key={p.id} href={`/producto/${p.slug}`} className="group bg-black/60 backdrop-blur-sm border border-white/10 hover:border-[#C41515]/60 transition-all duration-200 overflow-hidden">
                  <div className="relative aspect-square bg-black/40">
                    {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-300" />}
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-white text-[9px] font-black uppercase leading-tight line-clamp-1 group-hover:text-[#C41515] transition-colors">{p.name}</p>
                    <p className="text-[#C41515] text-[9px] font-black mt-0.5">${p.price.toLocaleString('es-AR')}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/productos?cat=indumentaria" className="text-center text-white font-black text-[9px] uppercase tracking-widest py-2 mt-1 transition-all hover:opacity-80" style={{ backgroundColor: '#C41515' }}>
              Ver toda la ropa →
            </Link>
          </div>
        </div>
      </section>

      {/* ── MOBILE ── */}
      <section className="block sm:hidden w-full bg-black overflow-hidden">
        <ElectricTop />

        {/* Imagen con cards overlay arriba */}
        <div className="relative w-full">
          <Image src="/fondosinremeramobile.jpg" alt="Indumentaria Cuatrouno Training Club" width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto', display: 'block' }} quality={90} />

          {/* Remera flotando sobre el fondo */}
          <div className="absolute left-0 right-0 pointer-events-none" style={{ bottom: '11%' }}>
            {/* Humo detrás */}
            <div style={{ position: 'relative', width: '65%', margin: '0 auto' }}>
              <div style={{ position: 'absolute', inset: '-35% -40%', zIndex: 0, animation: 'float-shirt 3s ease-in-out infinite' }}>
                {/* Glow rojo base */}
                <div style={{ position: 'absolute', inset: '15% 10%', borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 65%, rgba(196,21,21,0.35) 0%, rgba(196,21,21,0.12) 40%, transparent 70%)', filter: 'blur(12px)', animation: 'smoke1 4s ease-in-out infinite' }} />
                {/* Humo blanco/gris principal */}
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 60%, rgba(230,230,255,0.30) 0%, rgba(160,160,200,0.14) 45%, transparent 68%)', filter: 'blur(16px)', animation: 'smoke2 5s ease-in-out infinite 0.5s' }} />
                {/* Humo exterior difuso */}
                <div style={{ position: 'absolute', inset: '-10% -5%', borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 70%, rgba(200,200,220,0.18) 0%, rgba(100,100,150,0.06) 55%, transparent 75%)', filter: 'blur(22px)', animation: 'smoke3 6s ease-in-out infinite 1s' }} />
                {/* Chispa roja intensa centro */}
                <div style={{ position: 'absolute', inset: '25% 20%', borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 60%, rgba(255,60,60,0.45) 0%, transparent 50%)', filter: 'blur(8px)', animation: 'smoke1 3.5s ease-in-out infinite 0.3s' }} />
              </div>
              <Image src="/remerasinfondo.png" alt="" width={0} height={0} sizes="65vw" style={{ width: '100%', height: 'auto', display: 'block', position: 'relative', zIndex: 1, animation: 'float-shirt 3s ease-in-out infinite' }} />
            </div>
          </div>

          {/* Cards sobre el aire superior de la imagen */}
          <div className="absolute top-[6%] left-0 right-0 px-3 pt-4">
            <p className="text-white/60 text-[8px] font-black uppercase tracking-[0.3em] mb-2">Training Club</p>
            <div className="grid grid-cols-2 gap-2">
              {products.slice(0, 2).map(p => (
                <Link key={p.id} href={`/producto/${p.slug}`} className="group bg-black/60 backdrop-blur-sm border border-white/10 active:border-[#C41515]/60 transition-all duration-200 overflow-hidden">
                  <div className="relative aspect-square bg-black/40">
                    {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-contain p-2" />}
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-white text-[9px] font-black uppercase leading-tight line-clamp-1">{p.name}</p>
                    <p className="text-[#C41515] text-[9px] font-black mt-0.5">${p.price.toLocaleString('es-AR')}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/productos?cat=indumentaria" className="block text-center text-white font-black text-[8px] uppercase tracking-widest py-2 mt-2" style={{ backgroundColor: '#C41515' }}>
              Ver toda la ropa →
            </Link>
          </div>
        </div>

        <ElectricBot />
      </section>
    </>
  )
}
