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

function avgRating(reviews) {
  if (!reviews.length) return 4.5
  const sum = reviews.reduce((s, r) => s + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  try {
    const where = category && category !== 'all' ? { category } : {}

    const apis = await db.api.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
      select: {
        slug: true,
        name: true,
        category: true,
        description: true,
        tags: true,
        currentStatus: true,
        uptime30d: true,
        isVerified: true,
        isFeatured: true,
        reviews: { select: { rating: true } },
      },
    })

    const result = apis.map((api) => ({
      id:       api.slug,
      name:     api.name,
      category: api.category,
      icon:     ICON_MAP[api.slug] || '🔌',
      desc:     api.description,
      tags:     (api.tags || []).slice(0, 3),
      status:   api.currentStatus.toLowerCase(),
      uptime:   api.uptime30d ?? 99.9,
      rating:   avgRating(api.reviews),
      isVerified: api.isVerified,
      isFeatured: api.isFeatured,
    }))

    return Response.json({ apis: result })
  } catch (err) {
    console.error('[/api/discover]', err)
    return Response.json({ apis: [], error: err.message }, { status: 500 })
  }
}
