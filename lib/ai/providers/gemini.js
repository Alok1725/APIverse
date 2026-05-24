/**
 * Google Gemini AI Provider
 * Uses @google/generative-ai SDK
 * Models: gemini-1.5-flash (text), embedding-001 (embeddings)
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const TEXT_MODEL = 'gemini-1.5-flash'
const EMBEDDING_MODEL = 'embedding-001'

export class GeminiProvider {
  constructor() {
    this.name = 'gemini'
    this.apiKey = process.env.GEMINI_API_KEY
    this._client = null
  }

  _getClient() {
    if (!this._client && this.apiKey) {
      this._client = new GoogleGenerativeAI(this.apiKey)
    }
    return this._client
  }

  async isAvailable() {
    if (!this.apiKey) return false
    try {
      const client = this._getClient()
      const model = client.getGenerativeModel({ model: TEXT_MODEL })
      // Lightweight ping
      const result = await model.generateContent('ping')
      return !!result
    } catch {
      return false
    }
  }

  async generateText(prompt, options = {}) {
    const client = this._getClient()
    if (!client) throw new Error('Gemini API key not configured')

    const model = client.getGenerativeModel({
      model: TEXT_MODEL,
      generationConfig: {
        maxOutputTokens: options.maxTokens || 2048,
        temperature: options.temperature ?? 0.7,
        topP: options.topP ?? 0.95,
      },
    })

    try {
      const result = await model.generateContent(prompt)
      const response = result.response
      return response.text()
    } catch (err) {
      if (err.status === 429) {
        throw Object.assign(new Error('Gemini rate limit exceeded'), { code: 'RATE_LIMIT', provider: 'gemini' })
      }
      throw err
    }
  }

  async generateEmbedding(text) {
    const client = this._getClient()
    if (!client) throw new Error('Gemini API key not configured')

    try {
      const model = client.getGenerativeModel({ model: EMBEDDING_MODEL })
      const result = await model.embedContent(text)
      return result.embedding.values
    } catch (err) {
      if (err.status === 429) {
        throw Object.assign(new Error('Gemini rate limit exceeded'), { code: 'RATE_LIMIT', provider: 'gemini' })
      }
      throw err
    }
  }

  async generateDocumentation(apiData) {
    const { name, description, baseUrl, endpoints = [] } = apiData

    const endpointList = endpoints.slice(0, 10).map((ep) =>
      `- ${ep.method} ${ep.path}: ${ep.description || 'No description'}`
    ).join('\n')

    const prompt = `You are an expert API documentation writer. Generate comprehensive, developer-friendly documentation for the following API.

API Name: ${name}
Description: ${description || 'No description provided'}
Base URL: ${baseUrl || 'Not provided'}

Endpoints:
${endpointList || 'No endpoints provided'}

Generate documentation including:
1. Overview and use cases
2. Authentication guide
3. Rate limiting information
4. Endpoint descriptions with parameters and response schemas
5. Code examples in JavaScript and Python
6. Error handling guide
7. Best practices

Format as structured JSON with these fields: overview, authentication, rateLimit, endpoints (array), examples, errorHandling, bestPractices`

    const text = await this.generateText(prompt, { maxTokens: 4096, temperature: 0.3 })

    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1])
      }
    } catch { /* fall through */ }

    return { raw: text, provider: 'gemini', generatedAt: new Date().toISOString() }
  }

  async generateCodeSnippets(endpoint) {
    const prompt = `Generate code snippets for the following API endpoint in multiple languages.

Method: ${endpoint.method}
Path: ${endpoint.path}
Base URL: ${endpoint.baseUrl || 'https://api.example.com'}
Description: ${endpoint.description || ''}
Parameters: ${JSON.stringify(endpoint.parameters || [])}

Generate snippets for: JavaScript (fetch), Python (requests), cURL, Go (net/http)

Return as JSON: { javascript, python, curl, go }`

    const text = await this.generateText(prompt, { maxTokens: 2048, temperature: 0.2 })

    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/)
      if (jsonMatch) return JSON.parse(jsonMatch[1])
    } catch { /* fall through */ }

    return { raw: text }
  }

  async generateInsight(healthData) {
    const prompt = `You are an API reliability engineer. Analyze this API health data and provide a concise, actionable insight in 2-3 sentences.

Health Data: ${JSON.stringify(healthData)}

Focus on: status trends, latency patterns, error rates, and specific recommendations.
Be direct and technical. No fluff.`

    return this.generateText(prompt, { maxTokens: 256, temperature: 0.5 })
  }

  async composeWorkflow(description) {
    const prompt = `You are an API integration expert. Design a workflow that: ${description}

Return a JSON object with:
{
  "name": "workflow name",
  "description": "what it does",
  "steps": [
    {
      "order": 1,
      "api": "API name",
      "action": "action.name",
      "trigger": "event that triggers this (if first step)",
      "params": {},
      "description": "what this step does"
    }
  ],
  "estimatedLatency": "Xms",
  "complexity": "low|medium|high"
}`

    const text = await this.generateText(prompt, { maxTokens: 1024, temperature: 0.6 })

    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/)
      if (jsonMatch) return JSON.parse(jsonMatch[1])
    } catch { /* fall through */ }

    return { raw: text }
  }

  async semanticSearch(query, corpus) {
    // Use embeddings for true semantic search
    try {
      const queryEmbedding = await this.generateEmbedding(query)

      const results = await Promise.all(
        corpus.map(async (item) => {
          const text = typeof item === 'string' ? item : `${item.name || ''} ${item.description || ''}`
          const embedding = await this.generateEmbedding(text)
          const similarity = cosineSimilarity(queryEmbedding, embedding)
          return { item, similarity }
        })
      )

      return results
        .filter((r) => r.similarity > 0.5)
        .sort((a, b) => b.similarity - a.similarity)
        .map((r) => r.item)
    } catch {
      // Fall back to text-based search via Gemini
      const itemsList = corpus.slice(0, 20).map((item, i) =>
        `${i}: ${typeof item === 'string' ? item : JSON.stringify(item)}`
      ).join('\n')

      const prompt = `Given the query: "${query}"
Find the most relevant items from this list (return comma-separated indices of top 5):
${itemsList}`

      const response = await this.generateText(prompt, { maxTokens: 64, temperature: 0 })
      const indices = response.match(/\d+/g)?.map(Number) || []
      return indices.filter((i) => i < corpus.length).map((i) => corpus[i])
    }
  }
}

function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}
