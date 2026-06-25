'use client'

const ticker = [
  '🔥 LOS DESCUENTOS POR TRANSFERENCIA SE APLICAN AL FINAL DE LA COMPRA',
  '💪 PRECIOS ESPECIALES PARA GIMNASIOS, ALUMNOS Y PROFES 💪',
  '🚚 ENVÍOS GRATIS ZONA NORTE EN COMPRAS SUPERIORES A $100.000 🚚',
]

export default function AnnouncementBar() {
  const repeated = [...ticker, ...ticker, ...ticker]

  return (
    <div>
      {/* Scrolling ticker */}
      <div className="overflow-hidden text-white text-[11px] font-black uppercase tracking-widest py-2" style={{ backgroundColor: '#C41515' }}>
        <div className="flex gap-16 animate-ticker whitespace-nowrap">
          {repeated.map((msg, i) => (
            <span key={i} className="shrink-0">{msg}</span>
          ))}
        </div>
      </div>

      {/* Pickup bar */}
      <div className="bg-black/90 text-center text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] py-1.5">
        📍 PICK UP POR ESCOBAR CENTRO 📍
      </div>
    </div>
  )
}
