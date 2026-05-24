/**
 * Redis client with in-memory fallback.
 * Uses ioredis. Exposes a unified get/set/del/incr/expire interface
 * that works regardless of whether Redis is available.
 */

import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// In-memory fallback store
const memStore = new Map()
const memExpiry = new Map()

function isExpired(key) {
  const expiry = memExpiry.get(key)
  if (!expiry) return false
  if (Date.now() > expiry) {
    memStore.delete(key)
    memExpiry.delete(key)
    return true
  }
  return false
}

// In-memory implementation matching Redis API
const inMemoryClient = {
  isMemory: true,
  async get(key) {
    if (isExpired(key)) return null
    const val = memStore.get(key)
    return val !== undefined ? String(val) : null
  },
  async set(key, value, ...args) {
    memStore.set(key, String(value))
    // Parse EX/PX from args: set(key, val, 'EX', 60)
    for (let i = 0; i < args.length - 1; i++) {
      if (String(args[i]).toUpperCase() === 'EX') {
        memExpiry.set(key, Date.now() + Number(args[i + 1]) * 1000)
      }
      if (String(args[i]).toUpperCase() === 'PX') {
        memExpiry.set(key, Date.now() + Number(args[i + 1]))
      }
    }
    return 'OK'
  },
  async del(...keys) {
    let count = 0
    for (const key of keys.flat()) {
      if (memStore.has(key)) {
        memStore.delete(key)
        memExpiry.delete(key)
        count++
      }
    }
    return count
  },
  async incr(key) {
    if (isExpired(key)) memStore.delete(key)
    const current = parseInt(memStore.get(key) || '0', 10)
    const next = current + 1
    memStore.set(key, String(next))
    return next
  },
  async incrby(key, increment) {
    if (isExpired(key)) memStore.delete(key)
    const current = parseInt(memStore.get(key) || '0', 10)
    const next = current + increment
    memStore.set(key, String(next))
    return next
  },
  async expire(key, seconds) {
    if (memStore.has(key)) {
      memExpiry.set(key, Date.now() + seconds * 1000)
      return 1
    }
    return 0
  },
  async exists(...keys) {
    return keys.flat().filter((k) => !isExpired(k) && memStore.has(k)).length
  },
  async keys(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
    return [...memStore.keys()].filter((k) => !isExpired(k) && regex.test(k))
  },
  async hget(key, field) {
    if (isExpired(key)) return null
    const hash = memStore.get(`hash:${key}`)
    return hash ? (hash[field] ?? null) : null
  },
  async hset(key, field, value) {
    const existing = memStore.get(`hash:${key}`) || {}
    memStore.set(`hash:${key}`, { ...existing, [field]: String(value) })
    return 1
  },
  async hgetall(key) {
    if (isExpired(key)) return null
    return memStore.get(`hash:${key}`) || null
  },
  pipeline() {
    const ops = []
    const pipe = {
      incr: (key) => { ops.push(['incr', key]); return pipe },
      expire: (key, secs) => { ops.push(['expire', key, secs]); return pipe },
      set: (key, val, ...args) => { ops.push(['set', key, val, ...args]); return pipe },
      get: (key) => { ops.push(['get', key]); return pipe },
      del: (...keys) => { ops.push(['del', ...keys]); return pipe },
      async exec() {
        return Promise.all(ops.map(([op, ...args]) => {
          const fn = inMemoryClient[op]
          if (typeof fn === 'function') return fn.apply(inMemoryClient, args)
          return null
        }))
      },
    }
    return pipe
  },
  async ping() { return 'PONG' },
  async disconnect() {},
  async quit() {},
}

let _redis = null
let _connectionAttempted = false

function createRedisClient() {
  if (_connectionAttempted) return
  _connectionAttempted = true

  try {
    const client = new Redis(REDIS_URL, {
      lazyConnect: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      enableOfflineQueue: false,
    })

    client.on('connect', () => {
      console.info('[Redis] Connected to', REDIS_URL)
      _redis = client
    })

    client.on('error', (err) => {
      if (!_redis || _redis.isMemory) return
      console.warn('[Redis] Error, switching to in-memory:', err.message)
      _redis = inMemoryClient
    })

    // Test connection
    client.ping().then(() => {
      _redis = client
    }).catch(() => {
      console.warn('[Redis] Could not connect, using in-memory fallback')
      _redis = inMemoryClient
      client.quit().catch(() => {})
    })

  } catch (err) {
    console.warn('[Redis] Init failed, using in-memory fallback:', err.message)
    _redis = inMemoryClient
  }
}

// Initialize
_redis = inMemoryClient // Start with in-memory
createRedisClient()

/**
 * Get the Redis client (real or in-memory fallback).
 */
export function getRedis() {
  return _redis || inMemoryClient
}

/**
 * Convenience proxy — delegates all calls to the active client.
 */
export const redis = new Proxy({}, {
  get(_, prop) {
    const client = getRedis()
    const val = client[prop]
    if (typeof val === 'function') {
      return val.bind(client)
    }
    return val
  },
})

export { inMemoryClient }
