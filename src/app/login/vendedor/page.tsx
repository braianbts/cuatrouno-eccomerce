'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, tipo: 'vendedor' }),
    })
    if (res.ok) {
      router.push(params.get('next') || '/vendedor')
    } else {
      const data = await res.json()
      setError(data.error || 'Error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="Cuatrouno" width={140} height={50} />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-white font-black text-xl mb-1">Panel de Ventas</h1>
          <p className="text-zinc-500 text-sm mb-6">Ingresá tu contraseña para continuar</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-3 rounded-xl transition-colors"
            >
              {loading ? 'Entrando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginVendedorPage() {
  return <Suspense><LoginForm /></Suspense>
}
