/**
 * Groq AI Provider
 * Uses groq-sdk
 * Model: llama-3.1-8b-instant (free tier, ultra-fast)
 * Note: Groq free tier does not support embeddings.
 */

import Groq from 'groq-sdk'

const TEXT_MODEL = 'llama-3.1-8b-instant'
const FALLBACK_MODEL = 'mixtral-8x7b-32768'

export class GroqProvider {
  constructor() {
    this.name = 'groq'
    this.apiKey = process.env.GROQ_API_KEY
    this._client = null
  }

  _getClient() {
    if (!this._client && this.apiKey) {
      this._client = new Groq({ apiKey: this.apiKey })
    }
    return this._client
  }

  async isAvailable() {
    if (!this.apiKey) return false
    try {
      const client = this._getClient()
      // Quick ping with minimal tokens
      await client.chat.completions.create({
        model: TEXT_MODEL,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 5,
      })
      return true
    } catch {
      return false
    }
  }

  async generateText(prompt, options = {}) {
    const client = this._getClient()
    if (!client) throw new Error('Groq API key not configured')

    const model = options.model || TEXT_MODEL

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: options.systemPrompt ||
              'You are a helpful AI assistant specialized in API documentation, analysis, and development tooling.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature ?? 0.7,
        top_p: options.topP ?? 0.95,
        stream: false,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (err) {
      if (err.status === 429) {
        // Try fallback model
        try {
          const completion = await client.chat.completions.create({
            model: FALLBACK_MODEL,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: options.maxTokens || 2048,
          })
          return completion.choices[0]?.message?.content || ''
        } catch {
          throw Object.assign(new Error('Groq rate limit exceeded on all models'), { code: 'RATE_LIMIT', provider: 'groq' })
        }
      }
      throw err
    }
  }

  /**
   * Groq does not support embeddings on the free tier.
   * Returns null to signal the gateway to use another provider.
   */
  async generateEmbedding(_text) {
    return null
  }

  async generateDocumentation(apiData) {
    const { name, description, baseUrl, endpoints = [] } = apiData

    const endpointList = endpoints.slice(0, 8).map((ep) =>
      `- ${ep.method} ${ep.path}: ${ep.description || 'No description'}`
    ).join('\n')

    const prompt = `Generate comprehensive API documentation for the following API as a structured JSON object.

API: ${name}
Description: ${description || 'Not provided'}
Base URL: ${baseUrl || 'Not provided'}
Endpoints:
${endpointList || 'No endpoints listed'}

Return ONLY valid JSON with this structure:
{
  "overview": "string",
  "authentication": "string",
  "rateLimit": "string",
  "endpoints": [],
  "examples": { "javascript": "code", "python": "code", "curl": "code" },
  "errorHandling": "string",
  "bestPractices": ["string"]
}`

    const text = await this.generateText(prompt, {
      maxTokens: 3072,
      temperature: 0.2,
      systemPrompt: 'You are an expert API documentation writer. Always respond with valid JSON only.',
    })

    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/)
      if (jsonMatch) return JSON.parse(jsonMatch[1])
      return JSON.parse(text)
    } catch {
      return { raw: text, provider: 'groq', generatedAt: new Date().toISOString() }
    }
  }

  async generateCodeSnippets(endpoint) {
    const prompt = `Generate API code snippets for:
Method: ${endpoint.method}
Path: ${endpoint.path}
Base URL: ${endpoint.baseUrl || 'https://api.example.com'}

Return ONLY JSON: { "javascript": "...", "python": "...", "curl": "...", "go": "..." }`

    const text = await this.generateText(prompt, {
      maxTokens: 1536,
      temperature: 0.1,
      systemPrompt: 'You generate code snippets. Respond with valid JSON only.',
    })

    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/)
      if (jsonMatch) return JSON.parse(jsonMatch[1])
      return JSON.parse(text)
    } catch {
      return { raw: text }
    }
  }

  async generateInsight(healthData) {
    const prompt = `API Health Analysis. Data: ${JSON.stringify(healthData)}

Provide a 2-3 sentence technical insight about this API's health. Be specific about numbers, trends, and actionable recommendations. No pleasantries.`

    return this.generateText(prompt, {
      maxTokens: 200,
      temperature: 0.4,
      systemPrompt: 'You are a terse, expert API reliability engineer. Be direct and technical.',
    })
  }

  async composeWorkflow(description) {
    const prompt = `Design an API workflow for: ${description}

Return ONLY this JSON structure:
{
  "name": "string",
  "description": "string",
  "steps": [
    {
      "order": 1,
      "api": "string",
      "action": "string",
      "trigger": "string (only for first step)",
      "params": {},
      "description": "string"
    }
  ],
  "estimatedLatency": "string",
  "complexity": "low|medium|high"
}`

    const text = await this.generateText(prompt, {
      maxTokens: 1024,
      temperature: 0.5,
      systemPrompt: 'You design API workflows. Respond with valid JSON only.',
    })

    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/)
      if (jsonMatch) return JSON.parse(jsonMatch[1])
      return JSON.parse(text)
    } catch {
      return { raw: text }
    }
  }

  async semanticSearch(query, corpus) {
    // Groq doesn't support embeddings, use text-based ranking via LLM
    const itemsList = corpus.slice(0, 15).map((item, i) => {
      const text = typeof item === 'string' ? item : `${item.name || ''}: ${item.description || ''}`
      return `${i}. ${text.slice(0, 100)}`
    }).join('\n')

    const prompt = `Rank these items by relevance to the query: "${query}"

Items:
${itemsList}

Return a JSON array of the top 5 most relevant item indices (0-based), ordered by relevance: [0, 3, 1, ...]`

    const text = await this.generateText(prompt, {
      maxTokens: 64,
      temperature: 0,
      systemPrompt: 'Return only a JSON array of integers.',
    })

    try {
      const jsonMatch = text.match(/\[[\d,\s]*\]/)
      if (jsonMatch) {
        const indices = JSON.parse(jsonMatch[0])
        return indices.filter((i) => i < corpus.length).map((i) => corpus[i])
      }
    } catch { /* fall through */ }

    // Keyword fallback
    const queryWords = query.toLowerCase().split(/\s+/)
    return corpus.filter((item) => {
      const text = typeof item === 'string' ? item : JSON.stringify(item)
      return queryWords.some((w) => text.toLowerCase().includes(w))
    })
  }
}
