import { db } from '@/lib/db'
import { auth } from '@/auth'

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

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const apiId = searchParams.get('apiId')

  if (!apiId) return Response.json({ error: 'apiId required' }, { status: 400 })

  try {
    const api = await findApi(apiId)
    if (!api) return Response.json({ reviews: [], totalCount: 0, avgRating: 0 })

    const reviews = await db.review.findMany({
      where: { apiId: api.id },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const avgRating =
      reviews.length
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : 0

    return Response.json({ reviews, totalCount: reviews.length, avgRating })
  } catch (err) {
    console.error('[/api/reviews GET]', err)
    return Response.json({ reviews: [], totalCount: 0, avgRating: 0 })
  }
}

export async function POST(request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Sign in to leave a review' }, { status: 401 })
  }

  try {
    const { apiId, rating, title, body } = await request.json()

    if (!apiId || !rating || !body?.trim()) {
      return Response.json({ error: 'apiId, rating, and body are required' }, { status: 400 })
    }

    const ratingNum = Number(rating)
    if (ratingNum < 1 || ratingNum > 5) {
      return Response.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const api = await findApi(apiId)
    if (!api) return Response.json({ error: 'API not found' }, { status: 404 })

    // Ensure the user record exists in DB (demo/credentials users are not persisted by default)
    let user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      user = await db.user.upsert({
        where: { email: session.user.email },
        update: { name: session.user.name ?? undefined },
        create: {
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          emailVerified: new Date(),
        },
      })
    }

    const review = await db.review.upsert({
      where: { apiId_userId: { apiId: api.id, userId: user.id } },
      update: { rating: ratingNum, title: title?.trim() || null, body: body.trim() },
      create: {
        apiId: api.id,
        userId: user.id,
        rating: ratingNum,
        title: title?.trim() || null,
        body: body.trim(),
        isVerified: false,
      },
      include: { user: { select: { name: true, image: true } } },
    })

    return Response.json({ review })
  } catch (err) {
    console.error('[/api/reviews POST]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
