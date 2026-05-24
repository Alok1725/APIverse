/**
 * Embedding-specific routing
 * Routes embedding requests: Gemini → Ollama → Mock
 * Mock embeddings: deterministic from text hash (returns consistent 1536-dim vector)
 */

import { GeminiProvider } from './providers/gemini.js'
import { OllamaProvider } from './providers/ollama.js'

const gemini = new GeminiProvider()
const ollama = new OllamaProvider()

/**
 * Generate a deterministic mock embedding from text.
 * Returns a consistent, normalized 1536-dimensional vector.
 */
function mockEmbedding(text) {
  const dim = 1536
  const embedding = new Array(dim)
  let seed = 5381 // djb2 initial value

  for (let i = 0; i < text.length; i++) {
    seed = ((seed << 5) + seed + text.charCodeAt(i)) >>> 0
  }

  for (let i = 0; i < dim; i++) {
    // LCG random
    seed = (seed * 1664525 + 1013904223) >>> 0
    embedding[i] = (seed / 0xFFFFFFFF) * 2 - 1
  }

  // L2 normalize
  let magnitude = 0
  for (let i = 0; i < dim; i++) magnitude += embedding[i] * embedding[i]
  magnitude = Math.sqrt(magnitude)
  for (let i = 0; i < dim; i++) embedding[i] /= magnitude

  return embedding
}

/**
 * Generate a single embedding for text.
 * Routing: Gemini → Ollama → Mock
 * Returns { embedding: number[], provider: string }
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Embedding text must be a non-empty string')
  }

  // Try Gemini first (1536-dim, most accurate)
  if (process.env.GEMINI_API_KEY) {
    try {
      const embedding = await gemini.generateEmbedding(text)
      if (embedding && embedding.length > 0) {
        return { embedding, provider: 'gemini' }
      }
    } catch (err) {
      if (err.code !== 'RATE_LIMIT') {
        console.warn('[Embeddings] Gemini failed:', err.message)
      }
    }
  }

  // Try Ollama (local, variable dimensions)
  try {
    const available = await ollama.isAvailable()
    if (available) {
      const embedding = await ollama.generateEmbedding(text)
      if (embedding && embedding.length > 0) {
        return { embedding, provider: 'ollama' }
      }
    }
  } catch (err) {
    console.warn('[Embeddings] Ollama failed:', err.message)
  }

  // Fall back to deterministic mock embedding
  const embedding = mockEmbedding(text)
  return { embedding, provider: 'mock' }
}

/**
 * Generate embeddings for multiple texts in batch.
 * Returns array of { embedding, provider } objects.
 */
export async function batchEmbeddings(texts, options = {}) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return []
  }

  const { concurrency = 5 } = options
  const results = []

  // Process in chunks to avoid overwhelming the provider
  for (let i = 0; i < texts.length; i += concurrency) {
    const chunk = texts.slice(i, i + concurrency)
    const chunkResults = await Promise.all(chunk.map((text) => generateEmbedding(text)))
    results.push(...chunkResults)
  }

  return results
}

/**
 * Compute cosine similarity between two embedding vectors.
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Find the top-K most similar items from a corpus using embeddings.
 */
export async function semanticRank(query, corpus, { topK = 10, threshold = 0.5 } = {}) {
  const { embedding: queryEmbedding } = await generateEmbedding(query)

  const scored = corpus.map((item) => {
    const embedding = item.embedding || item._embedding
    if (!embedding) return { item, score: 0 }
    return { item, score: cosineSimilarity(queryEmbedding, embedding) }
  })

  return scored
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((r) => ({ ...r.item, _score: r.score }))
}
