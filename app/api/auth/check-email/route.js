import { db } from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')?.trim().toLowerCase()
  if (!email) return Response.json({ exists: false })
  try {
    const user = await db.user.findUnique({ where: { email }, select: { id: true } })
    return Response.json({ exists: !!user })
  } catch {
    return Response.json({ exists: false })
  }
}
