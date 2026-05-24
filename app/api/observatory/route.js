import { db } from '@/lib/db'

const ICON_MAP = {
  // Payments
  stripe:'💳', razorpay:'💰', paypal:'🅿️', square:'⬛', cashfree:'💵',
  adyen:'🏦', braintree:'🌿', lemonsqueezy:'🍋',
  // Auth
  auth0:'🔐', clerk:'🔑', 'firebase-auth':'🔒', okta:'🛡️', stytch:'🔓',
  // Email & Messaging
  sendgrid:'📧', mailgun:'📬', resend:'✉️', postmark:'📮', twilio:'📱', messagebird:'🐦',
  // AI & ML
  openai:'🤖', anthropic:'🧠', 'google-gemini':'✨', groq:'⚡', huggingface:'🤗', replicate:'🎨',
  cohere:'🔷', mistral:'🌬️', elevenlabs:'🎙️', deepgram:'🎧', 'stability-ai':'🖼️',
  'together-ai':'🤝', perplexity:'🔮', assemblyai:'🎤',
  // Maps
  'google-maps':'🗺️', mapbox:'📍',
  // Storage
  cloudinary:'☁️', 'aws-s3':'🪣', 'cloudflare-r2':'🔶', uploadthing:'📤',
  // Databases
  supabase:'🗄️', neon:'💚', planetscale:'🌍', turso:'🔵', 'firebase-realtime':'🔥', upstash:'⬆️',
  // Search
  algolia:'🔍', meilisearch:'🔎', typesense:'🔬',
  // Analytics
  mixpanel:'📊', amplitude:'📈', posthog:'🦔', plausible:'📉',
  // Dev Tools
  'github-api':'🐙', 'gitlab-api':'🦊', vercel:'▲', netlify:'🌐',
  sentry:'🪲', railway:'🚂', render:'🎯', 'linear-api':'📐', 'notion-api':'📓', doppler:'🔑',
  // Social
  'discord-api':'💬', 'slack-api':'💼', 'telegram-bot':'✈️',
  'twitter-api':'🐦', 'instagram-api':'📸', 'youtube-api':'▶️', 'linkedin-api':'💼',
  // Finance
  plaid:'🏛️', coingecko:'🦎', 'binance-api':'₿',
  // CMS
  contentful:'📑', sanity:'🔴', strapi:'⚙️',
  // Media
  mux:'📹', agora:'📡', 'stream-chat':'💬',
  // Observability
  datadog:'🐕', newrelic:'🟢', betterstack:'📶',
  // Weather & Geo
  openweathermap:'🌦️', ipinfo:'🌐', maxmind:'🔎',
  // Translation
  deepl:'🌍', 'google-translate':'🗣️',
  // E-commerce
  shopify:'🛒', woocommerce:'🛍️',
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export async function GET() {
  try {
    const apis = await db.api.findMany({
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        currentStatus: true,
        avgLatency: true,
        uptime30d: true,
        lastCheckedAt: true,
        healthLogs: {
          orderBy: { checkedAt: 'desc' },
          take: 7,
          select: { status: true, checkedAt: true },
        },
      },
    })

    const result = apis.map((api) => ({
      id: api.slug,
      name: api.name,
      category: api.category,
      icon: ICON_MAP[api.slug] || '🔌',
      status: api.currentStatus.toLowerCase(),
      uptime: api.uptime30d ?? 99.9,
      latency: api.avgLatency ?? 0,
      lastChecked: api.lastCheckedAt ? timeAgo(api.lastCheckedAt) : 'Not yet checked',
      history: [...api.healthLogs].reverse().map((l) =>
        l.status === 'OPERATIONAL' ? 'op' : l.status === 'DEGRADED' ? 'deg' : 'down'
      ),
    }))

    return Response.json({ apis: result })
  } catch (err) {
    console.error('[/api/observatory]', err)
    return Response.json({ apis: [], error: err.message }, { status: 500 })
  }
}
