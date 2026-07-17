import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { tipo } = await req.json()
  const cookieMap: Record<string, string> = {
    admin: 'admin_auth',
    mayorista: 'mayorista_auth',
    vendedor: 'vendedor_auth',
  }
  const cookie = cookieMap[tipo]
  if (!cookie) return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  const res = NextResponse.json({ ok: true })
  res.cookies.set(cookie, '', { maxAge: 0 })
  return res
}
