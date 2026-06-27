import { NextRequest, NextResponse } from 'next/server'
import { emitirFacturaC } from '@/lib/afip'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ventaId, importe, puntoVenta = 1 } = body

    if (!ventaId || !importe) {
      return NextResponse.json({ error: 'ventaId e importe requeridos' }, { status: 400 })
    }

    const resultado = await emitirFacturaC({ puntoVenta, importe })

    // Guardar CAE en la venta
    await supabase
      .from('ventas')
      .update({
        factura_numero:   resultado.numero,
        factura_cae:      resultado.cae,
        factura_vto_cae:  resultado.vencimientoCAE,
        factura_emitida:  true,
      })
      .eq('id', ventaId)

    return NextResponse.json(resultado)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
