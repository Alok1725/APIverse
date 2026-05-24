'use client'

import { useState, use, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import styles from './detail.module.css'

// Local catalog — icons + names for instant render before DB loads
const LOCAL_CATALOG = [
  { id:'stripe', name:'Stripe', category:'Payments', icon:'💳' },
  { id:'razorpay', name:'Razorpay', category:'Payments', icon:'💰' },
  { id:'paypal', name:'PayPal', category:'Payments', icon:'🅿️' },
  { id:'auth0', name:'Auth0', category:'Auth', icon:'🔐' },
  { id:'clerk', name:'Clerk', category:'Auth', icon:'🔑' },
  { id:'sendgrid', name:'SendGrid', category:'Email', icon:'📧' },
  { id:'resend', name:'Resend', category:'Email', icon:'✉️' },
  { id:'twilio', name:'Twilio', category:'SMS', icon:'📱' },
  { id:'openai', name:'OpenAI', category:'AI/ML', icon:'🤖' },
  { id:'anthropic', name:'Anthropic', category:'AI/ML', icon:'🧠' },
  { id:'gemini', name:'Google Gemini', category:'AI/ML', icon:'✨' },
  { id:'groq', name:'Groq', category:'AI/ML', icon:'⚡' },
  { id:'huggingface', name:'Hugging Face', category:'AI/ML', icon:'🤗' },
  { id:'googlemaps', name:'Google Maps', category:'Maps', icon:'🗺️' },
  { id:'mapbox', name:'Mapbox', category:'Maps', icon:'📍' },
  { id:'cloudinary', name:'Cloudinary', category:'Storage', icon:'☁️' },
  { id:'supabase', name:'Supabase', category:'Database', icon:'🗄️' },
  { id:'algolia', name:'Algolia', category:'Search', icon:'🔍' },
  { id:'mixpanel', name:'Mixpanel', category:'Analytics', icon:'📊' },
  { id:'github', name:'GitHub API', category:'DevTools', icon:'🐙' },
  { id:'vercel', name:'Vercel API', category:'DevTools', icon:'▲' },
  { id:'firebase', name:'Firebase', category:'Database', icon:'🔥' },
  { id:'neon', name:'Neon', category:'Database', icon:'💚' },
  { id:'posthog', name:'PostHog', category:'Analytics', icon:'🦔' },
  { id:'replicate', name:'Replicate', category:'AI/ML', icon:'🎨' },
  { id:'uploadthing', name:'Uploadthing', category:'Storage', icon:'📤' },
  { id:'netlify', name:'Netlify API', category:'DevTools', icon:'🌐' },
  { id:'amplitude', name:'Amplitude', category:'Analytics', icon:'📈' },
  { id:'cashfree', name:'Cashfree', category:'Payments', icon:'💵' },
  { id:'meilisearch', name:'Meilisearch', category:'Search', icon:'🔎' },
]

const TABS = ['Overview', 'Endpoints', 'Health', 'Reviews', 'Code Examples']
const METHOD_COLORS = { GET: '#10b981', POST: '#6366f1', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#8b5cf6' }
const STATUS_COLORS = { operational: '#10b981', degraded: '#f59e0b', down: '#ef4444', OPERATIONAL: '#10b981', DEGRADED: '#f59e0b', DOWN: '#ef4444', MAINTENANCE: '#6366f1', UNKNOWN: '#64748b' }
const CODE_LANGS = ['JavaScript', 'Python', 'cURL', 'Go']

function StarRating({ rating, size = 16 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#f59e0b' : '#334155' }}>★</span>
      ))}
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 4 }}>{rating}</span>
    </div>
  )
}

function Skeleton({ width = '100%', height = 16, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: 6,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style
    }} />
  )
}

