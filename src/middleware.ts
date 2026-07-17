import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) {
    const auth = req.cookies.get('admin_auth')?.value
    if (auth !== 'ok') {
      const url = req.nextUrl.clone()
      url.pathname = '/login/admin'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/mayorista/precios')) {
    const auth = req.cookies.get('mayorista_auth')?.value
    if (auth !== 'ok') {
      const url = req.nextUrl.clone()
      url.pathname = '/login/mayorista'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/vendedor')) {
    const auth = req.cookies.get('vendedor_auth')?.value
    if (auth !== 'ok') {
      const url = req.nextUrl.clone()
      url.pathname = '/login/vendedor'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/mayorista/precios/:path*', '/vendedor/:path*'],
}
