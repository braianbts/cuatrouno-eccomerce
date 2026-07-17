import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

const MARKUP = 1.27

function isNumericCod(val: unknown): boolean {
  if (val === null || val === undefined) return false
  return /^\d+$/.test(String(val).trim())
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const wb = XLSX.read(buffer, { type: 'buffer' })
    const ws = wb.Sheets['LISTA DE PRECIOS']
    if (!ws) return NextResponse.json({ error: 'Sheet "LISTA DE PRECIOS" not found' }, { status: 400 })

    const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

    // Find GENTECH start row — search any cell in each row
    let startRow = -1
    for (let i = 0; i < rows.length; i++) {
      const hasGentech = rows[i].some(cell => String(cell ?? '').trim().toUpperCase() === 'GENTECH')
      if (hasGentech) { startRow = i; break }
    }
    if (startRow === -1) {
      // Debug: return first 5 non-empty rows to diagnose
      const sample = rows.filter(r => r.some(c => c !== null)).slice(120, 130).map(r => r.map(c => String(c ?? '')).join('|'))
      return NextResponse.json({ error: 'GENTECH section not found', sample }, { status: 400 })
    }

    const products: {
      cod: string; marca: string; descripcion: string
      gramos: string; envase: string; sabor: string
      costo: number; precio_mayorista: number
    }[] = []

    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i]
      const cod = String(row[0] ?? '').trim()
      if (!isNumericCod(cod)) continue

      const marca      = String(row[1] ?? '').trim()
      const descripcion = String(row[2] ?? '').trim()
      const gramos     = String(row[3] ?? '').trim()
      const envase     = String(row[4] ?? '').trim()
      const sabor      = String(row[5] ?? '').trim()
      const costoRaw   = parseFloat(String(row[6] ?? '0').replace(/[^0-9.]/g, ''))

      if (!descripcion || isNaN(costoRaw) || costoRaw <= 0) continue

      products.push({
        cod,
        marca,
        descripcion,
        gramos,
        envase,
        sabor,
        costo: Math.round(costoRaw),
        precio_mayorista: Math.round(costoRaw * MARKUP),
      })
    }

    if (products.length === 0) return NextResponse.json({ error: 'No products parsed' }, { status: 400 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Clear and reinsert
    await supabaseAdmin.from('lista_mayorista').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    const { error } = await supabaseAdmin.from('lista_mayorista').insert(products)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, count: products.length })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
