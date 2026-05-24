import { db } from '@/lib/db'

// Map frontend slugs → DB slugs where they differ
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

export async function GET(request, { params }) {
  const { apiId } = await params

  try {
    const api = await findApi(apiId)

    if (!api) {
      return Response.json({ error: 'API not found' }, { status: 404 })
    }

    return Response.json({ api })
  } catch (err) {
    console.error('[/api/apis]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
