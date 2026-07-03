'use client'

import { useState } from 'react'
import { Building2, Dumbbell, Salad, User, CheckCircle2, ArrowRight } from 'lucide-react'

type TipoNegocio = 'gym' | 'dietetica' | 'revendedor' | 'particular' | ''

const tiposNegocio = [
  { value: 'gym', label: 'Gym / Centro Fitness', icon: Dumbbell },
  { value: 'dietetica', label: 'Dietética / Herboristería', icon: Salad },
  { value: 'revendedor', label: 'Revendedor / Negocio', icon: Building2 },
  { value: 'particular', label: 'Particular', icon: User },
] as const

const beneficios = [
  'Precios especiales según volumen',
  'Stock reservado para mayoristas',
  'Asesoramiento personalizado',
  'Facturación electrónica',
]

export default function MayoristaPage() {
  const [form, setForm] = useState({
    nombre: '',
    negocio: '',
    tipo: '' as TipoNegocio,
    cuit: '',
    ciudad: '',
    telefono: '',
    mensaje: '',
  })
  const [enviado, setEnviado] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    const tipoLabel = tiposNegocio.find(t => t.value === form.tipo)?.label || form.tipo

    const texto = [
      '🏪 *Consulta Mayorista - Cuatrouno Suplementos*',
      '',
      `👤 *Nombre:* ${form.nombre}`,
      `🏢 *Negocio:* ${form.negocio || '-'}`,
      `📋 *Tipo:* ${tipoLabel}`,
      `🪪 *CUIT:* ${form.cuit || '-'}`,
      `📍 *Ciudad:* ${form.ciudad}`,
      `📱 *Teléfono:* ${form.telefono}`,
      form.mensaje ? `💬 *Mensaje:* ${form.mensaje}` : '',
    ].filter(Boolean).join('\n')

    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(texto)}`, '_blank')
    setEnviado(true)
  }

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition-colors'

  if (enviado) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle2 size={64} className="text-yellow-400 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-black mb-2">¡Consulta enviada!</h2>
          <p className="text-zinc-400 mb-8">Te vamos a contactar a la brevedad para coordinar condiciones.</p>
          <button
            onClick={() => { setEnviado(false); setForm({ nombre: '', negocio: '', tipo: '', cuit: '', ciudad: '', telefono: '', mensaje: '' }) }}
            className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
          >
            Enviar otra consulta
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <div className="bg-zinc-950 border-b border-zinc-800 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block bg-yellow-400/10 text-yellow-400 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Canal Mayorista
          </span>
          <h1 className="text-white text-4xl md:text-5xl font-black leading-tight mb-4">
            Vendé suplementos<br />
            <span className="text-yellow-400">con respaldo real</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto">
            Accedé a precios especiales según tu volumen de compra. Ideal para gyms, dietéticas y revendedores.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 space-y-10">

        {/* Beneficios */}
        <div className="grid grid-cols-2 gap-3">
          {beneficios.map(b => (
            <div key={b} className="flex items-start gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <ArrowRight size={16} className="text-yellow-400 mt-0.5 shrink-0" />
              <span className="text-zinc-300 text-sm">{b}</span>
            </div>
          ))}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-white font-black text-xl">Completá tus datos</h2>

          {/* Tipo de negocio */}
          <div>
            <label className="text-zinc-400 text-sm mb-2 block">¿Qué tipo de negocio tenés? *</label>
            <div className="grid grid-cols-2 gap-3">
              {tiposNegocio.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tipo: value }))}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all text-left ${
                    form.tipo === value
                      ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Nombre *</label>
              <input name="nombre" required value={form.nombre} onChange={handleChange} className={inputCls} placeholder="Juan García" />
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Nombre del negocio</label>
              <input name="negocio" value={form.negocio} onChange={handleChange} className={inputCls} placeholder="Gym Titan" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">CUIT</label>
              <input name="cuit" value={form.cuit} onChange={handleChange} className={inputCls} placeholder="20-12345678-9" />
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Ciudad *</label>
              <input name="ciudad" required value={form.ciudad} onChange={handleChange} className={inputCls} placeholder="Escobar, BA" />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Teléfono *</label>
            <input name="telefono" required type="tel" value={form.telefono} onChange={handleChange} className={inputCls} placeholder="+54 9 11 1234-5678" />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1 block">¿Qué productos te interesan? (opcional)</label>
            <textarea name="mensaje" value={form.mensaje} onChange={handleChange} rows={3} className={`${inputCls} resize-none`} placeholder="Proteínas, creatina, pre-workout..." />
          </div>

          <button
            type="submit"
            disabled={!form.nombre || !form.ciudad || !form.telefono || !form.tipo}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl transition-colors text-lg"
          >
            Consultar por WhatsApp
          </button>
          <p className="text-zinc-500 text-xs text-center">Te respondemos en menos de 24 hs hábiles</p>
        </form>
      </div>
    </div>
  )
}
