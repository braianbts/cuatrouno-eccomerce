import { NextRequest, NextResponse } from 'next/server'
import { emitirFacturaC } from '@/lib/afip'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ventaId, importe, puntoVenta = 4 } = body

    if (!ventaId || !importe) {
      return NextResponse.json({ error: 'ventaId e importe requeridos' }, { status: 400 })
    }

    const resultado = await emitirFacturaC({ puntoVenta, importe })

    // Link al visor oficial de AFIP
    const qrData = Buffer.from(JSON.stringify({
      ver: 1,
      fecha: new Date().toISOString().slice(0, 10),
      cuit: Number(process.env.AFIP_CUIT),
      ptoVta: puntoVenta,
      tipoCmp: 11,
      nroCmp: resultado.numero,
      importe,
      moneda: 'PES',
      ctz: 1,
      tipoDocRec: 99,
      nroDocRec: 0,
      tipoCodAut: 'E',
      codAut: Number(resultado.cae),
    })).toString('base64')

    const urlVisor = `https://www.afip.gob.ar/fe/qr/?p=${qrData}`

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

    return NextResponse.json({ ...resultado, urlVisor })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
