'use client'

import { X, Trash2, MessageCircle, ShoppingBag } from 'lucide-react'
import { useCart } from '@/store/cart'
import Image from 'next/image'
import { useState } from 'react'

type Props = { open: boolean; onClose: () => void }
type PayMethod = 'efectivo' | 'transferencia' | 'cuotas' | ''

export default function CartDrawer({ open, onClose }: Props) {
  const { items, remove, update, total, buildWhatsAppMessage, clear } = useCart()
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  const [payMethod, setPayMethod] = useState<PayMethod>('')

  const handleCheckout = () => {
    if (!payMethod) return
    const msg = buildWhatsAppMessage(payMethod)
    window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank')
  }

  const t = total()
  const precioEfectivo = Math.round(t * 0.95)
  const precioCuota = Math.ceil(t / 0.9077 / 3)

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/80 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#0f0f0f] border-l border-white/5 z-50 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
            <ShoppingBag size={16} style={{ color: '#C41515' }} />
            Tu pedido
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center text-white/20 mt-20">
              <ShoppingBag size={40} className="mx-auto mb-3" />
              <p className="text-xs uppercase tracking-widest">Carrito vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-3 bg-[#1a1a1a] p-3">
                {item.product.images?.[0] && (
                  <div className="relative w-16 h-16 flex-shrink-0 bg-[#222]">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold uppercase leading-tight line-clamp-2">{item.product.name}</p>
                  <p className="font-black text-sm mt-1" style={{ color: '#C41515' }}>
                    ${item.product.price.toLocaleString('es-AR')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => update(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 bg-[#333] text-white text-sm flex items-center justify-center hover:bg-[#444] transition-colors"
                    >
                      −
                    </button>
                    <span className="text-white text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => update(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 bg-[#333] text-white text-sm flex items-center justify-center hover:bg-[#444] transition-colors"
                    >
                      +
                    </button>
                    <button
                      onClick={() => remove(item.product.id)}
                      className="ml-auto text-white/20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-white/5 space-y-3">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-white/40 text-xs uppercase tracking-widest">Total</span>
              <span className="font-black text-2xl text-white">${t.toLocaleString('es-AR')}</span>
            </div>

            {/* Payment method selector */}
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Método de pago</p>
            <div className="space-y-2 mb-4">
              {[
                { id: 'efectivo' as PayMethod, label: '💵 Efectivo', sub: `$${precioEfectivo.toLocaleString('es-AR')} — 5% off`, color: '#16a34a' },
                { id: 'transferencia' as PayMethod, label: '🏦 Transferencia', sub: `$${t.toLocaleString('es-AR')}`, color: '#a16207' },
                { id: 'cuotas' as PayMethod, label: '💳 3 cuotas s/interés', sub: `3 × $${precioCuota.toLocaleString('es-AR')} · no Amex`, color: '#2563eb' },
              ].map(({ id, label, sub, color }) => (
                <button
                  key={id}
                  onClick={() => setPayMethod(id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left"
                  style={{
                    borderColor: payMethod === id ? color : 'rgba(255,255,255,0.08)',
                    backgroundColor: payMethod === id ? `${color}18` : 'transparent',
                  }}
                >
                  <span className="text-white text-xs font-bold">{label}</span>
                  <span className="text-[10px] font-bold" style={{ color }}>{sub}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              disabled={!payMethod}
              className="w-full text-white font-black py-4 flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: payMethod ? '#25D366' : '#333' }}
            >
              <MessageCircle size={18} />
              {payMethod ? 'Pedir por WhatsApp' : 'Elegí un método de pago'}
            </button>
            <button
              onClick={clear}
              className="w-full text-white/20 hover:text-white/50 text-xs uppercase tracking-widest py-1 transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  )
}
