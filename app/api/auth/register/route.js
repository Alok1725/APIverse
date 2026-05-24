import { db } from '@/lib/db'

export async function POST(request) {
  let body
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { name, email } = body
  if (!email?.trim() || !email.includes('@')) {
    return Response.json({ error: 'A valid email is required.' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })
    if (existing) {
      return Response.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || normalizedEmail.split('@')[0],
      },
    })

    return Response.json({ ok: true, id: user.id })
  } catch {
    return Response.json({ error: 'Could not create account. Please try again.' }, { status: 500 })
  }
}
