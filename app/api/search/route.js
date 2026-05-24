import { db } from '@/lib/db'
import { aiGateway } from '@/lib/ai/gateway'

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

async function getCatalog(category) {
  const where = category && category !== 'All' && category !== 'all'
    ? { category: category.toLowerCase() }
    : {}

  const apis = await db.api.findMany({
    where,
    orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
    select: {
      slug: true, name: true, category: true, description: true,
      tags: true, currentStatus: true, uptime30d: true,
      reviews: { select: { rating: true } },
    },
  })

  return apis.map((api) => {
    const ratings = api.reviews
    const rating = ratings.length
      ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10
      : 4.5
    return {
      id:       api.slug,
      name:     api.name,
      category: api.category,
      icon:     ICON_MAP[api.slug] || '🔌',
      desc:     api.description,
      tags:     (api.tags || []).slice(0, 3),
      status:   api.currentStatus.toLowerCase(),
      uptime:   api.uptime30d ?? 99.9,
      rating,
    }
  })
}

export async function POST(request) {
  let body
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { query, category } = body

  const corpus = await getCatalog(category).catch(() => [])

  if (!query?.trim()) {
    return Response.json({ results: corpus, provider: null })
  }

  try {
    const { result, provider } = await aiGateway.semanticSearch(query.trim(), corpus)
    return Response.json({ results: result, provider })
  } catch (err) {
    console.error('[/api/search] AI search failed, falling back:', err.message)
    // Simple text fallback
    const q = query.toLowerCase()
    const fallback = corpus.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.desc.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    )
    return Response.json({ results: fallback.length ? fallback : corpus, provider: null })
  }
}
