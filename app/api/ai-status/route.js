/**
 * AI provider health check endpoint.
 * GET /api/ai-status  — pings each provider and reports status + latency.
 */

import { aiGateway } from '@/lib/ai/gateway'

export async function GET() {
  const providers = ['gemini', 'groq', 'ollama', 'mock']
  const results = {}

  await Promise.all(
    providers.map(async (name) => {
      const provider = aiGateway.providers[name]
      const start = Date.now()
      try {
        const available = await provider.isAvailable()
        const latency = Date.now() - start

        if (available) {
          // Do a real generateText call to verify end-to-end
          const genStart = Date.now()
          const text = await provider.generateText('Reply with just the word OK.')
          const genLatency = Date.now() - genStart

          results[name] = {
            status: 'ok',
            available: true,
            pingMs: latency,
            generateMs: genLatency,
            sample: String(text).slice(0, 80),
          }
        } else {
          results[name] = {
            status: 'unavailable',
            available: false,
            pingMs: latency,
            reason: name === 'gemini' || name === 'groq'
              ? 'API key missing or invalid'
              : name === 'ollama'
              ? 'Ollama not running locally (expected at ' + (process.env.OLLAMA_BASE_URL || 'http://localhost:11434') + ')'
              : 'Unknown',
          }
        }
      } catch (err) {
        results[name] = {
          status: 'error',
          available: false,
          pingMs: Date.now() - start,
          error: err.message,
        }
      }
    })
  )

  // Determine which provider the gateway would actually use
  let activeProvider = null
  for (const name of providers) {
    if (results[name]?.available) {
      activeProvider = name
      break
    }
  }

  return Response.json({
    activeProvider,
    providers: results,
    env: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `set (${process.env.GEMINI_API_KEY.slice(0, 8)}...)` : 'NOT SET',
      GROQ_API_KEY: process.env.GROQ_API_KEY ? `set (${process.env.GROQ_API_KEY.slice(0, 8)}...)` : 'NOT SET',
      OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'not set (default: http://localhost:11434)',
    },
    timestamp: new Date().toISOString(),
  })
}
