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
      body: JSON.stringify({ password, tipo: 'mayorista' }),
    })
    if (res.ok) {
      router.push(params.get('next') || '/mayorista/precios')
    } else {
      const { error } = await res.json()
      setError(error)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Usuario"
        autoComplete="username"
        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Contraseña"
        autoComplete="current-password"
        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition-colors"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-black py-3 rounded-xl transition-colors"
      >
        {loading ? 'Verificando...' : 'Ver lista de precios'}
      </button>
      <p className="text-zinc-600 text-xs text-center">
        ¿No tenés acceso? <a href="/mayorista" className="text-yellow-400 hover:underline">Solicitá ser mayorista</a>
      </p>
    </form>
  )
}

export default function MayoristaLoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Image src="/logo.png" alt="Cuatrouno" width={130} height={44} className="mx-auto mb-6 opacity-90" />
          <h1 className="text-white font-black text-xl">Lista de Precios Mayorista</h1>
          <p className="text-zinc-500 text-sm mt-1">Acceso exclusivo para clientes mayoristas</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
