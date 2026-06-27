import Afip from '@afipsdk/afip.js'
import path from 'path'

// En producción: AFIP_CUIT, AFIP_CERT y AFIP_KEY vienen de env vars
// En testing: production: false usa el ambiente de homologación de AFIP (no emite facturas reales)

let afipInstance: InstanceType<typeof Afip> | null = null

export function getAfip() {
  if (afipInstance) return afipInstance

  const cuit = Number(process.env.AFIP_CUIT)
  if (!cuit) throw new Error('AFIP_CUIT no configurado')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afipInstance = new (Afip as any)({
    CUIT: cuit,
    production: process.env.AFIP_PRODUCTION === 'true',
    cert: process.env.AFIP_CERT_PATH ?? path.join(process.cwd(), 'afip/cert.pem'),
    key:  process.env.AFIP_KEY_PATH  ?? path.join(process.cwd(), 'afip/key.pem'),
  })

  return afipInstance
}

export interface FacturaCParams {
  puntoVenta: number   // número de punto de venta habilitado en AFIP
  importe: number      // total en pesos (sin decimales de centavos problemáticos)
  concepto?: 1 | 2 | 3 // 1=Productos, 2=Servicios, 3=Ambos
  // Datos del receptor (Factura C → consumidor final, puede ir genérico)
  docTipo?: number     // 99 = consumidor final
  docNro?: number      // 0 para consumidor final
  nombre?: string
}

export async function emitirFacturaC(params: FacturaCParams) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afip = getAfip() as any
  const eb   = afip.ElectronicBilling

  const puntoVenta = params.puntoVenta
  const concepto   = params.concepto ?? 1

  // Último comprobante emitido para obtener el próximo número
  const ultimoNro = await eb.getLastVoucher(puntoVenta, 11) // tipo 11 = Factura C
  const nuevoNro  = ultimoNro + 1

  const hoy = new Date()
  const fecha = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`

  const voucher = await eb.createVoucher({
    'CantReg':       1,
    'PtoVta':        puntoVenta,
    'CbteTipo':      11,           // Factura C
    'Concepto':      concepto,
    'DocTipo':       params.docTipo ?? 99,  // 99 = consumidor final
    'DocNro':        params.docNro  ?? 0,
    'CbteDesde':     nuevoNro,
    'CbteHasta':     nuevoNro,
    'CbteFch':       fecha,
    'ImpTotal':      params.importe,
    'ImpTotConc':    0,
    'ImpNeto':       params.importe,
    'ImpOpEx':       0,
    'ImpIVA':        0,
    'ImpTrib':       0,
    'MonId':         'PES',
    'MonCotiz':      1,
  })

  return {
    numero:    nuevoNro,
    cae:       voucher.CAE,
    vencimientoCAE: voucher.CAEFchVto,
    puntoVenta,
    tipo:      'Factura C',
  }
}
