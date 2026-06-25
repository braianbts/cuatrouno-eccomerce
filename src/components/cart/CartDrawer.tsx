'use client'

import { X, Trash2, MessageCircle, ShoppingBag } from 'lucide-react'
import { useCart } from '@/store/cart'
import Image from 'next/image'

type Props = { open: boolean; onClose: () => void }

export default function CartDrawer({ open, onClose }: Props) {
  const { items, remove, update, total, buildWhatsAppMessage, clear } = useCart()
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

  const handleCheckout = () => {
    const msg = buildWhatsAppMessage()
    window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank')
  }

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
            <div className="flex justify-between items-baseline">
              <span className="text-white/40 text-xs uppercase tracking-widest">Total</span>
              <span className="font-black text-2xl text-white">${total().toLocaleString('es-AR')}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-[#25D366] hover:bg-[#20c05a] text-white font-black py-4 flex items-center justify-center gap-2 transition-colors text-xs uppercase tracking-widest"
            >
              <MessageCircle size={18} />
              Pedir por WhatsApp
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
