import { db } from '@/lib/db'

export async function POST(request) {
  let body
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, alertType } = body

  if (!email?.trim() || !email.includes('@')) {
    return Response.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const type = alertType || 'all'
  if (!['all', 'breaking', 'deprecation'].includes(type)) {
    return Response.json({ error: 'Invalid alert type' }, { status: 400 })
  }

  try {
    const sub = await db.alertSubscription.upsert({
      where: { email_alertType: { email: email.trim(), alertType: type } },
      update: {},
      create: { email: email.trim(), alertType: type },
    })
    return Response.json({ ok: true, id: sub.id })
  } catch (err) {
    console.error('[/api/alerts]', err)
    return Response.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}
