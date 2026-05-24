import { Redis } from '@upstash/redis'

// In-memory fallback for local dev without Redis credentials
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

const inMemoryClient = {
  isMemory: true,
  async get(key) {
    if (isExpired(key)) return null
    const val = memStore.get(key)
    return val !== undefined ? val : null
  },
  async set(key, value, ...args) {
    memStore.set(key, value)
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
      if (memStore.has(key)) { memStore.delete(key); memExpiry.delete(key); count++ }
    }
    return count
  },
  async incr(key) {
    if (isExpired(key)) memStore.delete(key)
    const next = parseInt(memStore.get(key) || '0', 10) + 1
    memStore.set(key, next)
    return next
  },
  async incrby(key, increment) {
    if (isExpired(key)) memStore.delete(key)
    const next = parseInt(memStore.get(key) || '0', 10) + increment
    memStore.set(key, next)
    return next
  },
  async expire(key, seconds) {
    if (!memStore.has(key)) return 0
    memExpiry.set(key, Date.now() + seconds * 1000)
    return 1
  },
  async exists(...keys) {
    return keys.flat().filter(k => !isExpired(k) && memStore.has(k)).length
  },
  async keys(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
    return [...memStore.keys()].filter(k => !isExpired(k) && regex.test(k))
  },
  async hget(key, field) {
    if (isExpired(key)) return null
    const hash = memStore.get(`hash:${key}`)
    return hash ? (hash[field] ?? null) : null
  },
  async hset(key, field, value) {
    const existing = memStore.get(`hash:${key}`) || {}
    memStore.set(`hash:${key}`, { ...existing, [field]: value })
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
      expire: (key, s) => { ops.push(['expire', key, s]); return pipe },
      set: (key, val, ...args) => { ops.push(['set', key, val, ...args]); return pipe },
      get: (key) => { ops.push(['get', key]); return pipe },
      del: (...keys) => { ops.push(['del', ...keys]); return pipe },
      async exec() {
        return Promise.all(ops.map(([op, ...args]) => {
          const fn = inMemoryClient[op]
          return typeof fn === 'function' ? fn.apply(inMemoryClient, args) : null
        }))
      },
    }
    return pipe
  },
  async ping() { return 'PONG' },
  async disconnect() {},
  async quit() {},
}

// Use Upstash REST client if credentials are present, otherwise fall back to in-memory
let redis

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
} else {
  console.warn('[Redis] No Upstash credentials found, using in-memory fallback')
  redis = inMemoryClient
}

export { redis, inMemoryClient }
export function getRedis() { return redis }
