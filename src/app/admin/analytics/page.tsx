'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart2, Users, Eye, TrendingUp, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalVisitors?: { value: number }
  pageviews?: { value: number }
  avgDuration?: { value: number }
  bounceRate?: { value: number }
}

interface PageRow {
  key: string
  total: number
  devices?: { desktop: number; mobile: number }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [pages, setPages] = useState<PageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshed, setRefreshed] = useState<Date | null>(null)

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth !== 'true') router.replace('/admin')
  }, [router])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analytics')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setStats(json.stats)
      setPages(json.pages?.data || [])
      setRefreshed(new Date())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const fmt = (n?: number) => n != null ? n.toLocaleString('es-AR') : '—'
  const fmtSecs = (ms?: number) => {
    if (ms == null) return '—'
    const s = Math.round(ms / 1000)
    return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Panel Admin</p>
              <h1 className="text-white font-black text-2xl uppercase tracking-tight flex items-center gap-2">
                <BarChart2 size={22} className="text-yellow-400" />
                Analytics
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {refreshed && (
              <span className="text-zinc-600 text-xs">
                {refreshed.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Visitantes únicos', value: fmt(stats?.totalVisitors?.value), color: 'text-yellow-400' },
            { icon: Eye, label: 'Vistas de página', value: fmt(stats?.pageviews?.value), color: 'text-blue-400' },
            { icon: TrendingUp, label: 'Tiempo promedio', value: fmtSecs(stats?.avgDuration?.value), color: 'text-green-400' },
            { icon: BarChart2, label: 'Tasa de rebote', value: stats?.bounceRate?.value != null ? `${Math.round(stats.bounceRate.value)}%` : '—', color: 'text-orange-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <Icon size={18} className={`${color} mb-3`} />
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">{label}</p>
              <p className={`font-black text-2xl ${loading ? 'animate-pulse text-zinc-700' : 'text-white'}`}>
                {loading ? '···' : value}
              </p>
            </div>
          ))}
        </div>

        {/* Top pages */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-5">Páginas más visitadas — últimos 30 días</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-zinc-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : pages.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">Sin datos todavía. Visitá el sitio para generar métricas.</p>
          ) : (
            <div className="space-y-2">
              {pages.map((p, i) => {
                const max = pages[0]?.total || 1
                const pct = Math.round((p.total / max) * 100)
                return (
                  <div key={p.key} className="flex items-center gap-4">
                    <span className="text-zinc-600 text-xs w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-mono truncate">{p.key || '/'}</span>
                        <span className="text-zinc-400 text-xs font-bold ml-4 flex-shrink-0">{fmt(p.total)}</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-yellow-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <p className="text-zinc-700 text-xs text-center mt-6">Datos de Vercel Analytics · últimos 30 días</p>
      </div>
    </div>
  )
}
