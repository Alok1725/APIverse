import Link from 'next/link'
import styles from './api-ref.module.css'

export const metadata = {
  title: 'API Reference — APIverse',
  description: 'Complete REST API reference for the APIverse platform — search, proxy, compose, and health endpoints.',
}

const ENDPOINTS = [
  {
    tag: 'Search',
    color: '#6366f1',
    routes: [
      {
        method: 'POST',
        path: '/api/search',
        summary: 'AI-powered semantic search over the API catalog',
        desc: 'Accepts a natural-language query and returns a ranked list of matching APIs. Internally routes through Gemini → Groq → Ollama → Mock for the best available semantic ranking.',
        request: {
          query: { type: 'string', required: false, desc: 'Natural-language search query. Omit to return the full catalog.' },
          category: { type: 'string', required: false, desc: 'Optional category filter (e.g. "Payments", "AI/ML"). Defaults to "All".' },
        },
        response: `{
  "results": [ { "id": "stripe", "name": "Stripe", "category": "Payments", ... } ],
  "provider": "gemini"   // AI provider used, or null if no query
}`,
        errors: ['400 — invalid JSON body'],
      },
    ],
  },
  {
    tag: 'Proxy',
    color: '#10b981',
    routes: [
      {
        method: 'POST',
        path: '/api/proxy',
        summary: 'Server-side HTTP proxy for the Playground',
        desc: 'Proxies arbitrary HTTP requests server-side to eliminate CORS restrictions. API keys are sent directly to the target and are never logged. Requests to private/internal hosts are blocked. Response body is capped at 512 KB.',
        request: {
          method: { type: 'string', required: true, desc: 'HTTP method: GET, POST, PUT, PATCH, DELETE, HEAD.' },
          url: { type: 'string', required: true, desc: 'Target URL (must be https:// or http://).' },
          headers: { type: 'object', required: false, desc: 'Key-value map of request headers.' },
          body: { type: 'string', required: false, desc: 'Raw request body string (JSON, form data, etc.).' },
          auth: { type: 'object', required: false, desc: '{ type: "bearer"|"apikey"|"basic"|"none", value: string }' },
        },
        response: `{
  "status": 200,
  "statusText": "OK",
  "time": 142,          // round-trip ms
  "size": "2.4 KB",
  "body": "{ ... }",   // pretty-printed if JSON
  "headers": { "Content-Type": "application/json", ... }
}`,
        errors: [
          '400 — missing or invalid URL',
          '403 — private/internal host blocked',
          '408 — request timed out (>15s)',
          '502 — target unreachable or returned an error',
        ],
      },
    ],
  },
  {
    tag: 'Compose',
    color: '#8b5cf6',
    routes: [
      {
        method: 'POST',
        path: '/api/compose',
        summary: 'AI workflow pipeline generation',
        desc: 'Accepts a plain-English workflow description and returns a structured multi-step API pipeline with icons, colors, and action descriptions. Uses the AI gateway (Gemini → Groq → Ollama → Mock).',
        request: {
          description: { type: 'string', required: true, desc: 'Natural-language workflow description, e.g. "user signup flow with email and analytics".' },
        },
        response: `{
  "steps": [
    { "icon": "🔐", "api": "Auth0", "action": "Verify Session", "desc": "...", "color": "#6366f1" },
    { "icon": "💳", "api": "Stripe", "action": "Create Customer", "desc": "...", "color": "#10b981" }
  ],
  "name": "User Signup Pipeline",
  "description": "...",
  "provider": "gemini"
}`,
        errors: [
          '400 — description missing or empty',
          '422 — AI returned an unusable pipeline (try a more specific description)',
          '500 — all AI providers failed',
        ],
      },
    ],
  },
  {
    tag: 'Auth',
    color: '#f59e0b',
    routes: [
      {
        method: 'GET / POST',
        path: '/api/auth/[...nextauth]',
        summary: 'NextAuth.js authentication handler',
        desc: 'Handles all auth flows — credentials login, GitHub OAuth, and Google OAuth. Managed by NextAuth v5. Configure providers via GITHUB_CLIENT_ID, GOOGLE_CLIENT_ID environment variables.',
        request: {},
        response: `// Session object (JWT strategy)
{
  "user": {
    "id": "demo-you@example.com",
    "name": "you",
    "email": "you@example.com",
    "image": null
  }
}`,
        errors: [
          '401 — invalid credentials',
          '302 — OAuth redirect flows',
        ],
      },
    ],
  },
]

const METHOD_COLORS = {
  GET: '#10b981',
  POST: '#6366f1',
  PUT: '#f59e0b',
  DELETE: '#ef4444',
  PATCH: '#8b5cf6',
  'GET / POST': '#6366f1',
}

export default function ApiReferencePage() {
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/docs" className={styles.breadLink}>Docs</Link>
        <span className={styles.breadSep}>›</span>
        <span className={styles.breadCurrent}>API Reference</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroLabel}>REST API</div>
        <h1 className={styles.heroTitle}>API Reference</h1>
        <p className={styles.heroSub}>
          All server-side endpoints exposed by the APIverse platform.
          Base URL: <code className={styles.inlineCode}>https://apiverse.dev</code>
        </p>

        <div className={styles.authNote}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          All endpoints are unauthenticated unless noted. Rate limiting applies in production.
        </div>
      </section>

      {/* Endpoints */}
      <div className={styles.content}>
        {ENDPOINTS.map((group) => (
          <section key={group.tag} className={styles.group}>
            <div className={styles.groupHeader}>
              <span className={styles.groupTag} style={{ background: group.color + '18', color: group.color, borderColor: group.color + '30' }}>
                {group.tag}
              </span>
            </div>

            {group.routes.map((route) => {
              const methodColor = METHOD_COLORS[route.method] || '#6366f1'
              return (
                <div key={route.path} className={styles.routeCard}>
                  <div className={styles.routeHeader}>
                    <div className={styles.routeLeft}>
                      <span
                        className={styles.methodBadge}
                        style={{ background: methodColor + '18', color: methodColor, borderColor: methodColor + '30' }}
                      >
                        {route.method}
                      </span>
                      <code className={styles.routePath}>{route.path}</code>
                    </div>
                    <p className={styles.routeSummary}>{route.summary}</p>
                  </div>

                  <p className={styles.routeDesc}>{route.desc}</p>

                  {Object.keys(route.request).length > 0 && (
                    <div className={styles.section}>
                      <h4 className={styles.sectionTitle}>Request body</h4>
                      <div className={styles.paramsTable}>
                        <div className={styles.paramsHead}>
                          <span>Field</span><span>Type</span><span>Required</span><span>Description</span>
                        </div>
                        {Object.entries(route.request).map(([name, info]) => (
                          <div key={name} className={styles.paramRow}>
                            <code className={styles.paramName}>{name}</code>
                            <span className={styles.paramType}>{info.type}</span>
                            <span style={{ color: info.required ? '#ef4444' : 'var(--text-muted)', fontSize: 12 }}>
                              {info.required ? 'required' : 'optional'}
                            </span>
                            <span className={styles.paramDesc}>{info.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Response</h4>
                    <pre className={styles.codeBlock}><code>{route.response}</code></pre>
                  </div>

                  {route.errors.length > 0 && (
                    <div className={styles.section}>
                      <h4 className={styles.sectionTitle}>Error codes</h4>
                      <ul className={styles.errorList}>
                        {route.errors.map((e) => (
                          <li key={e} className={styles.errorItem}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </section>
        ))}
      </div>
    </div>
  )
}
