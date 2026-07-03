'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/store/cart'
import CartDrawer from '@/components/cart/CartDrawer'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const count = useCart((s) => s.count())

  useEffect(() => setMounted(true), [])

  return (
    <>
      <nav className="sticky top-0 z-40 backdrop-blur-md relative overflow-hidden" style={{ backgroundColor: 'rgba(8,4,4,0.93)', boxShadow: 'inset 0 1px 0 0 rgba(196,21,21,0.25)' }}>
        <div className="nav-ray" />
        <div className="nav-ray-glow" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Cuatrouno Suplementos" width={140} height={48} className="object-contain" priority />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                Inicio
              </Link>
              <Link href="/productos" className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                Productos
              </Link>
              <Link href="/mayorista" className="text-yellow-400/70 hover:text-yellow-400 text-xs font-bold uppercase tracking-widest transition-colors">
                Mayorista
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setCartOpen(true)} className="relative p-2 text-white/60 hover:text-white transition-colors">
                <ShoppingCart size={20} />
                {mounted && count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C41515' }}>
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-white/60 hover:text-white">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-black border-t border-white/5 px-4 py-5 flex flex-col gap-5">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Inicio</Link>
            <Link href="/productos" onClick={() => setMenuOpen(false)} className="text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Productos</Link>
            <Link href="/mayorista" onClick={() => setMenuOpen(false)} className="text-yellow-400/70 hover:text-yellow-400 text-xs font-bold uppercase tracking-widest transition-colors">Mayorista</Link>
          </div>
        )}
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
