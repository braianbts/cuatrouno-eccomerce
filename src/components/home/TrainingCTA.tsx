'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function TrainingCTA() {
  return (
    <section className="relative overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #fff, #fff 1px, transparent 1px, transparent 60px)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 80% at 30% 50%, rgba(196,21,21,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row gap-16 items-center">

          {/* Image — left, fixed width */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="relative group">
              {/* Corner accents */}
              <span className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 z-10" style={{ borderColor: '#C41515' }} />
              <span className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 z-10" style={{ borderColor: '#C41515' }} />
              <span className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 z-10" style={{ borderColor: '#C41515' }} />
              <span className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 z-10" style={{ borderColor: '#C41515' }} />
              <div className="absolute inset-0 border border-white/6" />
              {/* Glow */}
              <div className="absolute -inset-4 blur-2xl opacity-20 -z-10" style={{ background: 'radial-gradient(#C41515, transparent 70%)' }} />
              <Image
                src="/training-club.jpg"
                alt="Cuatrouno Training Club — Braian BTS"
                width={560}
                height={340}
                className="w-full object-cover group-hover:scale-[1.015] transition-transform duration-500"
                quality={95}
              />
            </div>
          </div>

          {/* Text — right */}
          <div className="flex flex-col gap-7">
            <div className="flex items-center gap-3">
              <div className="w-6 h-[2px]" style={{ backgroundColor: '#C41515' }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: '#C41515' }}>Asesorías personalizadas</span>
            </div>

            <h2 className="text-white font-black text-[clamp(2.4rem,5vw,4rem)] leading-[0.92] uppercase tracking-tighter">
              DEJÁ DE<br />
              IMPROVISAR<br />
              <span style={{ color: '#C41515' }}>EN EL GYM.</span>
            </h2>

            <p className="text-white/35 text-sm leading-relaxed max-w-sm">
              Entrenamiento 1:1 con sistema claro: vas a saber qué hacer, cómo hacerlo y cómo sostenerlo en el tiempo. Sin vueltas.
            </p>

            {/* Stats */}
            <div className="flex gap-10">
              {[['1:1', 'Personalizado'], ['100%', 'Online']].map(([val, label]) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-white font-black text-2xl">{val}</span>
                  <span className="text-white/25 text-[9px] uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <Link
                href="https://www.braianbarrientos.com.ar/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-3 font-black text-xs uppercase tracking-widest text-white px-8 py-4 overflow-hidden transition-all duration-300"
                style={{ backgroundColor: '#C41515' }}
              >
                <span className="relative z-10">Ver asesorías</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-200">→</span>
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
