import { db } from '@/lib/db'
import { aiGateway } from '@/lib/ai/gateway'

const SLUG_MAP = {
  googlemaps: 'google-maps',
  gemini: 'google-gemini',
  github: 'github-api',
  firebase: 'firebase-realtime',
}

async function findApi(apiId) {
  const slug = SLUG_MAP[apiId] || apiId
  return db.api.findFirst({
    where: { OR: [{ slug }, { slug: apiId }] },
  })
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const apiId = searchParams.get('apiId')

  if (!apiId) return Response.json({ error: 'apiId required' }, { status: 400 })

  try {
    const api = await findApi(apiId)
    if (!api) return Response.json({ endpoints: [], codeSnippets: null })

    // 1. Check the Endpoint table first
    const dbEndpoints = await db.endpoint.findMany({
      where: { apiId: api.id },
      orderBy: { createdAt: 'asc' },
      take: 12,
    })

    if (dbEndpoints.length > 0) {
      const first = dbEndpoints[0]
      let snippets = first.codeSnippets

      if (!snippets) {
        try {
          const { result } = await aiGateway.generateCodeSnippets({
            method: first.method,
            path: first.path,
            baseUrl: api.baseUrl || '',
            description: first.description,
          })
          snippets = result
          await db.endpoint.update({ where: { id: first.id }, data: { codeSnippets: snippets } }).catch(() => {})
        } catch { /* keep null */ }
      }

      return Response.json({
        endpoints: dbEndpoints.map((ep) => ({
          method: ep.method,
          path: ep.path,
          desc: ep.description || ep.aiDescription || '',
          params: ep.parameters || [],
        })),
        codeSnippets: snippets,
        source: 'db',
      })
    }

    // 2. Return cached AI docs if available and non-empty
    const cached = api.aiDocumentation
    if (cached?.endpoints?.length > 0 && !cached?.error) {
      return Response.json({
        endpoints: cached.endpoints,
        codeSnippets: cached.codeSnippets || cached.examples || null,
        source: 'cache',
        provider: cached.provider,
      })
    }

    // 3. Generate via AI — targeted prompt for endpoint listing
    const baseUrl = api.baseUrl || `https://api.${apiId}.com/v1`
    const genPrompt = `List 6 real API endpoints for the ${api.name} API (${api.category}).
Base URL: ${baseUrl}
Description: ${api.description}

Return ONLY a valid JSON object like this:
{
  "endpoints": [
    { "method": "GET", "path": "/endpoint", "desc": "What it does", "params": [{"name":"param","type":"string","required":false,"description":"desc"}] }
  ],
  "codeSnippets": {
    "javascript": "const res = await fetch('${baseUrl}/...');",
    "python": "import requests\\nresponse = requests.get('${baseUrl}/...')",
    "curl": "curl -H 'Authorization: Bearer $API_KEY' ${baseUrl}/...",
    "go": "req, _ := http.NewRequest(\\"GET\\", \\"${baseUrl}/...\\", nil)"
  }
}`

    const { result: genText, provider } = await aiGateway.generateText(genPrompt, {
      maxTokens: 2048,
      temperature: 0.2,
    })

    let parsed = {}
    try {
      const jsonMatch = String(genText).match(/```json\n?([\s\S]*?)\n?```/) || String(genText).match(/(\{[\s\S]*\})/)
      if (jsonMatch) parsed = JSON.parse(jsonMatch[1])
      else parsed = JSON.parse(String(genText))
    } catch { /* fall through to empty */ }

    const endpoints = Array.isArray(parsed.endpoints) ? parsed.endpoints.slice(0, 8) : []
    const codeSnippets = parsed.codeSnippets || null

    // Only cache if we got real endpoints
    if (endpoints.length > 0) {
      await db.api
        .update({
          where: { id: api.id },
          data: {
            aiDocumentation: {
              endpoints,
              codeSnippets,
              provider,
              cachedAt: new Date().toISOString(),
            },
          },
        })
        .catch(() => {})
    }

    return Response.json({ endpoints, codeSnippets, source: 'ai', provider })
  } catch (err) {
    console.error('[/api/endpoints]', err)
    return Response.json({ endpoints: [], codeSnippets: null, error: err.message })
  }
}
