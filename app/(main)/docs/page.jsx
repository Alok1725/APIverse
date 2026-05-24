'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import styles from './docs.module.css'

const steps = [
  { num: 1, title: 'Explore APIs', desc: 'Search the catalog using natural language or filters. Find any API by category, provider, or feature.' },
  { num: 2, title: 'Test in Playground', desc: 'Fire live requests in the browser with full Monaco Editor support. Generate code snippets automatically.' },
  { num: 3, title: 'Monitor Health', desc: 'Add APIs to your watchlist and track uptime, latency, and error rates over time.' },
  { num: 4, title: 'Set Up Alerts', desc: 'Configure webhooks or email notifications for downtime, breaking changes, and performance regressions.' },
]

const docSections = [
  { icon: '🚀', title: 'Getting Started', desc: 'Quick setup guide to get APIverse running locally or use the hosted version in minutes.', link: '#' },
  { icon: '📖', title: 'API Reference', desc: 'Full reference for all REST endpoints exposed by the APIverse backend, with request/response schemas.', link: '/docs/api' },
  { icon: '🤖', title: 'AI Gateway', desc: 'How to use the multi-provider AI gateway — Gemini, Groq, and Ollama — for API summarization and code generation.', link: '#' },
  { icon: '🔔', title: 'Webhooks', desc: 'Set up outbound webhooks for health events, breaking change detection, and status updates.', link: '#' },
  { icon: '🧰', title: 'SDKs', desc: 'Official JavaScript/TypeScript client and community-maintained SDKs for Python, Go, and Ruby.', link: '#' },
  { icon: '🔐', title: 'Authentication', desc: 'OAuth2, API key management, rate limits, and scopes. Secure your APIverse integration.', link: '#' },
]

const guides = [
  { icon: '🔍', title: 'Your first API search — a complete walkthrough', href: '/discover' },
  { icon: '💡', title: 'Understanding API health scores and what they mean', href: '/observatory' },
  { icon: '📊', title: 'Setting up uptime monitoring for a production API', href: '/radar' },
  { icon: '🛠️', title: 'Using the AI Playground to generate integration code', href: '/playground' },
]

