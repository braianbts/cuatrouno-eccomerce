'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Building2, Dumbbell, Salad, User, CheckCircle2, ChevronRight, Package, Tag, Headphones, FileText } from 'lucide-react'

type TipoNegocio = 'gym' | 'dietetica' | 'revendedor' | 'particular' | ''

const tiposNegocio = [
  { value: 'gym',        label: 'Gym / Centro Fitness',      icon: Dumbbell,   desc: 'Gimnasios y centros deportivos' },
  { value: 'dietetica',  label: 'Dietética / Herboristería', icon: Salad,      desc: 'Tiendas de productos naturales' },
  { value: 'revendedor', label: 'Revendedor / Negocio',      icon: Building2,  desc: 'Comercios y distribuidores' },
  { value: 'particular', label: 'Particular',                icon: User,       desc: 'Compra personal en volumen' },
] as const

const beneficios = [
  { icon: Tag,         title: 'Precios por volumen',       desc: 'Escalas de descuento según cantidad mensual' },
  { icon: Package,     title: 'Stock garantizado',         desc: 'Reserva prioritaria para mayoristas activos' },
  { icon: Headphones,  title: 'Asesoramiento dedicado',    desc: 'Atención personalizada por WhatsApp' },
  { icon: FileText,    title: 'Facturación electrónica',   desc: 'Factura A o C según tu condición fiscal' },
]

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors text-sm'

export default function MayoristaPage() {
  const [form, setForm] = useState({
    nombre: '', negocio: '', tipo: '' as TipoNegocio,
    cuit: '', ciudad: '', telefono: '', mensaje: '',
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
      '🏪 *Consulta Mayorista — Cuatrouno Suplementos*',
      '',
      `👤 *Nombre:* ${form.nombre}`,
      `🏢 *Negocio:* ${form.negocio || '-'}`,
      `📋 *Tipo:* ${tipoLabel}`,
      `🪪 *CUIT:* ${form.cuit || '-'}`,
      `📍 *Ciudad:* ${form.ciudad}`,
      `📱 *Teléfono:* ${form.telefono}`,
      form.mensaje ? `💬 *Intereses:* ${form.mensaje}` : '',
    ].filter(Boolean).join('\n')
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(texto)}`, '_blank')
    setEnviado(true)
  }

  const canSubmit = form.nombre && form.ciudad && form.telefono && form.tipo

  if (enviado) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
        <Image src="/logo.png" alt="Cuatrouno Suplementos" width={120} height={40} className="mb-10 opacity-90" />
        <div className="w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center mb-6">
          <CheckCircle2 size={32} className="text-yellow-400" />
        </div>
        <h2 className="text-white text-2xl font-black mb-3">¡Consulta enviada!</h2>
        <p className="text-zinc-400 max-w-xs mb-8 text-sm leading-relaxed">
          Te contactamos en menos de 24 hs hábiles para coordinar condiciones de venta.
        </p>
        <button
          onClick={() => { setEnviado(false); setForm({ nombre: '', negocio: '', tipo: '', cuit: '', ciudad: '', telefono: '', mensaje: '' }) }}
          className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
        >
          Enviar otra consulta
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">

      {/* Hero */}
      <div className="relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.06),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="Cuatrouno Suplementos" width={420} height={146} className="mb-10 opacity-95" />
          <span className="inline-block border border-yellow-400/30 text-yellow-400 text-[11px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6">
            Canal Mayorista
          </span>
          <h1 className="text-white text-4xl md:text-6xl font-black leading-[1.05] mb-5 max-w-2xl">
            Suplementos de calidad<br />
            <span className="text-yellow-400">a precio mayorista</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-lg leading-relaxed">
            Para gyms, dietéticas y revendedores que quieren ofrecer los mejores suplementos con margen real.
          </p>
        </div>
      </div>

      {/* Separador */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

      {/* Beneficios */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {beneficios.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-4">
                <Icon size={18} className="text-yellow-400" />
              </div>
              <p className="text-white font-bold text-sm mb-1">{title}</p>
              <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Separador */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* Formulario */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h2 className="text-white font-black text-2xl md:text-3xl mb-2">Solicitá condiciones</h2>
          <p className="text-zinc-500 text-sm">Completá el formulario y te respondemos a la brevedad.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Tipo de negocio */}
          <div>
            <label className="text-zinc-400 text-xs font-semibold tracking-widest uppercase mb-3 block">¿Qué tipo de negocio?</label>
            <div className="grid grid-cols-2 gap-3">
              {tiposNegocio.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tipo: value }))}
                  className={`relative flex flex-col gap-1 rounded-2xl px-4 py-4 border transition-all text-left ${
                    form.tipo === value
                      ? 'bg-yellow-400/8 border-yellow-400/60 shadow-[0_0_0_1px_rgba(250,204,21,0.2)]'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <Icon size={18} className={form.tipo === value ? 'text-yellow-400' : 'text-zinc-500'} />
                  <span className={`font-bold text-sm mt-1 ${form.tipo === value ? 'text-white' : 'text-zinc-300'}`}>{label}</span>
                  <span className="text-zinc-600 text-xs">{desc}</span>
                  {form.tipo === value && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-yellow-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre / Negocio */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-500 text-xs mb-1.5 block">Nombre *</label>
              <input name="nombre" required value={form.nombre} onChange={handleChange} className={inputCls} placeholder="Juan García" />
            </div>
            <div>
              <label className="text-zinc-500 text-xs mb-1.5 block">Nombre del negocio</label>
              <input name="negocio" value={form.negocio} onChange={handleChange} className={inputCls} placeholder="Gym Titan" />
            </div>
          </div>

          {/* CUIT / Ciudad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-500 text-xs mb-1.5 block">CUIT</label>
              <input name="cuit" value={form.cuit} onChange={handleChange} className={inputCls} placeholder="20-12345678-9" />
            </div>
            <div>
              <label className="text-zinc-500 text-xs mb-1.5 block">Ciudad *</label>
              <input name="ciudad" required value={form.ciudad} onChange={handleChange} className={inputCls} placeholder="Escobar, BA" />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-zinc-500 text-xs mb-1.5 block">Teléfono *</label>
            <input name="telefono" required type="tel" value={form.telefono} onChange={handleChange} className={inputCls} placeholder="+54 9 11 1234-5678" />
          </div>

          {/* Intereses */}
          <div>
            <label className="text-zinc-500 text-xs mb-1.5 block">¿Qué productos te interesan? <span className="text-zinc-700">(opcional)</span></label>
            <textarea name="mensaje" value={form.mensaje} onChange={handleChange} rows={3} className={`${inputCls} resize-none`} placeholder="Proteínas, creatina, pre-workout..." />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full group flex items-center justify-center gap-3 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl transition-all text-base"
          >
            Consultar por WhatsApp
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <p className="text-zinc-700 text-xs text-center">Respondemos en menos de 24 hs hábiles · Sin compromiso</p>
        </form>
      </div>

    </div>
  )
}
