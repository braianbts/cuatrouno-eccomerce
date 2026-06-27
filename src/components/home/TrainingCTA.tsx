'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function TrainingCTA() {
  return (
    <section className="relative bg-black overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

          {/* Image */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="overflow-hidden" style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }}>
              <Image
                src="/training-club.jpg"
                alt="Cuatrouno Training Club — Braian BTS"
                width={560}
                height={340}
                className="w-full object-cover hover:scale-[1.03] transition-transform duration-700 ease-out"
                quality={95}
              />
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: '#C41515' }}>
              Asesorías personalizadas
            </p>

            <h2 className="text-white font-black text-[clamp(2.2rem,5vw,3.8rem)] leading-[0.9] uppercase tracking-tight">
              DEJÁ DE<br />
              IMPROVISAR<br />
              <span style={{ color: '#C41515' }}>EN EL GYM.</span>
            </h2>

            <p className="text-white/40 text-[14px] leading-relaxed max-w-sm">
              Entrenamiento 1:1 con sistema claro: vas a saber qué hacer, cómo hacerlo y cómo sostenerlo en el tiempo. Sin vueltas.
            </p>

            {/* Stats */}
            <div className="flex gap-8 pt-1">
              {[['1:1', 'Personalizado'], ['100%', 'Online']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-white font-black text-2xl leading-none mb-1">{val}</p>
                  <p className="text-white/25 text-[10px] uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="https://www.braianbarrientos.com.ar/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 font-semibold text-[13px] text-white px-7 py-3.5 transition-all duration-200 hover:gap-4"
                style={{ backgroundColor: '#C41515' }}
              >
                Ver asesorías
                <span>→</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
