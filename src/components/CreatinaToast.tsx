'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const DAYS: Record<number, { pregunta: string; producto: string; slug: string }> = {
  0: { pregunta: '¿Descansaste bien este domingo?', producto: 'Día de recuperación — probá la Ashwagandha 🧘', slug: 'vitaminas' },
  1: { pregunta: '¿Arrancaste la semana con todo, lunes?', producto: 'Empezá con pre-workout 🔥', slug: 'pre-workout' },
  2: { pregunta: '¿Ya entrenaste hoy, martes?', producto: 'Sin excusas — llevate tu creatina', slug: 'creatina' },
  3: { pregunta: '¿Tomaste tu creatina hoy, miércoles?', producto: 'Te la conseguimos ahora 👇', slug: 'creatina' },
  4: { pregunta: '¿Llegás al jueves con energía?', producto: 'El pre-workout que necesitás', slug: 'pre-workout' },
  5: { pregunta: '¿Cerrás la semana entrenando, viernes?', producto: 'Dale, llevate tu proteína', slug: 'proteinas' },
  6: { pregunta: '¿Sábado de gym o sábado de sillón?', producto: 'Proteína para el que entrena 💪', slug: 'proteinas' },
}

const CONFETTI_COLORS = ['#C41515', '#f5c518', '#ffffff', '#ff6b6b', '#ffd93d']

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            left: `${Math.random() * 100}%`,
            top: '-8px',
            animation: `confettiFall ${0.8 + Math.random() * 0.8}s ease-in forwards`,
            animationDelay: `${Math.random() * 0.4}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}

export default function CreatinaToast() {
  const [visible, setVisible] = useState(false)
  const [answered, setAnswered] = useState<'si' | 'no' | null>(null)
  const [closing, setClosing] = useState(false)

  const day = new Date().getDay()
  const { pregunta, producto, slug } = DAYS[day]

  useEffect(() => {
    const key = `creatina-toast-${new Date().toLocaleDateString('es-AR')}`
    if (localStorage.getItem(key)) return
    const t = setTimeout(() => setVisible(true), 3500)
    return () => clearTimeout(t)
  }, [])

  const close = () => {
    setClosing(true)
    const key = `creatina-toast-${new Date().toLocaleDateString('es-AR')}`
    localStorage.setItem(key, '1')
    setTimeout(() => setVisible(false), 350)
  }

  const handleSi = () => {
    setAnswered('si')
    setTimeout(close, 2200)
  }

  const handleNo = () => {
    setAnswered('no')
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(24px) scale(0.95); }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120px) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(196,21,21,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(196,21,21,0); }
        }
      `}</style>

      {/* Backdrop subtle */}
      <div
        className="fixed inset-0 z-[90] pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.15)' }}
      />

      <div
        className="fixed bottom-24 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2"
        style={{
          animation: closing ? 'toastOut 0.35s ease forwards' : 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
      >
        <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-2xl overflow-hidden">
          {/* Red top accent */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #C41515, #f5c518, #C41515)' }} />

          {answered === 'si' && <Confetti />}

          <button
            onClick={close}
            className="absolute top-3 right-3 text-zinc-600 hover:text-zinc-300 text-lg leading-none"
          >×</button>

          {answered === null && (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                CUATROUNO SUPLEMENTOS
              </p>
              <p className="text-white font-black text-lg leading-tight mb-5">
                {pregunta}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSi}
                  className="flex-1 bg-green-500 hover:bg-green-400 text-white font-black py-3 rounded-xl text-sm transition-all hover:scale-105 active:scale-95"
                  style={{ animation: 'pulse-glow 2s infinite' }}
                >
                  ✅ SÍ, CRACK
                </button>
                <button
                  onClick={handleNo}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-black py-3 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 border border-zinc-700"
                >
                  😅 NO TODAVÍA
                </button>
              </div>
            </>
          )}

          {answered === 'si' && (
            <div className="text-center py-2">
              <p className="text-4xl mb-2">🔥</p>
              <p className="text-white font-black text-xl">¡Sos una máquina!</p>
              <p className="text-zinc-400 text-sm mt-1">Seguí así, campeón 💪</p>
            </div>
          )}

          {answered === 'no' && (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">
                NO HAY EXCUSAS 😤
              </p>
              <p className="text-white font-black text-base leading-tight mb-4">
                {producto}
              </p>
              <Link
                href={`/productos?cat=${slug}`}
                onClick={close}
                className="block w-full text-center font-black py-3 rounded-xl text-sm transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#C41515', color: '#fff' }}
              >
                VER PRODUCTOS →
              </Link>
              <button
                onClick={close}
                className="block w-full text-center text-zinc-600 text-xs mt-2 hover:text-zinc-400 transition-colors"
              >
                después lo veo
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
