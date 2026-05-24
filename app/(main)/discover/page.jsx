'use client'

import { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import styles from './discover.module.css'

const CATEGORIES = [
  { value: 'all',          label: 'All' },
  { value: 'ai',           label: 'AI & ML' },
  { value: 'payments',     label: 'Payments' },
  { value: 'devtools',     label: 'Dev Tools' },
  { value: 'auth',         label: 'Auth' },
  { value: 'social',       label: 'Social' },
  { value: 'database',     label: 'Database' },
  { value: 'analytics',    label: 'Analytics' },
  { value: 'email',        label: 'Email' },
  { value: 'storage',      label: 'Storage' },
  { value: 'ecommerce',    label: 'E-Commerce' },
  { value: 'messaging',    label: 'Messaging' },
  { value: 'search',       label: 'Search' },
  { value: 'observability',label: 'Observability' },
  { value: 'finance',      label: 'Finance' },
  { value: 'cms',          label: 'CMS' },
  { value: 'media',        label: 'Media' },
  { value: 'maps',         label: 'Maps' },
  { value: 'translation',  label: 'Translation' },
  { value: 'weather',      label: 'Weather & Geo' },
]

const SORT_OPTIONS = ['Featured', 'Top Rated', 'A–Z', 'Z–A']

function Skeleton() {
  return (
    <div style={{
      borderRadius: 16, height: 260,
      background: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

function StarRating({ rating }) {
  const full = Math.floor(rating)
  const partial = rating - full
  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={styles.star} style={{
          color: i <= full ? '#f59e0b' : i === full + 1 && partial > 0 ? '#f59e0b' : '#334155',
          opacity: i === full + 1 && partial > 0 ? partial + 0.2 : 1
        }}>★</span>
      ))}
      <span className={styles.ratingNum}>{rating}</span>
    </div>
  )
}

function StatusDot({ status }) {
  const colors = { operational: '#10b981', degraded: '#f59e0b', down: '#ef4444' }
  return (
    <span className={styles.statusDot} style={{ background: colors[status] || '#64748b' }}>
      <span className={styles.statusPulse} style={{ background: colors[status] || '#64748b' }} />
    </span>
  )
}

function ApiCard({ api, index }) {
  const catLabel = CATEGORIES.find(c => c.value === api.category)?.label || api.category

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 9) * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardIcon}>{api.icon}</div>
        <div className={styles.cardMeta}>
          <span className={styles.categoryBadge}>{catLabel}</span>
          <div className={styles.statusRow}>
            <StatusDot status={api.status} />
            <span className={styles.uptimeText}>{api.uptime}% uptime</span>
          </div>
        </div>
      </div>

      <h3 className={styles.cardName}>{api.name}</h3>
      <p className={styles.cardDesc}>{api.desc}</p>

      <StarRating rating={api.rating} />

      <div className={styles.tags}>
        {api.tags.map(tag => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>

      <Link href={`/discover/${api.id}`} className={styles.viewBtn}>
        View Details <span>→</span>
      </Link>
    </motion.div>
  )
}

