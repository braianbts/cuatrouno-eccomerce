'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

// Reset on hard refresh (module re-evaluates), persists across SPA navigation
let introPlayed = false

export default function IntroSplash() {
  const pathname = usePathname()
  const [phase, setPhase] = useState<'hidden' | 'in' | 'hold' | 'exit' | 'done'>('hidden')

  useEffect(() => {
    if (pathname !== '/') {
      setPhase('done')
      return
    }
    if (introPlayed) {
      setPhase('done')
      return
    }
    introPlayed = true
    setPhase('hidden')

    const t1 = setTimeout(() => setPhase('in'),   80)
    const t2 = setTimeout(() => setPhase('hold'), 900)
    const t3 = setTimeout(() => setPhase('exit'), 3000)
    const t4 = setTimeout(() => setPhase('done'), 4200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [pathname])

  if (phase === 'done') return null

  const visible = phase === 'in' || phase === 'hold'
  const exiting = phase === 'exit'

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        opacity: exiting ? 0 : 1,
        transition: exiting ? 'opacity 1.1s cubic-bezier(0.4,0,0.2,1)' : 'none',
        pointerEvents: exiting ? 'none' : 'all',
        background: '#080808',
      }}
    >
      {/* Ambient glow — expands slowly */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 55%, rgba(196,21,21,0.22) 0%, transparent 100%)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.6)',
          transition: 'opacity 1.4s ease, transform 1.8s cubic-bezier(0.16,1,0.3,1)',
        }}
      />

      {/* Very subtle noise grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }}
      />

      {/* Thin horizontal accent lines */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: '50%',
          marginTop: '-90px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(196,21,21,0.5) 30%, rgba(196,21,21,0.8) 50%, rgba(196,21,21,0.5) 70%, transparent 100%)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'opacity 0.6s ease 0.5s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s',
        }}
      />
      <div
        className="absolute left-0 right-0"
        style={{
          top: '50%',
          marginTop: '90px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(196,21,21,0.5) 30%, rgba(196,21,21,0.8) 50%, rgba(196,21,21,0.5) 70%, transparent 100%)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'opacity 0.6s ease 0.6s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s',
        }}
      />

      {/* Logo — original colors */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.92)',
          transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 1.1s cubic-bezier(0.16,1,0.3,1) 0.1s',
          filter: 'drop-shadow(0 0 60px rgba(196,21,21,0.35)) drop-shadow(0 0 20px rgba(196,21,21,0.2))',
        }}
      >
        <Image
          src="/logo.png"
          alt="Cuatrouno Suplementos"
          width={340}
          height={120}
          priority
          className="w-[260px] sm:w-[340px] object-contain"
        />
      </div>

      {/* Tagline */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          marginTop: '28px',
          opacity: phase === 'hold' ? 1 : 0,
          transform: phase === 'hold' ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.7s ease 0.2s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s',
          textAlign: 'center',
        }}
      >
        <p style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: '8px',
          fontWeight: 900,
          letterSpacing: '0.55em',
          textTransform: 'uppercase',
        }}>
          Suplementos &nbsp;·&nbsp; Escobar &nbsp;·&nbsp; Buenos Aires
        </p>
      </div>

      {/* By Braian Barrientos */}
      <div
        style={{
          position: 'absolute',
          bottom: '28px',
          left: 0,
          right: 0,
          zIndex: 2,
          textAlign: 'center',
          opacity: phase === 'hold' ? 1 : 0,
          transform: phase === 'hold' ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.8s ease 0.5s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s',
        }}
      >
        <p style={{
          color: 'rgba(255,255,255,0.25)',
          fontSize: '11px',
          fontWeight: 400,
          letterSpacing: '0.2em',
          fontStyle: 'italic',
        }}>
          by <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontStyle: 'normal', fontSize: '13px' }}>Braian Barrientos</span>
        </p>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          style={{
            height: '100%',
            backgroundColor: '#C41515',
            boxShadow: '0 0 12px 2px #C41515',
            width: phase === 'hold' || phase === 'exit' ? '100%' : '0%',
            transition: phase === 'hold' ? 'width 2.1s cubic-bezier(0.4,0,0.2,1)' : 'none',
          }}
        />
      </div>
    </div>
  )
}
