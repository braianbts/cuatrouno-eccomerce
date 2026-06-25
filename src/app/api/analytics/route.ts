import { NextResponse } from 'next/server'

const TOKEN = process.env.VERCEL_API_TOKEN
const PROJECT_ID = process.env.VERCEL_PROJECT_ID

export async function GET() {
  if (!TOKEN || !PROJECT_ID) {
    return NextResponse.json({ error: 'Missing config: TOKEN or PROJECT_ID not set' }, { status: 500 })
  }

  const now = Date.now()
  const from = now - 30 * 24 * 60 * 60 * 1000

  const headers = {
    Authorization: `Bearer ${TOKEN}`,
  }

  const params = new URLSearchParams({
    projectId: PROJECT_ID,
    from: String(from),
    to: String(now),
    environment: 'production',
    filter: '[]',
  })

  const [statsRes, pagesRes] = await Promise.all([
    fetch(`https://api.vercel.com/v1/web/insights/stats?${params}`, { headers }),
    fetch(`https://api.vercel.com/v1/web/insights/path?${params}&limit=10`, { headers }),
  ])

  const stats = await statsRes.json()
  const pages = await pagesRes.json()

  if (!statsRes.ok) {
    return NextResponse.json(
      { error: `API ${statsRes.status}: ${stats?.error?.message || JSON.stringify(stats)}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ stats, pages })
}