export default function ApiDetailPage({ params }) {
  const { apiId } = use(params)

  const local = LOCAL_CATALOG.find(a => a.id === apiId) || {
    id: apiId, name: apiId, category: 'API', icon: '🔌'
  }

  // DB / AI data state
  const [dbData, setDbData]       = useState(null)
  const [reviews, setReviews]     = useState([])
  const [endpoints, setEndpoints] = useState([])
  const [codeSnippets, setCodeSnippets] = useState(null)
  const [healthData, setHealthData] = useState(null)
  const [endpointsProvider, setEndpointsProvider] = useState(null)

  // Loading flags
  const [loadingApi, setLoadingApi]           = useState(true)
  const [loadingReviews, setLoadingReviews]   = useState(true)
  const [loadingEndpoints, setLoadingEndpoints] = useState(true)
  const [loadingHealth, setLoadingHealth]     = useState(true)

  // UI state
  const [activeTab, setActiveTab]       = useState('Overview')
  const [expandedEndpoint, setExpandedEndpoint] = useState(null)
  const [codeLang, setCodeLang]         = useState('JavaScript')
  const [copied, setCopied]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [saveToast, setSaveToast]       = useState('')

  // Review form
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewTitle, setReviewTitle]   = useState('')
  const [reviewBody, setReviewBody]     = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError]   = useState('')

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('apiverse_saved_apis') || '[]')
      setSaved(stored.includes(apiId))
    } catch {}
  }, [apiId])

  // Fetch all data in parallel on mount
  useEffect(() => {
    fetch(`/api/apis/${apiId}`)
      .then(r => r.json())
      .then(d => { if (d.api) setDbData(d.api) })
      .catch(() => {})
      .finally(() => setLoadingApi(false))

    fetch(`/api/reviews?apiId=${apiId}`)
      .then(r => r.json())
      .then(d => { if (d.reviews) setReviews(d.reviews) })
      .catch(() => {})
      .finally(() => setLoadingReviews(false))

    fetch(`/api/endpoints?apiId=${apiId}`)
      .then(r => r.json())
      .then(d => {
        if (d.endpoints) setEndpoints(d.endpoints)
        if (d.codeSnippets) setCodeSnippets(d.codeSnippets)
        if (d.provider) setEndpointsProvider(d.provider)
      })
      .catch(() => {})
      .finally(() => setLoadingEndpoints(false))

    fetch(`/api/health?apiId=${apiId}`)
      .then(r => r.json())
      .then(d => setHealthData(d))
      .catch(() => {})
      .finally(() => setLoadingHealth(false))
  }, [apiId])

  function toggleSave() {
    try {
      const stored = JSON.parse(localStorage.getItem('apiverse_saved_apis') || '[]')
      let updated
      if (stored.includes(apiId)) {
        updated = stored.filter(id => id !== apiId)
        setSaved(false)
        setSaveToast('Removed from saved APIs')
      } else {
        updated = [...stored, apiId]
        setSaved(true)
        setSaveToast('Saved! View in Dashboard → Saved APIs')
      }
      localStorage.setItem('apiverse_saved_apis', JSON.stringify(updated))
      setTimeout(() => setSaveToast(''), 3000)
    } catch {}
  }

  async function submitReview(e) {
    e.preventDefault()
    if (!reviewRating || !reviewBody.trim()) return
    setSubmittingReview(true)
    setReviewError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiId, rating: reviewRating, title: reviewTitle, body: reviewBody }),
      })
      const data = await res.json()
      if (!res.ok) {
        setReviewError(data.error || 'Failed to submit review')
        return
      }
      // Refresh reviews
      const fresh = await fetch(`/api/reviews?apiId=${apiId}`).then(r => r.json())
      if (fresh.reviews) setReviews(fresh.reviews)
      setReviewRating(0)
      setReviewTitle('')
      setReviewBody('')
    } catch {
      setReviewError('Could not submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Derived display values (DB overrides local catalog)
  const displayName   = dbData?.name || local.name
  const displayDesc   = dbData?.description || 'API details not available.'
  const displayTags   = dbData?.tags || []
  const displayStatus = dbData?.currentStatus || 'OPERATIONAL'
  const displayUptime = dbData?.uptime30d ?? 99.9
  const displayLatency = dbData?.avgLatency ?? healthData?.avgLatency
  const displayCategory = dbData?.category || local.category
  const displayFeatures = dbData?.features || []
  const displayPricing  = dbData?.pricing || null
  const displayBaseUrl  = dbData?.baseUrl || null
  const displayDocsUrl  = dbData?.docsUrl || null

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  const statusColor = STATUS_COLORS[displayStatus] || '#64748b'
  const statusLabel = displayStatus.charAt(0) + displayStatus.slice(1).toLowerCase()

  // Code examples from AI-generated snippets
  const langKey = { JavaScript: 'javascript', Python: 'python', cURL: 'curl', Go: 'go' }
  const currentCode = codeSnippets
    ? (codeSnippets[langKey[codeLang]] || codeSnippets[Object.keys(codeSnippets)[0]] || '')
    : null

  function copyCode() {
    if (!currentCode) return
    navigator.clipboard.writeText(currentCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={styles.container}>
          <Link href="/discover" className={styles.breadLink}>Discover</Link>
          <span className={styles.breadSep}>›</span>
          <span className={styles.breadCurrent}>{displayName}</span>
        </div>
      </div>

      {/* Hero Header */}
      <motion.section
        className={styles.hero}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroLeft}>
              <div className={styles.apiIcon}>{local.icon}</div>
              <div className={styles.apiInfo}>
                <div className={styles.apiTopRow}>
                  <h1 className={styles.apiName}>{displayName}</h1>
                  <span className={styles.catBadge}>{displayCategory}</span>
                  <span className={styles.statusBadge} style={{ borderColor: statusColor, color: statusColor }}>
                    <span className={styles.statusDotSmall} style={{ background: statusColor }} />
                    {statusLabel}
                  </span>
                </div>
                <div className={styles.apiMeta}>
                  {avgRating > 0 ? (
                    <StarRating rating={avgRating} />
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No reviews yet</span>
                  )}
                  <span className={styles.metaSep}>·</span>
                  <span className={styles.metaItem}>{displayUptime}% uptime</span>
                  {displayLatency && (
                    <>
                      <span className={styles.metaSep}>·</span>
                      <span className={styles.metaItem}>{displayLatency}ms avg latency</span>
                    </>
                  )}
                </div>
                <p className={styles.apiDesc}>{displayDesc}</p>
                <div className={styles.tagRow}>
                  {displayTags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                </div>
              </div>
            </div>
            <div className={styles.heroActions}>
              <Link href="/playground" className={styles.playgroundBtn}>
                ▶ Test in Playground
              </Link>
              <button
                className={styles.saveBtn}
                onClick={toggleSave}
                style={saved ? { background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.4)', color: 'var(--accent-primary)' } : {}}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>

            {saveToast && (
              <motion.div
                className={styles.saveToast}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                ✓ {saveToast}
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Tab Bar */}
      <div className={styles.tabBar}>
        <div className={styles.container}>
          <div className={styles.tabs}>
            {TABS.map(tab => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        <div className={styles.container}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'Overview' && (
              <div className={styles.overviewGrid}>
                <div className={styles.overviewMain}>
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>About {displayName}</h2>
                    {loadingApi ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Skeleton height={14} />
                        <Skeleton height={14} width="85%" />
                        <Skeleton height={14} width="70%" />
                      </div>
                    ) : (
                      <p className={styles.bodyText}>{displayDesc}</p>
                    )}
                  </div>

                  {(loadingApi || displayFeatures.length > 0) && (
                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}>Key Features</h2>
                      {loadingApi ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {[...Array(5)].map((_, i) => <Skeleton key={i} height={14} width={`${70 + i * 5}%`} />)}
                        </div>
                      ) : (
                        <ul className={styles.featureList}>
                          {displayFeatures.map(f => (
                            <li key={f} className={styles.featureItem}>
                              <span className={styles.featureCheck}>✓</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Pricing</h2>
                    {loadingApi ? (
                      <div style={{ display: 'flex', gap: 16 }}>
                        {[...Array(3)].map((_, i) => <Skeleton key={i} height={120} width="30%" />)}
                      </div>
                    ) : displayPricing ? (
                      <div>
                        <p className={styles.bodyText} style={{ marginBottom: 16 }}>
                          <strong>Model:</strong> {displayPricing.model?.charAt(0).toUpperCase() + displayPricing.model?.slice(1)} &nbsp;·&nbsp;
                          {displayPricing.description}
                        </p>
                        {displayPricing.tiers?.length > 0 && (
                          <div className={styles.pricingGrid}>
                            {displayPricing.tiers.map((tier, i) => (
                              <div key={tier.name || i} className={`${styles.pricingCard} ${i === 1 ? styles.pricingPro : ''}`}>
                                {i === 1 && <div className={styles.popularBadge}>Highlighted</div>}
                                <div className={styles.tierName}>{tier.name}</div>
                                <div className={styles.tierPrice}>
                                  {tier.price != null ? (tier.price === 0 ? 'Free' : `$${tier.price}/mo`) : 'Custom'}
                                </div>
                                {tier.mau && <div className={styles.tierRequests}>{tier.mau.toLocaleString()} MAU</div>}
                                {tier.emails && <div className={styles.tierRequests}>{tier.emails}</div>}
                                {tier.features?.length > 0 && (
                                  <ul className={styles.tierFeatures}>
                                    {tier.features.map(f => <li key={f}>{f}</li>)}
                                  </ul>
                                )}
                                {displayDocsUrl && (
                                  <a
                                    href={displayDocsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${styles.tierBtn} ${i === 1 ? styles.tierBtnPro : ''}`}
                                  >
                                    View Docs ↗
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {displayDocsUrl && (
                          <a
                            href={displayDocsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.quickLink}
                            style={{ display: 'inline-flex', marginTop: 12 }}
                          >
                            View full pricing on official docs ↗
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className={styles.bodyText} style={{ color: 'var(--text-muted)' }}>
                        Pricing information not available. Visit the official documentation for details.
                      </p>
                    )}
                  </div>
                </div>

                <div className={styles.overviewSide}>
                  <div className={styles.infoCard}>
                    <h3 className={styles.infoTitle}>API Details</h3>
                    {loadingApi ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[...Array(5)].map((_, i) => <Skeleton key={i} height={14} />)}
                      </div>
                    ) : (
                      <dl className={styles.infoList}>
                        {displayBaseUrl && (
                          <div className={styles.infoRow}>
                            <dt>Base URL</dt>
                            <dd><code>{displayBaseUrl}</code></dd>
                          </div>
                        )}
                        <div className={styles.infoRow}>
                          <dt>Uptime (30d)</dt>
                          <dd style={{ color: statusColor }}>{displayUptime}%</dd>
                        </div>
                        {displayLatency && (
                          <div className={styles.infoRow}>
                            <dt>Avg Latency</dt>
                            <dd>{displayLatency}ms</dd>
                          </div>
                        )}
                        <div className={styles.infoRow}>
                          <dt>Category</dt>
                          <dd>{displayCategory}</dd>
                        </div>
                        <div className={styles.infoRow}>
                          <dt>Status</dt>
                          <dd style={{ color: statusColor }}>{statusLabel}</dd>
                        </div>
                        {dbData?.isVerified && (
                          <div className={styles.infoRow}>
                            <dt>Verified</dt>
                            <dd>✓ Verified API</dd>
                          </div>
                        )}
                      </dl>
                    )}
                  </div>

                  <div className={styles.infoCard}>
                    <h3 className={styles.infoTitle}>Quick Links</h3>
                    <div className={styles.quickLinks}>
                      {displayDocsUrl && (
                        <a href={displayDocsUrl} target="_blank" rel="noopener noreferrer" className={styles.quickLink}>
                          Official Docs <span>↗</span>
                        </a>
                      )}
                      {dbData?.websiteUrl && (
                        <a href={dbData.websiteUrl} target="_blank" rel="noopener noreferrer" className={styles.quickLink}>
                          Website <span>↗</span>
                        </a>
                      )}
                      <Link href="/playground" className={styles.quickLink}>
                        API Playground <span>→</span>
                      </Link>
                      <Link href="/status" className={styles.quickLink}>
                        Status Page <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ENDPOINTS TAB ── */}
            {activeTab === 'Endpoints' && (
              <div className={styles.endpointsSection}>
                <div className={styles.endpointsHeader}>
                  <h2 className={styles.sectionTitle}>API Endpoints</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {!loadingEndpoints && (
                      <span className={styles.endpointCount}>{endpoints.length} endpoints</span>
                    )}
                    {endpointsProvider && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        ✦ via {endpointsProvider}
                      </span>
                    )}
                  </div>
                </div>

                {loadingEndpoints ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} height={56} style={{ borderRadius: 8 }} />
                    ))}
                  </div>
                ) : endpoints.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                    <p>No endpoint documentation available yet.</p>
                  </div>
                ) : (
                  <div className={styles.endpointList}>
                    {endpoints.map((ep, i) => (
                      <div key={i} className={styles.endpointCard}>
                        <div
                          className={styles.endpointHeader}
                          onClick={() => setExpandedEndpoint(expandedEndpoint === i ? null : i)}
                        >
                          <div className={styles.endpointLeft}>
                            <span
                              className={styles.methodBadge}
                              style={{
                                background: (METHOD_COLORS[ep.method] || '#64748b') + '20',
                                color: METHOD_COLORS[ep.method] || '#64748b',
                                borderColor: (METHOD_COLORS[ep.method] || '#64748b') + '40'
                              }}
                            >
                              {ep.method}
                            </span>
                            <code className={styles.endpointPath}>{ep.path}</code>
                          </div>
                          <div className={styles.endpointRight}>
                            <span className={styles.endpointDesc}>{ep.desc}</span>
                            <span className={styles.expandIcon}>{expandedEndpoint === i ? '▲' : '▼'}</span>
                          </div>
                        </div>

                        {expandedEndpoint === i && ep.params?.length > 0 && (
                          <motion.div
                            className={styles.endpointParams}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                          >
                            <h4 className={styles.paramsTitle}>Parameters</h4>
                            <div className={styles.paramsTable}>
                              <div className={styles.paramsHead}>
                                <span>Name</span><span>Type</span><span>Required</span><span>Description</span>
                              </div>
                              {ep.params.map((p, pi) => (
                                <div key={pi} className={styles.paramRow}>
                                  <span className={styles.paramName}>{p.name}</span>
                                  <span className={styles.paramType}>{p.type || 'string'}</span>
                                  <span style={{ color: p.required ? 'var(--accent-danger)' : 'var(--text-muted)' }}>
                                    {p.required ? 'Yes' : 'No'}
                                  </span>
                                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{p.description || p.desc || ''}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {expandedEndpoint === i && (!ep.params || ep.params.length === 0) && (
                          <motion.div
                            className={styles.endpointParams}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                          >
                            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
                              No parameters for this endpoint.
                            </p>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── HEALTH TAB ── */}
            {activeTab === 'Health' && (
              <div className={styles.healthSection}>
                {loadingHealth ? (
                  <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    {[...Array(4)].map((_, i) => <Skeleton key={i} height={80} width="23%" />)}
                  </div>
                ) : (
                  <div className={styles.healthStats}>
                    {[
                      { label: 'Uptime (30d)', value: healthData?.uptime30d ? healthData.uptime30d + '%' : displayUptime + '%', color: 'var(--accent-success)' },
                      { label: 'Avg Latency', value: healthData?.avgLatency ? healthData.avgLatency + 'ms' : (displayLatency ? displayLatency + 'ms' : '—'), color: 'var(--accent-info)' },
                      { label: 'P99 Latency', value: healthData?.p99Latency ? healthData.p99Latency + 'ms' : '—', color: 'var(--accent-warning)' },
                      { label: 'Status', value: statusLabel, color: statusColor },
                    ].map(stat => (
                      <div key={stat.label} className={styles.healthStat}>
                        <div className={styles.healthStatValue} style={{ color: stat.color }}>{stat.value}</div>
                        <div className={styles.healthStatLabel}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.healthCard}>
                  <h3 className={styles.sectionTitle}>Uptime — Last 30 Days</h3>
                  <div className={styles.uptimeBarWrap}>
                    <div className={styles.uptimeBarBg}>
                      <div
                        className={styles.uptimeBarFill}
                        style={{ width: (healthData?.uptime30d || displayUptime) + '%', background: statusColor }}
                      />
                    </div>
                    <span className={styles.uptimeLabel}>{healthData?.uptime30d || displayUptime}%</span>
                  </div>
                </div>

                {(loadingHealth || healthData?.history?.length > 0) && (
                  <div className={styles.healthCard}>
                    <h3 className={styles.sectionTitle}>Status History — Last 7 Days</h3>
                    {loadingHealth ? (
                      <div style={{ display: 'flex', gap: 12 }}>
                        {[...Array(7)].map((_, i) => <Skeleton key={i} height={60} width="12%" />)}
                      </div>
                    ) : (
                      <div className={styles.historyRow}>
                        {healthData.history.map((day, i) => (
                          <div key={i} className={styles.historyItem}>
                            <div
                              className={styles.historyDot}
                              style={{ background: STATUS_COLORS[day.status] || '#10b981' }}
                              title={`${day.day}: ${day.status}`}
                            />
                            <div className={styles.historyDay}>{day.day}</div>
                            <div
                              className={styles.historyUptime}
                              style={{ color: STATUS_COLORS[day.status] || '#10b981' }}
                            >
                              {day.latency ? `${day.latency}ms` : '—'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.healthCard}>
                  <h3 className={styles.sectionTitle}>Recent Checks</h3>
                  {loadingHealth ? (
                    <Skeleton height={80} />
                  ) : healthData?.logs?.length > 0 ? (
                    <div className={styles.incidentList}>
                      {healthData.logs.map((log, i) => (
                        <div key={i} className={styles.incident}>
                          <span className={styles.incidentDate}>
                            {new Date(log.checkedAt).toLocaleString()}
                          </span>
                          <span
                            className={styles.incidentBadge}
                            style={{
                              color: STATUS_COLORS[log.status] || '#10b981',
                              background: (STATUS_COLORS[log.status] || '#10b981') + '18'
                            }}
                          >
                            {log.status}
                          </span>
                          <span className={styles.incidentDesc}>
                            {log.statusCode && `HTTP ${log.statusCode} · `}
                            {log.latency ? `${log.latency}ms` : 'No latency recorded'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No health check records yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── REVIEWS TAB ── */}
            {activeTab === 'Reviews' && (
              <div className={styles.reviewsSection}>
                {/* Summary */}
                <div className={styles.reviewsSummary}>
                  <div className={styles.reviewsScore}>
                    {loadingReviews ? (
                      <Skeleton height={48} width={60} style={{ borderRadius: 8 }} />
                    ) : (
                      <>
                        <div className={styles.bigScore}>{avgRating || '—'}</div>
                        {avgRating > 0 && <StarRating rating={avgRating} size={20} />}
                        <div className={styles.reviewsTotal}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
                      </>
                    )}
                  </div>
                  <div className={styles.ratingBreakdown}>
                    {[5,4,3,2,1].map(n => {
                      const count = reviews.filter(r => r.rating === n).length
                      const pct = reviews.length ? Math.round(count / reviews.length * 100) : 0
                      return (
                        <div key={n} className={styles.ratingRow}>
                          <span className={styles.ratingRowNum}>{n} ★</span>
                          <div className={styles.ratingBar}>
                            <div className={styles.ratingBarFill} style={{ width: pct + '%' }} />
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 24 }}>{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Review list */}
                {loadingReviews ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[...Array(3)].map((_, i) => <Skeleton key={i} height={120} style={{ borderRadius: 12 }} />)}
                  </div>
                ) : (
                  <div className={styles.reviewList}>
                    {reviews.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
                        No reviews yet. Be the first to review {displayName}!
                      </p>
                    )}
                    {reviews.map((r, i) => (
                      <motion.div
                        key={r.id || i}
                        className={styles.reviewCard}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <div className={styles.reviewTop}>
                          <div className={styles.reviewAuthorWrap}>
                            <div className={styles.reviewAvatar}>
                              {(r.user?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className={styles.reviewAuthor}>{r.user?.name || 'Anonymous'}</div>
                              <div className={styles.reviewDate}>
                                {new Date(r.createdAt).toLocaleDateString()}
                                {r.isVerified && <span style={{ color: '#10b981', marginLeft: 8, fontSize: 11 }}>✓ Verified</span>}
                              </div>
                            </div>
                          </div>
                          <StarRating rating={r.rating} />
                        </div>
                        {r.title && <h4 className={styles.reviewTitle}>{r.title}</h4>}
                        <p className={styles.reviewBody}>{r.body}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Write a review */}
                <div className={styles.reviewCard} style={{ marginTop: 24, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: 16 }}>Write a Review</h3>
                  <form onSubmit={submitReview}>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Rating</label>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1,2,3,4,5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setReviewRating(n)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                              fontSize: 24, color: n <= reviewRating ? '#f59e0b' : '#334155',
                              transition: 'color 0.15s'
                            }}
                          >★</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Title (optional)</label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={e => setReviewTitle(e.target.value)}
                        placeholder="Summarize your experience"
                        style={{
                          width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 14,
                          background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Review</label>
                      <textarea
                        value={reviewBody}
                        onChange={e => setReviewBody(e.target.value)}
                        placeholder="Share your experience with this API…"
                        rows={4}
                        required
                        style={{
                          width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 14,
                          background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)', outline: 'none', resize: 'vertical', boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    {reviewError && (
                      <p style={{ color: 'var(--accent-danger)', fontSize: 13, marginBottom: 12 }}>{reviewError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={submittingReview || !reviewRating || !reviewBody.trim()}
                      style={{
                        padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        background: 'var(--accent-primary)', color: '#fff', border: 'none',
                        opacity: (submittingReview || !reviewRating || !reviewBody.trim()) ? 0.5 : 1,
                        transition: 'opacity 0.15s'
                      }}
                    >
                      {submittingReview ? 'Submitting…' : 'Submit Review'}
                    </button>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                      You must be signed in to submit a review.
                    </p>
                  </form>
                </div>
              </div>
            )}

            {/* ── CODE EXAMPLES TAB ── */}
            {activeTab === 'Code Examples' && (
              <div className={styles.codeSection}>
                <div className={styles.codeLangTabs}>
                  {CODE_LANGS.map(lang => (
                    <button
                      key={lang}
                      className={`${styles.codeLangTab} ${codeLang === lang ? styles.codeLangActive : ''}`}
                      onClick={() => setCodeLang(lang)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                {loadingEndpoints ? (
                  <Skeleton height={240} style={{ borderRadius: 12, marginTop: 12 }} />
                ) : currentCode ? (
                  <>
                    <div className={styles.codeBlock}>
                      <div className={styles.codeBlockHeader}>
                        <span className={styles.codeBlockLang}>{codeLang}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {endpointsProvider && (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              ✦ via {endpointsProvider}
                            </span>
                          )}
                          <button className={styles.copyBtn} onClick={copyCode}>
                            {copied ? '✓ Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <pre className={styles.codePre}>
                        <code>{currentCode}</code>
                      </pre>
                    </div>
                    <div className={styles.codeNote}>
                      <span>💡</span>
                      Replace <code>YOUR_API_KEY</code> with your actual API key from the {displayName} dashboard.
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
                    <p>Code examples will appear here once endpoints are loaded.</p>
                    <p style={{ fontSize: 13 }}>Try visiting the Endpoints tab first.</p>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  )
}
