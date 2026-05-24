import { db } from '@/lib/db'

const ICON_MAP = {
  stripe:'💳', razorpay:'💰', paypal:'🅿️', square:'⬛', cashfree:'💵',
  auth0:'🔐', clerk:'🔑', 'firebase-auth':'🔒',
  sendgrid:'📧', mailgun:'📬', resend:'✉️', postmark:'📮', twilio:'📱', messagebird:'🐦',
  openai:'🤖', anthropic:'🧠', 'google-gemini':'✨', groq:'⚡', huggingface:'🤗', replicate:'🎨',
  'google-maps':'🗺️', mapbox:'📍',
  cloudinary:'☁️', 'aws-s3':'🪣', 'cloudflare-r2':'🔶', uploadthing:'📤',
  supabase:'🗄️', neon:'💚', planetscale:'🌍', turso:'🔵', 'firebase-realtime':'🔥',
  algolia:'🔍', meilisearch:'🔎', typesense:'🔬',
  mixpanel:'📊', amplitude:'📈', posthog:'🦔', plausible:'📉',
  'github-api':'🐙', 'gitlab-api':'🦊', vercel:'▲', netlify:'🌐',
}

// Map DB severity → display type
function toType(severity, isBreaking) {
  if (isBreaking || severity === 'BREAKING') return 'breaking'
  if (severity === 'MAJOR') return 'deprecation'
  return 'additive'
}

export async function GET() {
  try {
    const entries = await db.changelog.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 30,
      include: {
        api: { select: { slug: true, name: true } },
      },
    })

    const result = entries.map((entry) => ({
      id: entry.id,
      type: toType(entry.severity, entry.isBreaking),
      api: entry.api.name,
      apiSlug: entry.api.slug,
      icon: ICON_MAP[entry.api.slug] || '🔌',
      title: entry.title,
      desc: entry.description,
      date: new Date(entry.publishedAt).toISOString().split('T')[0],
      version: entry.version || 'N/A',
      severity: entry.severity,
    }))

    return Response.json({ entries: result })
  } catch (err) {
    console.error('[/api/changelog]', err)
    return Response.json({ entries: [], error: err.message }, { status: 500 })
  }
}
