/**
 * Ollama Local AI Provider
 * Communicates with a locally running Ollama instance via HTTP
 * Text: llama3 or mistral model
 * Embeddings: nomic-embed-text model
 */

const DEFAULT_BASE_URL = 'http://localhost:11434'
const TEXT_MODEL = 'codellama:7b-instruct'
const FALLBACK_TEXT_MODEL = 'codellama:7b-instruct'
const EMBEDDING_MODEL = 'nomic-embed-text'
const REQUEST_TIMEOUT = 30000 // 30 seconds

export class OllamaProvider {
  constructor() {
    this.name = 'ollama'
    this.baseUrl = process.env.OLLAMA_BASE_URL || DEFAULT_BASE_URL
    this._availableModels = null
    this._lastCheck = 0
    this._checkInterval = 60_000 // Re-check every 60 seconds
  }

  async _fetch(path, options = {}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      })
      clearTimeout(timer)
      return res
    } catch (err) {
      clearTimeout(timer)
      throw err
    }
  }

  async isAvailable() {
    const now = Date.now()
    if (now - this._lastCheck < this._checkInterval && this._availableModels !== null) {
      return this._availableModels.length > 0
    }

    try {
      const res = await this._fetch('/api/tags', { method: 'GET' })
      if (!res.ok) {
        this._availableModels = []
        this._lastCheck = now
        return false
      }
      const data = await res.json()
      this._availableModels = (data.models || []).map((m) => m.name)
      this._lastCheck = now
      return this._availableModels.length > 0
    } catch {
      this._availableModels = []
      this._lastCheck = now
      return false
    }
  }

  _selectTextModel() {
    if (!this._availableModels) return TEXT_MODEL
    if (this._availableModels.some((m) => m.startsWith('codellama'))) return 'codellama:7b-instruct'
    if (this._availableModels.some((m) => m.startsWith('llama3'))) return 'llama3'
    if (this._availableModels.some((m) => m.startsWith('mistral'))) return 'mistral'
    if (this._availableModels.some((m) => m.startsWith('gemma'))) return 'gemma'
    return this._availableModels[0] || TEXT_MODEL
  }

  async generateText(prompt, options = {}) {
    const model = options.model || this._selectTextModel()

    const payload = {
      model,
      prompt: options.systemPrompt
        ? `System: ${options.systemPrompt}\n\nUser: ${prompt}`
        : prompt,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens || 2048,
        top_p: options.topP ?? 0.95,
      },
    }

    try {
      const res = await this._fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorText = await res.text().catch(() => '')
        // Try fallback model if primary not found
        if (res.status === 404 && model !== FALLBACK_TEXT_MODEL) {
          return this.generateText(prompt, { ...options, model: FALLBACK_TEXT_MODEL })
        }
        throw new Error(`Ollama error ${res.status}: ${errorText}`)
      }

      const data = await res.json()
      return data.response || ''
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Ollama request timed out')
      }
      throw err
    }
  }

  async generateEmbedding(text) {
    const hasEmbeddingModel = this._availableModels?.some((m) =>
      m.includes('nomic-embed') || m.includes('embed')
    )

    const model = hasEmbeddingModel ? EMBEDDING_MODEL : this._selectTextModel()

    try {
      const res = await this._fetch('/api/embeddings', {
        method: 'POST',
        body: JSON.stringify({ model, prompt: text }),
      })

      if (!res.ok) {
        // Embedding model might not be available
        return null
      }

      const data = await res.json()
      return data.embedding || null
    } catch {
      return null
    }
  }

  async generateDocumentation(apiData) {
    const { name, description, baseUrl, endpoints = [] } = apiData

    const endpointList = endpoints.slice(0, 8).map((ep) =>
      `- ${ep.method} ${ep.path}: ${ep.description || ''}`
    ).join('\n')

    const prompt = `Generate comprehensive API documentation as JSON.

API: ${name}
Description: ${description || 'Not provided'}
Base URL: ${baseUrl || 'https://api.example.com'}
Endpoints:
${endpointList || 'None listed'}

Respond with ONLY valid JSON:
{
  "overview": "...",
  "authentication": "...",
  "rateLimit": "...",
  "endpoints": [],
  "examples": { "javascript": "...", "python": "...", "curl": "..." }
}`

    const text = await this.generateText(prompt, {
      maxTokens: 3000,
      temperature: 0.2,
      systemPrompt: 'You are an API documentation expert. Always respond with valid JSON.',
    })

    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/)
      if (jsonMatch) return JSON.parse(jsonMatch[1])
      return JSON.parse(text)
    } catch {
      return { raw: text, provider: 'ollama', generatedAt: new Date().toISOString() }
    }
  }

  async generateCodeSnippets(endpoint) {
    const prompt = `Code snippets for API endpoint:
${endpoint.method} ${endpoint.baseUrl || 'https://api.example.com'}${endpoint.path}

JSON response only: { "javascript": "...", "python": "...", "curl": "..." }`

    const text = await this.generateText(prompt, {
      maxTokens: 1500,
      temperature: 0.1,
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
    const prompt = `Analyze this API health data in 2-3 sentences: ${JSON.stringify(healthData)}. Be technical and specific.`
    return this.generateText(prompt, { maxTokens: 200, temperature: 0.3 })
  }

  async composeWorkflow(description) {
    const prompt = `Design API workflow: ${description}

JSON only:
{
  "name": "...",
  "description": "...",
  "steps": [{"order": 1, "api": "...", "action": "...", "params": {}, "description": "..."}],
  "complexity": "low|medium|high"
}`

    const text = await this.generateText(prompt, { maxTokens: 1024, temperature: 0.5 })

    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/)
      if (jsonMatch) return JSON.parse(jsonMatch[1])
      return JSON.parse(text)
    } catch {
      return { raw: text }
    }
  }

  async semanticSearch(query, corpus) {
    // Try embedding-based search first
    try {
      const queryEmbedding = await this.generateEmbedding(query)
      if (queryEmbedding) {
        const results = await Promise.all(
          corpus.slice(0, 30).map(async (item) => {
            const text = typeof item === 'string' ? item : `${item.name || ''} ${item.description || ''}`
            const embedding = await this.generateEmbedding(text)
            if (!embedding) return { item, similarity: 0 }
            const similarity = cosineSimilarity(queryEmbedding, embedding)
            return { item, similarity }
          })
        )
        return results
          .filter((r) => r.similarity > 0.4)
          .sort((a, b) => b.similarity - a.similarity)
          .map((r) => r.item)
      }
    } catch { /* fall through to keyword */ }

    // Keyword fallback
    const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean)
    return corpus.filter((item) => {
      const text = (typeof item === 'string' ? item : JSON.stringify(item)).toLowerCase()
      return queryWords.some((w) => text.includes(w))
    })
  }
}

function cosineSimilarity(a, b) {
  const len = Math.min(a.length, b.length)
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}
