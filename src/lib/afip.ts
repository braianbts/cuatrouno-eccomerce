import Afip from '@afipsdk/afip.js'
import path from 'path'
import fs from 'fs'
import os from 'os'

let afipInstance: InstanceType<typeof Afip> | null = null

function resolveCertPath(envVar: string, fallbackPath: string): string {
  const b64 = process.env[envVar]
  if (b64) {
    // Env var contiene el PEM en base64 → escribir a temp file
    const tmp = path.join(os.tmpdir(), `afip_${envVar}.pem`)
    fs.writeFileSync(tmp, Buffer.from(b64, 'base64').toString('utf8'))
    return tmp
  }
  return fallbackPath
}

export function getAfip() {
  if (afipInstance) return afipInstance

  const cuit = Number(process.env.AFIP_CUIT)
  if (!cuit) throw new Error('AFIP_CUIT no configurado')

  const certPath = resolveCertPath('AFIP_CERT', path.join(process.cwd(), 'afip/cert.pem'))
  const keyPath  = resolveCertPath('AFIP_KEY',  path.join(process.cwd(), 'afip/key.pem'))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afipInstance = new (Afip as any)({
    CUIT: cuit,
    production: process.env.AFIP_PRODUCTION === 'true',
    cert: certPath,
    key:  keyPath,
    access_token: process.env.AFIP_ACCESS_TOKEN,
  })

  return afipInstance
}

export interface FacturaCParams {
  puntoVenta: number
  importe: number
  concepto?: 1 | 2 | 3
  docTipo?: number
  docNro?: number
}

export async function emitirFacturaC(params: FacturaCParams) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afip = getAfip() as any
  const eb   = afip.ElectronicBilling

  const puntoVenta = params.puntoVenta
  const concepto   = params.concepto ?? 1

  const ultimoNro = await eb.getLastVoucher(puntoVenta, 11)
  const nuevoNro  = ultimoNro + 1

  const hoy = new Date()
  const fecha = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`

  const voucher = await eb.createVoucher({
    'CantReg':    1,
    'PtoVta':     puntoVenta,
    'CbteTipo':   11,
    'Concepto':   concepto,
    'DocTipo':    params.docTipo ?? 99,
    'DocNro':     params.docNro  ?? 0,
    'CbteDesde':  nuevoNro,
    'CbteHasta':  nuevoNro,
    'CbteFch':    fecha,
    'ImpTotal':   params.importe,
    'ImpTotConc': 0,
    'ImpNeto':    params.importe,
    'ImpOpEx':    0,
    'ImpIVA':     0,
    'ImpTrib':    0,
    'MonId':      'PES',
    'MonCotiz':   1,
  })

  return {
    numero:         nuevoNro,
    cae:            voucher.CAE,
    vencimientoCAE: voucher.CAEFchVto,
    puntoVenta,
    tipo:           'Factura C',
  }
}
