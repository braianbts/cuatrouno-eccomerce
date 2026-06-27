import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/lib/supabase'

type CartItem = {
  product: Product
  quantity: number
  selectedFlavor?: string
}

type CartStore = {
  items: CartItem[]
  add: (product: Product, quantity?: number, flavor?: string) => void
  remove: (productId: string) => void
  update: (productId: string, quantity: number) => void
  clear: () => void
  total: () => number
  count: () => number
  buildWhatsAppMessage: (paymentMethod?: string, triviaDiscount?: boolean) => string
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product, quantity = 1, flavor) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, { product, quantity, selectedFlavor: flavor }] }
        })
      },

      remove: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) }))
      },

      update: (productId, quantity) => {
        if (quantity <= 0) {
          get().remove(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clear: () => set({ items: [] }),

      total: () => {
        return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
      },

      count: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      buildWhatsAppMessage: (paymentMethod?: string, triviaDiscount?: boolean) => {
        const items = get().items
        if (items.length === 0) return ''

        const base = get().total()
        const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Cuatrouno Suplementos'
        let msg = `Hola! Quiero hacer un pedido en *${storeName}*:\n\n`

        items.forEach((item) => {
          msg += `• *${item.product.name}*`
          if (item.selectedFlavor) msg += ` - ${item.selectedFlavor}`
          msg += ` x${item.quantity} = $${(item.product.price * item.quantity).toLocaleString('es-AR')}\n`
        })

        msg += `\n*Total lista: $${base.toLocaleString('es-AR')}*`

        if (triviaDiscount) {
          msg += `\n🎯 *Descuento trivia: −5%*`
        }

        if (paymentMethod === 'efectivo') {
          const eff = triviaDiscount ? Math.round(base * 0.95 * 0.95) : Math.round(base * 0.95)
          msg += `\n💵 *Método de pago: Efectivo*`
          msg += `\n✅ *Total con descuento: $${eff.toLocaleString('es-AR')}*`
        } else if (paymentMethod === 'transferencia') {
          const final = triviaDiscount ? Math.round(base * 0.95) : base
          msg += `\n🏦 *Método de pago: Transferencia bancaria*`
          msg += `\n✅ *Total: $${final.toLocaleString('es-AR')}*`
        } else if (paymentMethod === 'cuotas') {
          const after = triviaDiscount ? Math.round(base * 0.95) : base
          const cuota = Math.ceil(after / 0.894 / 3)
          msg += `\n💳 *Método de pago: 3 cuotas (Mercado Pago)*`
          msg += `\n✅ *3 cuotas de $${cuota.toLocaleString('es-AR')}* (no disponible con Amex)`
        }

        msg += `\n\n¿Pueden coordinar el envío?`

        return encodeURIComponent(msg)
      },
    }),
    { name: 'cuatrouno-cart' }
  )
)
