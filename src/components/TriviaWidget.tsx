'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTrivia } from '@/store/trivia'
import { X, Tag, Trophy } from 'lucide-react'

const QUESTIONS = [
  {
    q: '¿Cuántos gramos de creatina se recomiendan por día en mantenimiento?',
    options: ['2g', '5g', '10g', '20g'],
    answer: 1,
  },
  {
    q: '¿Para qué sirven los BCAAs?',
    options: ['Quemar grasa', 'Recuperación muscular y reducir catabolismo', 'Aumentar testosterona', 'Mejorar el sueño'],
    answer: 1,
  },
  {
    q: '¿Cuándo es más efectivo tomar proteína whey?',
    options: ['Antes de dormir', 'En ayunas', 'Dentro de los 30-60 min post-entrenamiento', 'A mediodía'],
    answer: 2,
  },
  {
    q: '¿Qué aportan principalmente los gainers?',
    options: ['Proteínas y grasas', 'Carbohidratos y proteínas', 'Solo proteínas', 'Vitaminas'],
    answer: 1,
  },
  {
    q: '¿Cuál de estos se usa como pre-entrenamiento energizante?',
    options: ['Colágeno', 'Omega 3', 'Cafeína', 'ZMA'],
    answer: 2,
  },
  {
    q: '¿Para qué sirve el colágeno hidrolizado en deportistas?',
    options: ['Aumentar masa muscular', 'Recuperar articulaciones y tendones', 'Bajar de peso', 'Mejorar resistencia cardiovascular'],
    answer: 1,
  },
]

export default function TriviaWidget() {
  const pathname = usePathname()
  const { hasDiscount, setDiscount } = useTrivia()
  const [open, setOpen] = useState(false)

  if (pathname.startsWith('/mayorista') || pathname.startsWith('/admin')) return null
  const [qIndex] = useState(() => Math.floor(Math.random() * QUESTIONS.length))
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const q = QUESTIONS[qIndex]
  const correct = submitted && selected === q.answer

  const handleSubmit = () => {
    if (selected === null) return
    setSubmitted(true)
    if (selected === q.answer) setDiscount(true)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => !hasDiscount && setOpen(true)}
        title={hasDiscount ? '¡Descuento aplicado!' : 'Jugá y ganá 5% off'}
        className="fixed z-40 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          bottom: '96px',
          right: '24px',
          backgroundColor: hasDiscount ? '#fff' : '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
          border: hasDiscount ? '1.5px solid #16a34a' : '1.5px solid #e5e7eb',
          animation: hasDiscount ? 'none' : 'trivia-glow 2.4s ease-in-out infinite',
        }}
      >
        {hasDiscount
          ? <Trophy size={18} strokeWidth={1.8} style={{ color: '#16a34a' }} />
          : (
            <>
              <span style={{ display: 'inline-flex', animation: 'trivia-rock 2.4s ease-in-out infinite' }}>
                <Tag size={20} strokeWidth={1.8} style={{ color: '#C41515' }} />
              </span>
              <style>{`
                @keyframes trivia-rock {
                  0%, 100% { transform: rotate(0deg) scale(1); }
                  15% { transform: rotate(-18deg) scale(1.1); }
                  35% { transform: rotate(14deg) scale(1.08); }
                  50% { transform: rotate(-8deg) scale(1.04); }
                  65% { transform: rotate(5deg) scale(1.02); }
                  80% { transform: rotate(0deg) scale(1); }
                }
                @keyframes trivia-glow {
                  0%, 100% { box-shadow: 0 2px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1); }
                  50% { box-shadow: 0 2px 12px rgba(0,0,0,0.15), 0 0 0 4px rgba(196,21,21,0.12), 0 0 16px rgba(196,21,21,0.2); }
                }
              `}</style>
            </>
          )
        }
      </button>

      {/* Modal */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed z-[70] w-[92vw] max-w-sm"
            style={{ bottom: '96px', right: '24px' }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: '#fff',
                boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Trivia</p>
                  <h3 className="text-gray-900 font-semibold text-sm leading-tight">
                    {!submitted ? 'Respondé y ganá 5% off' : correct ? '¡Correcto!' : 'Casi...'}
                  </h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
                >
                  <X size={16} strokeWidth={1.8} />
                </button>
              </div>

              <div className="px-5 pb-5">
                {!submitted ? (
                  <>
                    <p className="text-gray-600 text-[13px] leading-relaxed mb-4">{q.q}</p>

                    <div className="space-y-2 mb-5">
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setSelected(i)}
                          className="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-150"
                          style={{
                            backgroundColor: selected === i ? '#f0fdf4' : '#f9fafb',
                            border: selected === i ? '1.5px solid #16a34a' : '1.5px solid transparent',
                            color: selected === i ? '#15803d' : '#374151',
                            fontWeight: selected === i ? 600 : 400,
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={selected === null}
                      className="w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 disabled:opacity-40"
                      style={{
                        backgroundColor: selected !== null ? '#111' : '#111',
                        color: '#fff',
                      }}
                    >
                      Confirmar
                    </button>
                  </>
                ) : correct ? (
                  <div className="text-center py-2">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ backgroundColor: '#f0fdf4' }}
                    >
                      <Trophy size={20} strokeWidth={1.8} style={{ color: '#16a34a' }} />
                    </div>
                    <p className="text-gray-500 text-[12px] mb-4 leading-relaxed">
                      Tu descuento de <strong className="text-gray-900">5% off</strong> ya está aplicado en el carrito.
                    </p>
                    <button
                      onClick={() => setOpen(false)}
                      className="w-full py-2.5 rounded-xl text-[13px] font-semibold"
                      style={{ backgroundColor: '#111', color: '#fff' }}
                    >
                      Ir a comprar
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ backgroundColor: '#fef2f2' }}
                    >
                      <X size={20} strokeWidth={1.8} style={{ color: '#dc2626' }} />
                    </div>
                    <p className="text-gray-500 text-[12px] mb-1 leading-relaxed">
                      La respuesta era <strong className="text-gray-900">{q.options[q.answer]}</strong>.
                    </p>
                    <p className="text-gray-400 text-[11px] mb-4">Consultá con nuestro equipo para más info 💪</p>
                    <button
                      onClick={() => setOpen(false)}
                      className="w-full py-2.5 rounded-xl text-[13px] font-semibold"
                      style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
