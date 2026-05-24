/**
 * Mock AI Provider
 * Returns realistic pre-computed responses for all AI operations.
 * Works fully offline — no API keys required.
 */

const MOCK_DOCS_TEMPLATE = {
  overview: 'This API provides comprehensive access to the platform\'s core functionality through a RESTful interface.',
  authentication: 'Authenticate using Bearer tokens in the Authorization header: `Authorization: Bearer <token>`',
  baseUrl: 'https://api.example.com/v1',
  rateLimit: '1000 requests per hour on free tier, 10000 on paid tier.',
  formats: ['JSON', 'XML'],
  sdks: ['JavaScript/TypeScript', 'Python', 'Ruby', 'Go', 'PHP', 'Java'],
}

const MOCK_INSIGHTS = [
  'API latency increased by 23% in the last hour. Possible causes: traffic spike or downstream dependency issues.',
  'Consistent 99.9% uptime over the past 30 days. Performance is excellent.',
  'Response times are within normal range. No anomalies detected.',
  'Error rate spiked to 2.3% at 14:30 UTC. Recommend investigating 503 responses from /api/payments endpoint.',
  'This API has maintained exceptional reliability. Average latency is 45ms, well within SLA targets.',
  'Rate limiting detected for 12 requests in the last 5 minutes. Consider implementing exponential backoff.',
  'New version 2.1.0 available with breaking changes in the /auth endpoint. Migration required within 90 days.',
  'API performance is optimal. All health checks passing with green status across all regions.',
]

const MOCK_CODE_SNIPPETS = {
  javascript: (endpoint) => `// ${endpoint.method} ${endpoint.path}
const response = await fetch(\`\${BASE_URL}${endpoint.path}\`, {
  method: '${endpoint.method}',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json',
  },
  ${endpoint.method !== 'GET' ? "body: JSON.stringify(payload)," : ''}
});
const data = await response.json();
console.log(data);`,

  python: (endpoint) => `# ${endpoint.method} ${endpoint.path}
import requests

response = requests.${endpoint.method.toLowerCase()}(
    f"{BASE_URL}${endpoint.path}",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    },
    ${endpoint.method !== 'GET' ? 'json=payload,' : ''}
)
data = response.json()
print(data)`,

  curl: (endpoint) => `curl -X ${endpoint.method} "${endpoint.baseUrl || 'https://api.example.com'}${endpoint.path}" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  ${endpoint.method !== 'GET' ? "-d '$JSON_PAYLOAD'" : ''}`,

  go: (endpoint) => `// ${endpoint.method} ${endpoint.path}
req, _ := http.NewRequest("${endpoint.method}", BASE_URL+"${endpoint.path}", ${endpoint.method !== 'GET' ? 'bytes.NewBuffer(payload)' : 'nil'})
req.Header.Set("Authorization", "Bearer "+API_KEY)
req.Header.Set("Content-Type", "application/json")

client := &http.Client{}
resp, err := client.Do(req)
if err != nil {
    log.Fatal(err)
}
defer resp.Body.Close()`,
}

const MOCK_WORKFLOWS = [
  {
    name: 'Email on Payment',
    steps: [
      { api: 'Stripe', action: 'webhooks.listen', trigger: 'payment.succeeded' },
      { api: 'SendGrid', action: 'mail.send', params: { template: 'payment_confirmation' } },
    ],
    description: 'Automatically send a confirmation email when a payment succeeds via Stripe.',
  },
  {
    name: 'User Onboarding',
    steps: [
      { api: 'Auth0', action: 'users.get', trigger: 'user.created' },
      { api: 'Mailgun', action: 'messages.send', params: { template: 'welcome_email' } },
      { api: 'Mixpanel', action: 'track', params: { event: 'user_signup' } },
    ],
    description: 'Complete onboarding flow: welcome email + analytics tracking on new user signup.',
  },
]

/**
 * Generate a deterministic pseudo-embedding from text.
 * Returns a consistent 1536-dimensional vector for the same input.
 */
function mockEmbedding(text) {
  const embedding = new Array(1536).fill(0)
  let seed = 0
  for (let i = 0; i < text.length; i++) {
    seed = (seed * 31 + text.charCodeAt(i)) >>> 0
  }
  for (let i = 0; i < 1536; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    embedding[i] = (seed / 0xFFFFFFFF) * 2 - 1
  }
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0))
  return embedding.map((v) => v / magnitude)
}

/**
 * Simple keyword-based semantic search fallback.
 */
