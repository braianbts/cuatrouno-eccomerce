'use client'

const brands = [
  'STAR NUTRITION', 'ENA', 'TNT', 'ONE FIT', 'MUTANT', 'OPTIMUM NUTRITION',
  'DYMATIZE', 'BSN', 'UNIVERSAL', 'MUSCLETECH',
]

export default function BrandMarquee() {
  const repeated = [...brands, ...brands, ...brands]

  return (
    <div className="bg-black border-t border-b border-white/5 py-5 overflow-hidden">
      <div className="flex gap-12 animate-ticker whitespace-nowrap">
        {repeated.map((brand, i) => (
          <span key={i} className="shrink-0 flex items-center gap-12">
            <span className="text-white/20 text-xs font-black uppercase tracking-[0.3em]">{brand}</span>
            <span style={{ color: '#C41515', fontSize: '8px' }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
