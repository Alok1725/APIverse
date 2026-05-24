'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import styles from './dashboard.module.css'

const ICON_MAP = {
  stripe:'💳', razorpay:'💰', paypal:'🅿️', auth0:'🔐', clerk:'🔑',
  sendgrid:'📧', resend:'✉️', twilio:'📱', openai:'🤖', anthropic:'🧠',
  gemini:'✨', groq:'⚡', huggingface:'🤗', googlemaps:'🗺️', mapbox:'📍',
  cloudinary:'☁️', supabase:'🗄️', algolia:'🔍', mixpanel:'📊', github:'🐙',
  vercel:'▲', firebase:'🔥', neon:'💚', posthog:'🦔', replicate:'🎨',
  uploadthing:'📤', netlify:'🌐', amplitude:'📈', cashfree:'💵', meilisearch:'🔎',
}

const STATUS_COLORS = { operational: '#10b981', degraded: '#f59e0b', down: '#ef4444', unknown: '#64748b' }

function Skeleton({ width = '100%', height = 16, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: 6,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style,
    }} />
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated'
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Developer'

  // DB data (for authenticated users)
  const [dbData, setDbData]   = useState(null)
  const [loadingDb, setLoadingDb] = useState(true)

  // Saved APIs from localStorage
  const [localSavedIds, setLocalSavedIds] = useState([])

  // Observatory data for cross-referencing saved API status
  const [obsApis, setObsApis] = useState({})

  useEffect(() => {
    // Read saved API IDs from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('apiverse_saved_apis') || '[]')
      setLocalSavedIds(stored)
    } catch {}

    // Fetch DB data (reviews, search history, DB-saved APIs)
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => setDbData(d))
      .catch(() => {})
      .finally(() => setLoadingDb(false))

    // Fetch observatory data for real-time status of saved APIs
    fetch('/api/observatory')
      .then(r => r.json())
      .then(d => {
        const map = {}
        for (const api of (d.apis || [])) map[api.id] = api
        setObsApis(map)
      })
      .catch(() => {})
  }, [])

  // Saved APIs: prefer DB saved (authenticated), fall back to localStorage
  const savedApis = (() => {
    const dbSaved = dbData?.savedApis || []
    if (dbSaved.length > 0) return dbSaved

    // Build from localStorage IDs using observatory data
    return localSavedIds.map(id => {
      const obs = obsApis[id]
      return {
        id,
        name: obs?.name || id,
        category: obs?.category || '',
        status: obs?.status || 'unknown',
        uptime: obs?.uptime || null,
      }
    })
  })()

  // Stats — use real numbers where available, show 0 honestly where not
  const reviewCount  = dbData?.reviewCount  ?? 0
  const savedCount   = savedApis.length
  const searchCount  = dbData?.recentSearches?.length ?? 0
  const recentSearches = dbData?.recentSearches || []

  const stats = [
    {
      label: 'Saved APIs',
      value: loadingDb ? '…' : savedCount,
      icon: '🔖',
      color: 'var(--accent-primary)',
      note: 'from your saved list',
    },
    {
      label: 'Reviews Written',
      value: loadingDb ? '…' : reviewCount,
      icon: '⭐',
      color: 'var(--accent-warning)',
      note: isLoggedIn ? 'across all APIs' : 'sign in to track',
    },
    {
      label: 'Recent Searches',
      value: loadingDb ? '…' : searchCount,
      icon: '🔍',
      color: 'var(--accent-info)',
      note: isLoggedIn ? 'in search history' : 'sign in to track',
    },
    {
      label: 'Subscriptions',
      value: 0,
      icon: '🔔',
      color: 'var(--accent-success)',
      note: 'alerts configured',
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Auth Banner */}
        {status !== 'loading' && !isLoggedIn && (
          <motion.div
            className={styles.authBanner}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className={styles.authBannerIcon}>🔐</span>
            <span className={styles.authBannerText}>
              Sign in to sync your data, track search history, and write reviews.
            </span>
            <Link href="/signin" className={styles.signInBtn}>Sign In</Link>
            <Link href="/signup" className={styles.signUpBtn}>Create Account</Link>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          className={styles.pageHeader}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <div className={styles.greeting}>{getGreeting()} 👋</div>
            <h1 className={styles.pageTitle}>Welcome back, {userName}</h1>
            <p className={styles.pageSubtitle}>
              Your saved APIs, search history, and activity at a glance.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/discover" className={styles.discoverBtn}>Explore APIs →</Link>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ background: stat.color + '15' }}>
                  <span className={styles.statIcon}>{stat.icon}</span>
                </div>
                <div className={styles.statChange} style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {stat.note}
                </div>
              </div>
              <div className={styles.statValue} style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className={styles.mainGrid}>

          {/* Left Column */}
          <div className={styles.leftCol}>

            {/* Saved APIs */}
            <motion.div
              className={styles.widget}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.widgetHeader}>
                <h2 className={styles.widgetTitle}>Saved APIs</h2>
                <Link href="/discover" className={styles.widgetLink}>Browse More →</Link>
              </div>

              {loadingDb ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...Array(3)].map((_, i) => <Skeleton key={i} height={64} style={{ borderRadius: 10 }} />)}
                </div>
              ) : savedApis.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔖</div>
                  <p style={{ fontSize: 14, margin: 0 }}>No saved APIs yet.</p>
                  <p style={{ fontSize: 13, margin: '4px 0 0', color: 'var(--text-muted)' }}>
                    Click the Save button on any API detail page.
                  </p>
                  <Link href="/discover" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: 'var(--accent-primary)' }}>
                    Browse APIs →
                  </Link>
                </div>
              ) : (
                <div className={styles.savedGrid}>
                  {savedApis.map((api) => {
                    const icon = ICON_MAP[api.id] || '🔌'
                    const statusColor = STATUS_COLORS[api.status] || '#64748b'
                    return (
                      <Link key={api.id} href={`/discover/${api.id}`} className={styles.savedCard}>
                        <div className={styles.savedCardTop}>
                          <span className={styles.savedIcon}>{icon}</span>
                          {api.uptime != null && (
                            <span
                              className={styles.savedStatus}
                              style={{ background: statusColor + '20', color: statusColor }}
                            >
                              <span className={styles.savedDot} style={{ background: statusColor }} />
                              {api.uptime}%
                            </span>
                          )}
                        </div>
                        <div className={styles.savedName}>{api.name}</div>
                        <div className={styles.savedCategory}>{api.category}</div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* Recent Searches */}
            <motion.div
              className={styles.widget}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <div className={styles.widgetHeader}>
                <h2 className={styles.widgetTitle}>Recent Searches</h2>
              </div>

              {loadingDb ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...Array(3)].map((_, i) => <Skeleton key={i} height={40} style={{ borderRadius: 8 }} />)}
                </div>
              ) : recentSearches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: 14, margin: 0 }}>
                    {isLoggedIn
                      ? 'No searches tracked yet. Try searching for an API.'
                      : 'Sign in to track your search history.'}
                  </p>
                  {!isLoggedIn && (
                    <Link href="/discover" style={{ display: 'inline-block', marginTop: 10, fontSize: 13, color: 'var(--accent-primary)' }}>
                      Discover APIs →
                    </Link>
                  )}
                </div>
              ) : (
                <div className={styles.searchList}>
                  {recentSearches.map((s, i) => (
                    <motion.div
                      key={i}
                      className={styles.searchItem}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className={styles.searchIcon}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                      </div>
                      <div className={styles.searchQuery}>"{s.query}"</div>
                      <div className={styles.searchMeta}>
                        <span>{s.results} result{s.results !== 1 ? 's' : ''}</span>
                        <span>{timeAgo(s.time)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>

            {/* Quick Actions */}
            <motion.div
              className={styles.widget}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className={styles.widgetHeader}>
                <h2 className={styles.widgetTitle}>Quick Actions</h2>
              </div>
              <div className={styles.quickActions}>
                {[
                  { icon: '🔍', label: 'Discover APIs',      href: '/discover',     color: 'var(--accent-primary)' },
                  { icon: '▶️', label: 'Test in Playground', href: '/playground',   color: 'var(--accent-success)' },
                  { icon: '📡', label: 'API Observatory',    href: '/observatory',  color: 'var(--accent-info)' },
                  { icon: '⚡', label: 'Change Radar',       href: '/radar',        color: 'var(--accent-warning)' },
                  { icon: '🔗', label: 'Compose Pipeline',   href: '/compose',      color: 'var(--accent-secondary)' },
                  { icon: '📊', label: 'System Status',      href: '/status',       color: 'var(--accent-success)' },
                ].map(action => (
                  <Link key={action.label} href={action.href} className={styles.quickAction}>
                    <span
                      className={styles.quickActionIcon}
                      style={{ background: action.color + '15', color: action.color }}
                    >
                      {action.icon}
                    </span>
                    <span className={styles.quickActionLabel}>{action.label}</span>
                    <span className={styles.quickActionArrow}>→</span>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Account summary */}
            <motion.div
              className={styles.widget}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className={styles.widgetHeader}>
                <h2 className={styles.widgetTitle}>Account</h2>
              </div>
              {status === 'loading' ? (
                <Skeleton height={60} />
              ) : isLoggedIn ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'var(--accent-primary)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff',
                      flexShrink: 0,
                    }}>
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{userName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{session.user.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-primary)' }}>{savedCount}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Saved</div>
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-warning)' }}>{reviewCount}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Reviews</div>
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-info)' }}>{searchCount}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Searches</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: 14, marginBottom: 12 }}>Sign in to see your account stats.</p>
                  <Link href="/signin" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--accent-primary)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                    Sign In
                  </Link>
                </div>
              )}
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  )
}
