import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password, tipo } = await req.json()

  if (tipo === 'admin') {
    const correct = process.env.ADMIN_PASSWORD || 'cuatrouno2024'
    if (password !== correct) return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_auth', 'ok', { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    return res
  }

  if (tipo === 'mayorista') {
    const correct = process.env.MAYORISTA_PASSWORD || 'mayorista2024'
    if (password !== correct) return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    const res = NextResponse.json({ ok: true })
    res.cookies.set('mayorista_auth', 'ok', { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
    return res
  }

  return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
}