function DiscoverContent() {
  const searchParams = useSearchParams()
  const [allApis, setAllApis]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState(searchParams.get('q') || '')
  const [category, setCategory]     = useState(searchParams.get('category') || 'all')
  const [sort, setSort]             = useState('Featured')
  const [aiResults, setAiResults]   = useState(null)
  const [aiProvider, setAiProvider] = useState(null)
  const [aiLoading, setAiLoading]   = useState(false)
  const [visibleCount, setVisibleCount] = useState(9)
  const searchDebounce              = useRef(null)

  // Load all APIs from DB on mount
  useEffect(() => {
    fetch('/api/discover')
      .then(r => r.json())
      .then(d => setAllApis(d.apis || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Keep in sync when URL params change
  useEffect(() => {
    const q   = searchParams.get('q') || ''
    const cat = searchParams.get('category') || 'all'
    setSearch(q)
    setCategory(cat)
    setVisibleCount(9)
  }, [searchParams])

  // Debounced AI search
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current)

    if (!search.trim()) {
      setAiResults(null)
      setAiProvider(null)
      return
    }

    setAiLoading(true)
    searchDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: search, category }),
        })
        const data = await res.json()
        if (data.results) {
          setAiResults(data.results)
          setAiProvider(data.provider)
        }
      } catch {
        setAiResults(null)
      } finally {
        setAiLoading(false)
      }
    }, 350)

    return () => clearTimeout(searchDebounce.current)
  }, [search, category])

  const filtered = useMemo(() => {
    let result = aiResults ?? allApis

    if (!aiResults) {
      if (category !== 'all') result = result.filter(a => a.category === category)
      if (search.trim()) {
        const q = search.toLowerCase()
        result = result.filter(a =>
          a.name.toLowerCase().includes(q) ||
          a.desc.toLowerCase().includes(q) ||
          a.tags.some(t => t.toLowerCase().includes(q))
        )
      }
    } else if (category !== 'all') {
      result = result.filter(a => a.category === category)
    }

    if (sort === 'Top Rated') return [...result].sort((a, b) => b.rating - a.rating)
    if (sort === 'A–Z')       return [...result].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'Z–A')       return [...result].sort((a, b) => b.name.localeCompare(a.name))
    // Featured: isFeatured first, then by name
    return [...result].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || a.name.localeCompare(b.name))
  }, [search, category, sort, aiResults, allApis])

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroInner}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.heroLabel}>
            <span className={styles.aiDot} />
            AI-Powered Discovery
          </div>
          <h1 className={styles.heroTitle}>Discover <span className={styles.heroGradient}>APIs</span></h1>
          <p className={styles.heroSub}>
            {loading ? 'Loading catalog…' : `Browse ${allApis.length} APIs`} with real-time health monitoring, ratings, and AI-powered search.
          </p>

          <div className={styles.searchWrap}>
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Search APIs by name, category, or feature..."
                value={search}
                onChange={e => { setSearch(e.target.value); setVisibleCount(9) }}
              />
              <span className={styles.aiBadge}>
                <span>✦</span> AI Search
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Controls */}
      <section className={styles.controls}>
        <div className={styles.container}>
          <div className={styles.controlsRow}>
            <div className={styles.categoryPills}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  className={`${styles.pill} ${category === cat.value ? styles.pillActive : ''}`}
                  onClick={() => { setCategory(cat.value); setVisibleCount(9) }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className={styles.sortWrap}>
              <label className={styles.sortLabel}>Sort by</label>
              <select
                className={styles.sortSelect}
                value={sort}
                onChange={e => { setSort(e.target.value); setVisibleCount(9) }}
              >
                {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.resultsInfo}>
            <span className={styles.resultCount}>
              {aiLoading || loading ? '…' : filtered.length} APIs found
            </span>
            {search && <span className={styles.searchTerm}>for &quot;{search}&quot;</span>}
            {aiProvider && !aiLoading && (
              <span className={styles.aiBadge}>
                <span>✦</span> via {aiProvider}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className={styles.gridSection}>
        <div className={styles.container}>
          {loading ? (
            <div className={styles.grid}>
              {[...Array(9)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className={styles.grid}>
                {filtered.slice(0, visibleCount).map((api, i) => (
                  <ApiCard key={api.id} api={api} index={i} />
                ))}
              </div>
              {visibleCount < filtered.length && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 40 }}>
                  <button
                    onClick={() => setVisibleCount(v => v + 9)}
                    style={{
                      padding: '12px 36px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.color = 'var(--accent-primary)' }}
                    onMouseLeave={e => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.color = 'var(--text-primary)' }}
                  >
                    Show More
                  </button>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} APIs
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3 className={styles.emptyTitle}>No APIs found</h3>
              <p className={styles.emptySub}>Try adjusting your search or filters.</p>
              <button className={styles.resetBtn} onClick={() => { setSearch(''); setCategory('all') }}>
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  )
}
