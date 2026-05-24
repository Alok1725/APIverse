/**
 * AI Gateway — Smart routing with provider fallback chain
 * Order: Gemini → Groq → Ollama → Mock
 * Tracks usage per provider and returns { result, provider } for UI display
 */

import { GeminiProvider } from './providers/gemini.js'
import { GroqProvider } from './providers/groq.js'
import { OllamaProvider } from './providers/ollama.js'
import { MockProvider } from './providers/mock.js'
import { UsageTracker } from './tracker.js'

// Per-provider rate limits (requests per minute, generous for free tiers)
const RATE_LIMITS = {
  gemini: 55,  // Free tier: 60 rpm
  groq: 28,   // Free tier: 30 rpm
  ollama: 100, // Local, effectively unlimited
  mock: 10000, // No real limit
}

export class AIGateway {
  constructor() {
    this.providers = {
      gemini: new GeminiProvider(),
      groq: new GroqProvider(),
      ollama: new OllamaProvider(),
      mock: new MockProvider(),
    }
    // Lazily initialize Redis-backed tracker
    this._tracker = null
    this._availabilityCache = {}
    this._cacheTime = 30_000 // 30 second cache
  }

  async _getTracker() {
    if (!this._tracker) {
      try {
        const { redis } = await import('../redis.js')
        this._tracker = new UsageTracker(redis)
      } catch {
        this._tracker = new UsageTracker(null)
      }
    }
    return this._tracker
  }

  get tracker() {
    // Synchronous accessor returns tracker (may not be initialized yet)
    return this._tracker || new UsageTracker(null)
  }

  /**
   * Get providers in priority order, checking availability and quotas.
   */
  async _getActiveProviders() {
    const order = ['gemini', 'groq', 'ollama', 'mock']
    const active = []
    const tracker = await this._getTracker()

    for (const name of order) {
      const provider = this.providers[name]
      const limit = RATE_LIMITS[name]

      // Check cache
      const now = Date.now()
      const cached = this._availabilityCache[name]
      if (cached && now - cached.ts < this._cacheTime) {
        if (cached.available) active.push(provider)
        continue
      }

      try {
        const [isAvailable, withinLimit] = await Promise.all([
          provider.isAvailable(),
          tracker.isWithinLimit(name, limit),
        ])

        const available = isAvailable && withinLimit
        this._availabilityCache[name] = { available, ts: now }
        if (available) active.push(provider)
      } catch {
        this._availabilityCache[name] = { available: false, ts: now }
      }
    }

    // Always include mock as final fallback
    if (!active.find((p) => p.name === 'mock')) {
      active.push(this.providers.mock)
    }

    return active
  }

  /**
   * Route an operation through the provider chain.
   */
  async route(operation, ...args) {
    const providers = await this._getActiveProviders()

    let lastError = null
    const tracker = await this._getTracker()

    for (const provider of providers) {
      try {
        const result = await provider[operation](...args)
        await tracker.increment(provider.name)
        return { result, provider: provider.name }
      } catch (err) {
        lastError = err
        // Rate limit — skip to next provider immediately
        if (err.code === 'RATE_LIMIT') {
          this._availabilityCache[provider.name] = { available: false, ts: Date.now() }
          continue
        }
        // Other errors — log and try next
        console.warn(`[AIGateway] ${provider.name}.${operation} failed:`, err.message)
      }
    }

    throw lastError || new Error('All AI providers failed')
  }

  /**
   * Generate text with smart routing.
   */
  async generateText(prompt, options = {}) {
    return this.route('generateText', prompt, options)
  }

  /**
   * Generate embedding (Gemini → Ollama → Mock).
   * Groq doesn't support embeddings so it's skipped automatically via null return.
   */
  async generateEmbedding(text) {
    const providers = [
      this.providers.gemini,
      this.providers.ollama,
      this.providers.mock,
    ]

    const tracker = await this._getTracker()

    for (const provider of providers) {
      try {
        const available = await provider.isAvailable()
        if (!available) continue

        const embedding = await provider.generateEmbedding(text)
        if (embedding && embedding.length > 0) {
          await tracker.increment(provider.name)
          return { result: embedding, provider: provider.name }
        }
      } catch (err) {
        console.warn(`[AIGateway] ${provider.name}.generateEmbedding failed:`, err.message)
      }
    }

    // Mock always works
    const mock = this.providers.mock
    const embedding = await mock.generateEmbedding(text)
    return { result: embedding, provider: 'mock' }
  }

  /**
   * Generate documentation for an API.
   */
  async generateDocumentation(apiData) {
    return this.route('generateDocumentation', apiData)
  }

  /**
   * Generate code snippets for an endpoint.
   */
  async generateCodeSnippets(endpoint) {
    return this.route('generateCodeSnippets', endpoint)
  }

  /**
   * Generate an insight from health data.
   */
  async generateInsight(healthData) {
    return this.route('generateInsight', healthData)
  }

  /**
   * Compose an API workflow from a description.
   */
  async composeWorkflow(description) {
    return this.route('composeWorkflow', description)
  }

  /**
   * Semantic search across a corpus.
   */
  async semanticSearch(query, corpus) {
    return this.route('semanticSearch', query, corpus)
  }

  /**
   * Get current provider usage statistics.
   */
  async getStats() {
    const tracker = await this._getTracker()
    return tracker.getStats()
  }

  /**
   * Invalidate availability cache (force re-check on next request).
   */
  invalidateCache() {
    this._availabilityCache = {}
  }

  /**
   * Get a summary of which providers are currently active.
   */
  async getProviderStatus() {
    const providers = ['gemini', 'groq', 'ollama', 'mock']
    const status = {}

    await Promise.all(
      providers.map(async (name) => {
        try {
          const available = await this.providers[name].isAvailable()
          const withinLimit = await this.tracker.isWithinLimit(name, RATE_LIMITS[name])
          status[name] = {
            available,
            withinLimit,
            active: available && withinLimit,
          }
        } catch {
          status[name] = { available: false, withinLimit: true, active: false }
        }
      })
    )

    return status
  }
}

// Singleton instance
let _gateway = null

export function getAIGateway() {
  if (!_gateway) {
    _gateway = new AIGateway()
  }
  return _gateway
}

export const aiGateway = getAIGateway()
