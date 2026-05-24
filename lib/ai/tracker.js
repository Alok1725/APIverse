/**
 * Usage Tracker
 * Tracks per-provider AI usage with 1-minute sliding windows.
 * Persists to Redis if available, falls back to in-memory Map.
 */

const IN_MEMORY_STORE = new Map()

/**
 * Get the current 1-minute window key
 */
function getWindowKey(provider, windowMinutes = 1) {
  const windowMs = windowMinutes * 60 * 1000
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs
  return `usage:${provider}:${windowStart}`
}

export class UsageTracker {
  constructor(redisClient = null) {
    this.redis = redisClient
    this.keyPrefix = 'apiverse:usage:'
  }

  async increment(provider) {
    const key = `${this.keyPrefix}${getWindowKey(provider)}`

    if (this.redis) {
      try {
        const pipeline = this.redis.pipeline ? this.redis.pipeline() : null
        if (pipeline) {
          pipeline.incr(key)
          pipeline.expire(key, 120) // TTL: 2 minutes
          await pipeline.exec()
        } else {
          await this.redis.incr(key)
          await this.redis.expire(key, 120)
        }
        return
      } catch {
        // Fall through to in-memory
      }
    }

    // In-memory fallback
    const current = IN_MEMORY_STORE.get(key) || 0
    IN_MEMORY_STORE.set(key, current + 1)

    // Cleanup old keys (every 100 increments)
    if (Math.random() < 0.01) {
      const cutoff = Date.now() - 5 * 60 * 1000
      for (const [k] of IN_MEMORY_STORE) {
        const parts = k.split(':')
        const ts = parseInt(parts[parts.length - 1])
        if (ts && ts < cutoff) IN_MEMORY_STORE.delete(k)
      }
    }
  }

  async getCount(provider, windowMinutes = 1) {
    const key = `${this.keyPrefix}${getWindowKey(provider, windowMinutes)}`

    if (this.redis) {
      try {
        const val = await this.redis.get(key)
        return parseInt(val || '0', 10)
      } catch { /* fall through */ }
    }

    return IN_MEMORY_STORE.get(key) || 0
  }

  async isWithinLimit(provider, limit, windowMinutes = 1) {
    const count = await this.getCount(provider, windowMinutes)
    return count < limit
  }

  async getStats() {
    const providers = ['gemini', 'groq', 'ollama', 'mock']
    const stats = {}

    for (const provider of providers) {
      const key1m = `${this.keyPrefix}${getWindowKey(provider, 1)}`
      const key5m = `${this.keyPrefix}${getWindowKey(provider, 5)}`
      const key60m = `${this.keyPrefix}${getWindowKey(provider, 60)}`

      if (this.redis) {
        try {
          const [count1m, count5m, count60m] = await Promise.all([
            this.redis.get(key1m).then((v) => parseInt(v || '0')).catch(() => 0),
            this.redis.get(key5m).then((v) => parseInt(v || '0')).catch(() => 0),
            this.redis.get(key60m).then((v) => parseInt(v || '0')).catch(() => 0),
          ])
          stats[provider] = { last1m: count1m, last5m: count5m, last60m: count60m }
          continue
        } catch { /* fall through */ }
      }

      stats[provider] = {
        last1m: IN_MEMORY_STORE.get(key1m) || 0,
        last5m: IN_MEMORY_STORE.get(key5m) || 0,
        last60m: IN_MEMORY_STORE.get(key60m) || 0,
      }
    }

    return stats
  }

  /**
   * Reset usage for a specific provider (useful in tests)
   */
  async reset(provider) {
    if (this.redis) {
      try {
        const keys = await this.redis.keys(`${this.keyPrefix}usage:${provider}:*`)
        if (keys.length > 0) await this.redis.del(...keys)
        return
      } catch { /* fall through */ }
    }

    for (const key of IN_MEMORY_STORE.keys()) {
      if (key.includes(`:${provider}:`)) IN_MEMORY_STORE.delete(key)
    }
  }
}
