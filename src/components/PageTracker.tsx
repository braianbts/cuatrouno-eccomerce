'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PageTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string>('')

  useEffect(() => {
    if (pathname === lastTracked.current) return
    if (pathname.startsWith('/admin')) return
    lastTracked.current = pathname

    supabase.from('page_views').insert({
      path: pathname,
      referrer: document.referrer || null,
    }).then(() => {})
  }, [pathname])

  return null
}
