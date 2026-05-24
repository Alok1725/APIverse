const DAILY_LIMITS = {
  playground: 10,
  compose: 5,
}

export function getUsageData(feature) {
  if (typeof window === 'undefined') return { count: 0, limit: DAILY_LIMITS[feature] ?? 10 }
  const today = new Date().toDateString()
  try {
    const raw = localStorage.getItem(`apiverse_usage_${feature}`)
    const stored = raw ? JSON.parse(raw) : {}
    if (stored.date !== today) return { count: 0, limit: DAILY_LIMITS[feature] ?? 10 }
    return { count: stored.count ?? 0, limit: DAILY_LIMITS[feature] ?? 10 }
  } catch {
    return { count: 0, limit: DAILY_LIMITS[feature] ?? 10 }
  }
}

export function incrementUsage(feature) {
  if (typeof window === 'undefined') return
  const today = new Date().toDateString()
  try {
    const { count } = getUsageData(feature)
    localStorage.setItem(
      `apiverse_usage_${feature}`,
      JSON.stringify({ count: count + 1, date: today })
    )
  } catch {}
}

export function canUse(feature) {
  const { count, limit } = getUsageData(feature)
  return count < limit
}
