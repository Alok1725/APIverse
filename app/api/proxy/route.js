/**
 * Playground proxy — forwards requests server-side to avoid CORS.
 * API keys stay in the browser session and are never logged or stored.
 */

const BLOCKED_HOSTS = /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/i
const MAX_RESPONSE_BYTES = 512 * 1024 // 512 KB
const TIMEOUT_MS = 15_000

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { method = 'GET', url, headers = {}, body: reqBody, auth } = body

  // Validate URL
  if (!url || typeof url !== 'string') {
    return Response.json({ error: 'Missing url' }, { status: 400 })
  }

  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return Response.json({ error: 'Only http/https URLs are allowed' }, { status: 400 })
  }

  if (BLOCKED_HOSTS.test(parsed.hostname)) {
    return Response.json({ error: 'Requests to private/internal hosts are not allowed' }, { status: 403 })
  }

  // Build headers
  const outHeaders = {}
  if (headers && typeof headers === 'object') {
    for (const [k, v] of Object.entries(headers)) {
      if (k && v) outHeaders[k] = String(v)
    }
  }

  // Apply auth
  if (auth?.type && auth.type !== 'none' && auth.value) {
    if (auth.type === 'bearer') {
      outHeaders['Authorization'] = `Bearer ${auth.value}`
    } else if (auth.type === 'apikey') {
      outHeaders['X-API-Key'] = auth.value
    } else if (auth.type === 'basic') {
      const encoded = Buffer.from(auth.value).toString('base64')
      outHeaders['Authorization'] = `Basic ${encoded}`
    }
  }

  const startTime = Date.now()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: outHeaders,
      signal: controller.signal,
      redirect: 'follow',
    }

    if (reqBody && !['GET', 'HEAD'].includes(method.toUpperCase())) {
      fetchOptions.body = typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody)
    }

    const res = await fetch(url, fetchOptions)
    clearTimeout(timeoutId)

    const elapsed = Date.now() - startTime

    // Read body with size cap
    const reader = res.body?.getReader()
    let totalBytes = 0
    const chunks = []

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        totalBytes += value.length
        if (totalBytes > MAX_RESPONSE_BYTES) {
          chunks.push(value.slice(0, MAX_RESPONSE_BYTES - (totalBytes - value.length)))
          break
        }
        chunks.push(value)
      }
    }

    const raw = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf-8')
    const sizeLabel = totalBytes < 1024
      ? `${totalBytes} B`
      : `${(totalBytes / 1024).toFixed(1)} KB`

    // Collect response headers (safe subset)
    const respHeaders = {}
    const SAFE_RESP_HEADERS = [
      'content-type', 'x-request-id', 'x-ratelimit-limit', 'x-ratelimit-remaining',
      'x-ratelimit-reset', 'ratelimit-limit', 'ratelimit-remaining', 'ratelimit-reset',
      'cache-control', 'server', 'x-powered-by', 'x-api-version', 'location',
      'x-correlation-id', 'cf-ray', 'date', 'vary',
    ]
    for (const [k, v] of res.headers.entries()) {
      if (SAFE_RESP_HEADERS.includes(k.toLowerCase())) {
        respHeaders[k] = v
      }
    }

    // Try to pretty-print JSON
    let bodyText = raw
    try {
      bodyText = JSON.stringify(JSON.parse(raw), null, 2)
    } catch {
      // Not JSON — return as-is
    }

    return Response.json({
      status: res.status,
      statusText: res.statusText,
      time: elapsed,
      size: sizeLabel,
      body: bodyText,
      headers: respHeaders,
    })
  } catch (err) {
    clearTimeout(timeoutId)
    const elapsed = Date.now() - startTime

    if (err.name === 'AbortError') {
      return Response.json({
        status: 408,
        statusText: 'Request Timeout',
        time: elapsed,
        size: '0 B',
        body: JSON.stringify({ error: 'Request timed out after 15 seconds' }, null, 2),
        headers: {},
      })
    }

    return Response.json({
      status: 502,
      statusText: 'Bad Gateway',
      time: elapsed,
      size: '0 B',
      body: JSON.stringify({ error: err.message || 'Request failed' }, null, 2),
      headers: {},
    })
  }
}