function keywordSearch(query, corpus) {
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean)
  return corpus
    .map((item) => {
      const text = (typeof item === 'string' ? item : JSON.stringify(item)).toLowerCase()
      const score = queryWords.reduce((acc, word) => acc + (text.includes(word) ? 1 : 0), 0)
      return { item, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item)
}

export class MockProvider {
  constructor() {
    this.name = 'mock'
  }

  async isAvailable() {
    return true
  }

  async generateText(prompt) {
    await new Promise((r) => setTimeout(r, 80)) // Simulate slight latency

    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes('document') || lowerPrompt.includes('docs')) {
      return `# API Documentation

## Overview
${MOCK_DOCS_TEMPLATE.overview}

## Authentication
${MOCK_DOCS_TEMPLATE.authentication}

## Base URL
\`${MOCK_DOCS_TEMPLATE.baseUrl}\`

## Rate Limiting
${MOCK_DOCS_TEMPLATE.rateLimit}

## Response Format
All responses are returned as JSON with the following structure:
\`\`\`json
{
  "data": { ... },
  "meta": { "timestamp": "ISO8601", "version": "1.0" },
  "error": null
}
\`\`\`

## Available SDKs
${MOCK_DOCS_TEMPLATE.sdks.map((s) => `- ${s}`).join('\n')}
`
    }

    if (lowerPrompt.includes('insight') || lowerPrompt.includes('health') || lowerPrompt.includes('monitor')) {
      const randomInsight = MOCK_INSIGHTS[Math.floor(Math.random() * MOCK_INSIGHTS.length)]
      return randomInsight
    }

    if (lowerPrompt.includes('workflow') || lowerPrompt.includes('compos')) {
      return JSON.stringify(MOCK_WORKFLOWS[0], null, 2)
    }

    if (lowerPrompt.includes('search') || lowerPrompt.includes('find') || lowerPrompt.includes('discover')) {
      return 'Based on your query, I found APIs related to payment processing, authentication, and data storage. The top match is Stripe (99.9% uptime, <80ms latency) followed by PayPal and Razorpay.'
    }

    return `Mock AI response for: "${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}"

This is a pre-computed response from the Mock AI provider. In production, this would be replaced by Gemini, Groq, or Ollama depending on availability and rate limits.

Key information extracted:
- Query analyzed successfully
- No external API calls made
- Response generated in <100ms
- Provider: Mock (offline mode)`
  }

  async generateEmbedding(text) {
    await new Promise((r) => setTimeout(r, 20))
    return mockEmbedding(text)
  }

  async generateDocumentation(apiData) {
    await new Promise((r) => setTimeout(r, 120))
    const { name, description, baseUrl, endpoints = [] } = apiData

    return {
      overview: description || MOCK_DOCS_TEMPLATE.overview,
      authentication: MOCK_DOCS_TEMPLATE.authentication,
      baseUrl: baseUrl || MOCK_DOCS_TEMPLATE.baseUrl,
      rateLimit: MOCK_DOCS_TEMPLATE.rateLimit,
      endpoints: endpoints.map((ep) => ({
        ...ep,
        description: ep.description || `Performs ${ep.method} operation on ${ep.path}`,
        parameters: ep.parameters || [],
        responses: ep.responses || {
          200: { description: 'Success', schema: { type: 'object' } },
          400: { description: 'Bad Request' },
          401: { description: 'Unauthorized' },
          500: { description: 'Internal Server Error' },
        },
      })),
      examples: {
        curl: endpoints[0] ? MOCK_CODE_SNIPPETS.curl(endpoints[0]) : '',
        javascript: endpoints[0] ? MOCK_CODE_SNIPPETS.javascript(endpoints[0]) : '',
        python: endpoints[0] ? MOCK_CODE_SNIPPETS.python(endpoints[0]) : '',
      },
      generatedAt: new Date().toISOString(),
      provider: 'mock',
    }
  }

  async generateCodeSnippets(endpoint) {
    await new Promise((r) => setTimeout(r, 60))
    return {
      javascript: MOCK_CODE_SNIPPETS.javascript(endpoint),
      python: MOCK_CODE_SNIPPETS.python(endpoint),
      curl: MOCK_CODE_SNIPPETS.curl(endpoint),
      go: MOCK_CODE_SNIPPETS.go(endpoint),
    }
  }

  async generateInsight(healthData) {
    await new Promise((r) => setTimeout(r, 80))
    const { status, avgLatency, uptime30d, errorRate } = healthData || {}

    if (status === 'down') {
      return 'CRITICAL: API is currently down. All health checks are failing. Investigate immediately and check the API provider status page.'
    }
    if (status === 'degraded') {
      return `DEGRADED: API is responding slowly. Average latency is ${avgLatency || 'high'}ms — above normal thresholds. Consider using a fallback endpoint.`
    }
    if (uptime30d && uptime30d < 99) {
      return `WARNING: 30-day uptime is ${uptime30d}%, below the 99% target. Review recent incidents and check for patterns.`
    }
    if (errorRate && errorRate > 1) {
      return `NOTICE: Error rate is ${errorRate}%, slightly elevated. Monitoring closely. Most errors appear to be 429 (rate limit) responses.`
    }

    const randomInsight = MOCK_INSIGHTS[Math.floor(Math.random() * MOCK_INSIGHTS.length)]
    return randomInsight
  }

  async composeWorkflow(description) {
    await new Promise((r) => setTimeout(r, 150))
    const lowerDesc = description.toLowerCase()

    if (lowerDesc.includes('payment') || lowerDesc.includes('stripe')) {
      return MOCK_WORKFLOWS[0]
    }
    if (lowerDesc.includes('user') || lowerDesc.includes('signup') || lowerDesc.includes('onboard')) {
      return MOCK_WORKFLOWS[1]
    }

    return {
      name: 'Custom Workflow',
      steps: [
        { api: 'Trigger API', action: 'listen', trigger: 'event.occurred' },
        { api: 'Action API', action: 'execute', params: {} },
      ],
      description: `AI-generated workflow for: ${description}`,
    }
  }

  async semanticSearch(query, corpus) {
    await new Promise((r) => setTimeout(r, 30))
    return keywordSearch(query, corpus)
  }
}
