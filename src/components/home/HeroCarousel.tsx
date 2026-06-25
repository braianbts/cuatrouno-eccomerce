'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const desktopSlides = [
  { src: '/banner-1.jpg', alt: 'No es ropa. Es disciplina.' },
  { src: '/banner-2.jpg', alt: 'Envíos gratis Escobar y alrededores.' },
]

const mobileSlides = [
  { src: '/banner-cel1.jpeg', alt: 'No es ropa. Es disciplina.' },
  { src: '/banner-cel2.jpeg', alt: 'Envíos gratis Escobar y alrededores.' },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent((c) => (c + 1) % desktopSlides.length), [])
  const prev = () => setCurrent((c) => (c - 1 + desktopSlides.length) % desktopSlides.length)

  useEffect(() => {
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [next])

  return (
    <>
      {/* Desktop carousel — 16:6 ratio */}
      <div className="hidden sm:block relative w-full overflow-hidden bg-black" style={{ aspectRatio: '16/6' }}>
        {desktopSlides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: current === i ? 1 : 0, zIndex: current === i ? 1 : 0 }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover object-center"
              priority={i === 0}
              quality={100}
              sizes="100vw"
            />
          </div>
        ))}

        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors text-lg font-black">‹</button>
        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors text-lg font-black">›</button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {desktopSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className="w-1.5 h-1.5 transition-all" style={{ backgroundColor: current === i ? '#C41515' : 'rgba(255,255,255,0.4)' }} />
          ))}
        </div>

        <div className="absolute inset-0 z-10 flex items-end pointer-events-none">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <Link href="/productos" className="pointer-events-auto inline-flex items-center gap-2 text-white font-black px-6 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-90" style={{ backgroundColor: '#C41515' }}>
              Ver productos →
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile carousel — tall ratio for portrait images */}
      <div className="block sm:hidden relative w-full overflow-hidden bg-black" style={{ aspectRatio: '9/14' }}>
        {mobileSlides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: current === i ? 1 : 0, zIndex: current === i ? 1 : 0 }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover object-center"
              priority={i === 0}
              quality={100}
              sizes="100vw"
            />
          </div>
        ))}

        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors text-lg font-black">‹</button>
        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors text-lg font-black">›</button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {mobileSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className="w-1.5 h-1.5 transition-all" style={{ backgroundColor: current === i ? '#C41515' : 'rgba(255,255,255,0.4)' }} />
          ))}
        </div>

        <div className="absolute inset-0 z-10 flex items-end pointer-events-none">
          <div className="w-full px-4 pb-6">
            <Link href="/productos" className="pointer-events-auto inline-flex items-center gap-2 text-white font-black px-6 py-3 text-xs uppercase tracking-widest" style={{ backgroundColor: '#C41515' }}>
              Ver productos →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
