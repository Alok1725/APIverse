import { db } from '@/lib/db'

const SLUG_MAP = {
  googlemaps: 'google-maps',
  gemini: 'google-gemini',
  github: 'github-api',
  firebase: 'firebase-realtime',
}

async function findApi(apiId) {
  const slug = SLUG_MAP[apiId] || apiId
  return db.api.findFirst({
    where: { OR: [{ slug }, { slug: apiId }] },
  })
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const apiId = searchParams.get('apiId')

  if (!apiId) return Response.json({ error: 'apiId required' }, { status: 400 })

  try {
    const api = await findApi(apiId)
    if (!api) return Response.json({ logs: [], history: [], avgLatency: null, uptime30d: null })

    const logs = await db.healthLog.findMany({
      where: { apiId: api.id },
      orderBy: { checkedAt: 'desc' },
      take: 50,
    })

    // Average latency from logs (or db field)
    const latencies = logs.filter((l) => l.latency).map((l) => l.latency)
    const avgLatency =
      api.avgLatency ||
      (latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null)

    // P99 latency
    const sorted = [...latencies].sort((a, b) => a - b)
    const p99 =
      sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.99)] || sorted[sorted.length - 1] : null

    // Build 7-day history from log data
    const now = new Date()
    const history = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (6 - i))
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

      const dayLogs = logs.filter((l) => {
        const t = new Date(l.checkedAt)
        return t >= dayStart && t < dayEnd
      })

      const status =
        dayLogs.length === 0
          ? 'operational'
          : dayLogs.some((l) => l.status === 'DOWN')
          ? 'down'
          : dayLogs.some((l) => l.status === 'DEGRADED')
          ? 'degraded'
          : 'operational'

      const dayLatencies = dayLogs.filter((l) => l.latency).map((l) => l.latency)
      const dayAvgLatency =
        dayLatencies.length
          ? Math.round(dayLatencies.reduce((a, b) => a + b, 0) / dayLatencies.length)
          : avgLatency

      return {
        day: DAY_NAMES[d.getDay()],
        status,
        latency: dayAvgLatency,
        uptime: api.uptime30d || 99.9,
      }
    })

    return Response.json({
      logs: logs.slice(0, 10).map((l) => ({
        status: l.status,
        latency: l.latency,
        statusCode: l.statusCode,
        checkedAt: l.checkedAt,
      })),
      history,
      avgLatency,
      p99Latency: p99,
      uptime30d: api.uptime30d,
      uptime90d: api.uptime90d,
      currentStatus: api.currentStatus,
    })
  } catch (err) {
    console.error('[/api/health]', err)
    return Response.json({ logs: [], history: [], error: err.message })
  }
}