export default function DocsPage() {
  const [query, setQuery]     = useState('')
  const [catalog, setCatalog] = useState([])

  useEffect(() => {
    fetch('/api/discover')
      .then(r => r.json())
      .then(d => setCatalog(d.apis || []))
      .catch(() => {})
  }, [])

  const q = query.trim().toLowerCase()

  // Search the live API catalog
  const apiResults = useMemo(() => {
    if (!q) return []
    return catalog.filter(api =>
      api.name.toLowerCase().includes(q) ||
      api.category.toLowerCase().includes(q) ||
      api.desc.toLowerCase().includes(q) ||
      api.tags.some(t => t.toLowerCase().includes(q))
    )
  }, [q, catalog])

  // Filter platform docs sections and guides
  const filteredSections = useMemo(() => {
    if (!q) return docSections
    return docSections.filter(d => d.title.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q))
  }, [q])

  const filteredGuides = useMemo(() => {
    if (!q) return guides
    return guides.filter(g => g.title.toLowerCase().includes(q))
  }, [q])

  const filteredSteps = useMemo(() => {
    if (!q) return steps
    return steps.filter(s => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
  }, [q])

  const searching = q.length > 0
  const totalResults = apiResults.length + filteredSections.length + filteredGuides.length + filteredSteps.length

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroLabel}>Documentation</div>
        <h1 className={styles.heroHeading}>Everything you need to build</h1>
        <p className={styles.heroSubtitle}>
          Search APIs by name, or look up platform guides and references.
        </p>
        <div className={styles.searchBar}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder='Search "Stripe", "authentication", "webhooks"…'
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className={styles.searchClear} onClick={() => setQuery('')}>✕</button>
          )}
        </div>
        {searching && (
          <p className={styles.searchHint}>
            {totalResults === 0
              ? `No results for "${query}"`
              : `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`}
          </p>
        )}
      </section>

      {/* API search results — shown only when there's a query that matches catalog APIs */}
      {searching && apiResults.length > 0 && (
        <section className={styles.apiResultsSection}>
          <div className={styles.sectionHeader}>
            <h2>API Documentation</h2>
            <p>{apiResults.length} API{apiResults.length !== 1 ? 's' : ''} found — click to view endpoints, health, reviews and code examples</p>
          </div>
          <div className={styles.apiResultsGrid}>
            {apiResults.map(api => (
              <Link key={api.id} href={`/discover/${api.id}`} className={styles.apiResultCard}>
                <div className={styles.apiResultLeft}>
                  <span className={styles.apiResultIcon}>{api.icon}</span>
                  <div>
                    <div className={styles.apiResultName}>{api.name}</div>
                    <div className={styles.apiResultDesc}>{api.desc}</div>
                    <div className={styles.apiResultTags}>
                      {api.tags.map(t => <span key={t} className={styles.apiResultTag}>{t}</span>)}
                    </div>
                  </div>
                </div>
                <div className={styles.apiResultMeta}>
                  <span className={styles.apiResultCategory}>{api.category.charAt(0).toUpperCase() + api.category.slice(1)}</span>
                  <span className={styles.apiResultArrow}>View docs →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Show message if searched but no API results and no doc results */}
      {searching && totalResults === 0 && (
        <section className={styles.noResults}>
          <div className={styles.noResultsIcon}>🔍</div>
          <h3>No results for &quot;{query}&quot;</h3>
          <p>Try searching for an API name like &quot;Stripe&quot;, &quot;OpenAI&quot;, or a topic like &quot;webhooks&quot; or &quot;authentication&quot;.</p>
          <Link href="/discover" className={styles.browseLink}>Browse all APIs →</Link>
        </section>
      )}

      {/* Quick Start — hidden when searching with no step matches */}
      {(!searching || filteredSteps.length > 0) && (
        <section className={styles.quickStart}>
          <div className={styles.sectionHeader}>
            <h2>Quick start</h2>
            <p>Go from zero to your first monitored API in under 5 minutes</p>
          </div>
          <div className={styles.stepsGrid}>
            {filteredSteps.map((s) => (
              <div key={s.num} className={styles.stepCard}>
                <div className={styles.stepNum}>{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Docs sections — hidden when searching with no section matches */}
      {(!searching || filteredSections.length > 0) && (
        <section className={styles.docsGrid}>
          <div className={styles.docsGridInner}>
            <div className={styles.sectionHeader}>
              <h2>Documentation sections</h2>
              <p>Dive deeper into specific areas of the platform</p>
            </div>
            <div className={styles.grid}>
              {filteredSections.map((d) => (
                <a key={d.title} href={d.link} className={styles.docCard}>
                  <div className={styles.docIcon}>{d.icon}</div>
                  <h3>{d.title}</h3>
                  <p>{d.desc}</p>
                  <span className={styles.readMore}>Read more →</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular guides — hidden when searching with no guide matches */}
      {(!searching || filteredGuides.length > 0) && (
        <section className={styles.guides}>
          <div className={styles.sectionHeader}>
            <h2>Popular guides</h2>
            <p>Step-by-step walkthroughs for common workflows</p>
          </div>
          <div className={styles.guideList}>
            {filteredGuides.map((g) => (
              <Link key={g.title} href={g.href} className={styles.guideItem}>
                <span className={styles.guideIcon}>{g.icon}</span>
                <span className={styles.guideTitle}>{g.title}</span>
                <span className={styles.guideArrow}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Coming soon note — hide while searching */}
      {!searching && (
        <section className={styles.comingSoon}>
          <div className={styles.comingSoonInner}>
            <p>
              <strong>Full docs coming soon.</strong> The documentation site is actively being built.
              In the meantime, explore the platform directly — most features are self-explanatory,
              and the in-app tooltips will guide you through each section.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
