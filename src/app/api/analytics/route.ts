import { NextResponse } from 'next/server'

const TOKEN = process.env.VERCEL_API_TOKEN
const PROJECT_ID = process.env.VERCEL_PROJECT_ID

export async function GET() {
  if (!TOKEN || !PROJECT_ID) {
    return NextResponse.json({ error: 'Missing config' }, { status: 500 })
  }

  const now = Date.now()
  const from = now - 30 * 24 * 60 * 60 * 1000 // 30 days ago

  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  }

  const base = `https://api.vercel.com/v1/web/insights`
  const params = `projectId=${PROJECT_ID}&from=${from}&to=${now}&environment=production`

  const [statsRes, pagesRes] = await Promise.all([
    fetch(`${base}/stats?${params}`, { headers }),
    fetch(`${base}/path?${params}&limit=10`, { headers }),
  ])

  const stats = await statsRes.json()
  const pages = await pagesRes.json()

  if (!statsRes.ok) {
    return NextResponse.json({ error: `Vercel API error ${statsRes.status}: ${JSON.stringify(stats)}` }, { status: 500 })
  }

  return NextResponse.json({ stats, pages })
}
