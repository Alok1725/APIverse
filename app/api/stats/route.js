import { db } from '@/lib/db'

const ICON_MAP = {
  stripe:'💳', razorpay:'💰', paypal:'🅿️', square:'⬛', cashfree:'💵',
  adyen:'🏦', braintree:'🌿', lemonsqueezy:'🍋',
  auth0:'🔐', clerk:'🔑', 'firebase-auth':'🔒', okta:'🛡️', stytch:'🔓',
  sendgrid:'📧', mailgun:'📬', resend:'✉️', postmark:'📮', twilio:'📱', messagebird:'🐦',
  openai:'🤖', anthropic:'🧠', 'google-gemini':'✨', groq:'⚡', huggingface:'🤗', replicate:'🎨',
  cohere:'🔷', mistral:'🌬️', elevenlabs:'🎙️', deepgram:'🎧', 'stability-ai':'🖼️',
  'together-ai':'🤝', perplexity:'🔮', assemblyai:'🎤',
  'google-maps':'🗺️', mapbox:'📍',
  cloudinary:'☁️', 'aws-s3':'🪣', 'cloudflare-r2':'🔶', uploadthing:'📤',
  supabase:'🗄️', neon:'💚', planetscale:'🌍', turso:'🔵', 'firebase-realtime':'🔥', upstash:'⬆️',
  algolia:'🔍', meilisearch:'🔎', typesense:'🔬',
  mixpanel:'📊', amplitude:'📈', posthog:'🦔', plausible:'📉',
  'github-api':'🐙', 'gitlab-api':'🦊', vercel:'▲', netlify:'🌐',
  sentry:'🪲', railway:'🚂', render:'🎯', 'linear-api':'📐', 'notion-api':'📓', doppler:'🔑',
  'discord-api':'💬', 'slack-api':'💼', 'telegram-bot':'✈️',
  'twitter-api':'🐦', 'instagram-api':'📸', 'youtube-api':'▶️', 'linkedin-api':'💼',
  plaid:'🏛️', coingecko:'🦎', 'binance-api':'₿',
  contentful:'📑', sanity:'🔴', strapi:'⚙️',
  mux:'📹', agora:'📡', 'stream-chat':'💬',
  datadog:'🐕', newrelic:'🟢', betterstack:'📶',
  openweathermap:'🌦️', ipinfo:'🌐', maxmind:'🔎',
  deepl:'🌍', 'google-translate':'🗣️',
  shopify:'🛒', woocommerce:'🛍️',
}

export async function GET() {
  try {
    const [total, byCategoryRaw, uptimeAgg, latencyAgg, heroApisRaw] = await Promise.all([
      db.api.count(),
      db.api.groupBy({ by: ['category'], _count: { _all: true } }),
      db.api.aggregate({ _avg: { uptime30d: true } }),
      db.healthLog.aggregate({ _avg: { latency: true } }),
      db.api.findMany({
        where: { isFeatured: true },
        take: 3,
        orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
        select: { slug: true, name: true, description: true, currentStatus: true },
      }),
    ])

    const byCategory = {}
    for (const row of byCategoryRaw) {
      byCategory[row.category.toLowerCase()] = row._count._all
    }

    const avgUptime = uptimeAgg._avg.uptime30d != null
      ? Math.round(uptimeAgg._avg.uptime30d * 10) / 10
      : null

    const avgLatency = latencyAgg._avg.latency != null
      ? Math.round(latencyAgg._avg.latency)
      : null

    const heroApis = heroApisRaw.map(api => ({
      slug: api.slug,
      icon: ICON_MAP[api.slug] || '🔌',
      name: api.name,
      desc: api.description.length > 55 ? api.description.slice(0, 52) + '...' : api.description,
      status: api.currentStatus.toLowerCase(),
    }))

    // Determine active AI provider from env vars — no actual API calls
    const providerAvail = {
      gemini: !!process.env.GEMINI_API_KEY,
      groq:   !!process.env.GROQ_API_KEY,
      ollama: false,
      mock:   true,
    }
    const activeProvider = ['gemini', 'groq', 'ollama', 'mock'].find(p => providerAvail[p]) || 'mock'

    const aiProviders = [
      { icon: '✨', name: 'Google Gemini', meta: 'gemini-1.5-flash',    active: activeProvider === 'gemini', online: providerAvail.gemini },
      { icon: '⚡', name: 'Groq',          meta: 'llama-3.1-8b-instant', active: activeProvider === 'groq',   online: providerAvail.groq },
      { icon: '🏠', name: 'Ollama',        meta: 'llama3 · local',       active: activeProvider === 'ollama', online: false },
      { icon: '🔧', name: 'Mock Provider', meta: 'Offline fallback',     active: activeProvider === 'mock',   online: true },
    ]

    return Response.json({ total, byCategory, avgUptime, avgLatency, heroApis, aiProviders })
  } catch (err) {
    console.error('[/api/stats]', err)
    return Response.json({ total: 0, byCategory: {}, avgUptime: null, avgLatency: null, heroApis: [], aiProviders: [] })
  }
}
