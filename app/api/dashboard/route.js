import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()

  // Guest response — no DB user
  if (!session?.user?.email) {
    return Response.json({
      savedApis: [],
      recentSearches: [],
      reviewCount: 0,
      savedCount: 0,
      authenticated: false,
    })
  }

  try {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        savedApis: {
          include: {
            api: {
              select: {
                slug: true,
                name: true,
                category: true,
                currentStatus: true,
                uptime30d: true,
                avgLatency: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
        },
        searchHistory: {
          orderBy: { createdAt: 'desc' },
          take: 8,
        },
        reviews: {
          select: { id: true },
        },
      },
    })

    if (!user) {
      return Response.json({
        savedApis: [],
        recentSearches: [],
        reviewCount: 0,
        savedCount: 0,
        authenticated: true,
      })
    }

    return Response.json({
      authenticated: true,
      reviewCount: user.reviews.length,
      savedCount: user.savedApis.length,
      savedApis: user.savedApis.map((s) => ({
        id: s.api.slug,
        name: s.api.name,
        category: s.api.category,
        status: s.api.currentStatus.toLowerCase(),
        uptime: s.api.uptime30d ?? 99.9,
        savedAt: s.createdAt,
      })),
      recentSearches: user.searchHistory.map((s) => ({
        query: s.query,
        results: s.results,
        provider: s.provider,
        time: s.createdAt,
      })),
    })
  } catch (err) {
    console.error('[/api/dashboard]', err)
    return Response.json({
      savedApis: [],
      recentSearches: [],
      reviewCount: 0,
      savedCount: 0,
      authenticated: true,
      error: err.message,
    })
  }
}
