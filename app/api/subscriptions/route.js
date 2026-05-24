import { db } from '@/lib/db'
import { auth } from '@/auth'

async function ensureUser(session) {
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
  return user
}

// GET /api/subscriptions?apiSlug=stripe — returns whether the current user is subscribed
export async function GET(request) {
  const session = await auth()
  if (!session?.user) return Response.json({ subscribed: false })

  const { searchParams } = new URL(request.url)
  const apiSlug = searchParams.get('apiSlug')
  if (!apiSlug) return Response.json({ subscribed: false })

  try {
    const [user, api] = await Promise.all([
      ensureUser(session),
      db.api.findUnique({ where: { slug: apiSlug }, select: { id: true } }),
    ])
    if (!api) return Response.json({ subscribed: false })

    const sub = await db.subscription.findUnique({
      where: { userId_apiId: { userId: user.id, apiId: api.id } },
    })
    return Response.json({ subscribed: !!sub && sub.isActive })
  } catch (err) {
    console.error('[/api/subscriptions GET]', err)
    return Response.json({ subscribed: false })
  }
}

// POST /api/subscriptions — toggles subscription for { apiSlug }
export async function POST(request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Sign in to subscribe' }, { status: 401 })
  }

  let body
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { apiSlug } = body
  if (!apiSlug) return Response.json({ error: 'apiSlug required' }, { status: 400 })

  try {
    const [user, api] = await Promise.all([
      ensureUser(session),
      db.api.findUnique({ where: { slug: apiSlug }, select: { id: true } }),
    ])
    if (!api) return Response.json({ error: 'API not found' }, { status: 404 })

    const existing = await db.subscription.findUnique({
      where: { userId_apiId: { userId: user.id, apiId: api.id } },
    })

    if (existing) {
      // Toggle active state
      const updated = await db.subscription.update({
        where: { userId_apiId: { userId: user.id, apiId: api.id } },
        data: { isActive: !existing.isActive },
      })
      return Response.json({ subscribed: updated.isActive })
    } else {
      await db.subscription.create({
        data: {
          userId: user.id,
          apiId: api.id,
          alertOn: ['downtime', 'breaking_change'],
          channels: ['email'],
          isActive: true,
        },
      })
      return Response.json({ subscribed: true })
    }
  } catch (err) {
    console.error('[/api/subscriptions POST]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
