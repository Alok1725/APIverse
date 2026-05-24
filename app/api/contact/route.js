import { db } from '@/lib/db'

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Response.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }

    const entry = await db.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject?.trim() || 'General',
        message: message.trim(),
      },
    })

    return Response.json({ ok: true, id: entry.id })
  } catch (err) {
    console.error('[/api/contact]', err)
    return Response.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
