'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './radar.module.css'

const FILTER_OPTIONS = ['All Changes', 'Breaking', 'Deprecation', 'Additive']

const TYPE_CONFIG = {
  breaking:    { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.2)',    icon: '🔴', label: 'Breaking' },
  deprecation: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.2)',   icon: '⚠️', label: 'Deprecation' },
  additive:    { color: '#10b981', bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.2)',   icon: '✅', label: 'Additive' },
}

function Skeleton({ height = 120 }) {
  return (
    <div style={{
      height, borderRadius: 12, marginBottom: 12,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

function ChangeCard({ change, index }) {
  const [subscribed, setSubscribed] = useState(false)
  const [subLoading, setSubLoading] = useState(false)
  const config = TYPE_CONFIG[change.type] || TYPE_CONFIG.additive

  async function handleSubscribe() {
    setSubLoading(true)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiSlug: change.apiSlug }),
      })
      const data = await res.json()
      if (res.status === 401) {
        window.location.href = '/signin'
        return
      }
      if (res.ok) setSubscribed(data.subscribed)
    } catch {
      // silent fail — button stays in current state
    } finally {
      setSubLoading(false)
    }
  }

  return (
    <motion.div
      className={styles.changeCard}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      style={{ borderLeftColor: config.color }}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardLeft}>
          <span
            className={styles.severityBadge}
            style={{ background: config.bg, color: config.color, borderColor: config.border }}
          >
            {config.icon} {config.label}
          </span>
          <div className={styles.apiRow}>
            <span className={styles.apiIcon}>{change.icon}</span>
            <Link href={`/discover/${change.apiSlug}`} className={styles.apiName} style={{ textDecoration: 'none', color: 'inherit' }}>
              {change.api}
            </Link>
            <span className={styles.version}>v: {change.version}</span>
          </div>
        </div>
        <div className={styles.cardRight}>
          <span className={styles.date}>{change.date}</span>
          <button
            className={`${styles.subscribeBtn} ${subscribed ? styles.subscribedBtn : ''}`}
            onClick={handleSubscribe}
            disabled={subLoading}
          >
            {subLoading ? '…' : subscribed ? '✓ Subscribed' : '+ Subscribe'}
          </button>
        </div>
      </div>

      <h3 className={styles.changeTitle}>{change.title}</h3>
      <p className={styles.changeDesc}>{change.desc}</p>
    </motion.div>
  )
}

export default function RadarPage() {
  const [entries, setEntries]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeFilter, setActiveFilter] = useState('All Changes')
  const [alertModal, setAlertModal]   = useState(false)
  const [alertEmail, setAlertEmail]   = useState('')
  const [alertType, setAlertType]     = useState('all')
  const [alertDone, setAlertDone]     = useState(false)
  const [alertLoading, setAlertLoading] = useState(false)
  const [alertError, setAlertError]   = useState(null)
  const [visibleCount, setVisibleCount] = useState(5)

  useEffect(() => { setVisibleCount(5) }, [activeFilter])

  useEffect(() => {
    fetch('/api/changelog')
      .then(r => r.json())
      .then(d => setEntries(d.entries || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleAlertSubmit(e) {
    e.preventDefault()
    if (!alertEmail.trim()) return
    setAlertLoading(true)
    setAlertError(null)
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: alertEmail, alertType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to subscribe')
      setAlertDone(true)
      setTimeout(() => {
        setAlertModal(false)
        setAlertDone(false)
        setAlertEmail('')
        setAlertType('all')
      }, 2500)
    } catch (err) {
      setAlertError(err.message)
    } finally {
      setAlertLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (activeFilter === 'All Changes') return entries
    return entries.filter(c => c.type === activeFilter.toLowerCase())
  }, [entries, activeFilter])

  const counts = useMemo(() => ({
    total: entries.length,
    breaking: entries.filter(c => c.type === 'breaking').length,
    deprecation: entries.filter(c => c.type === 'deprecation').length,
  }), [entries])

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <motion.div
          className={styles.pageHeader}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className={styles.headerLabel}>
              <span className={styles.radarDot} />
              Change Feed
            </div>
            <h1 className={styles.pageTitle}>Change Radar</h1>
            <p className={styles.pageSubtitle}>
              Breaking changes, deprecations, and new additions tracked from the database.
            </p>
          </div>
          <div className={styles.headerStats}>
            {[
              { label: 'Total Entries', value: loading ? '—' : counts.total,       color: 'var(--accent-primary)' },
              { label: 'Breaking',      value: loading ? '—' : counts.breaking,    color: 'var(--accent-danger)' },
              { label: 'Deprecations',  value: loading ? '—' : counts.deprecation, color: 'var(--accent-warning)' },
            ].map(s => (
              <div key={s.label} className={styles.headerStat}>
                <div className={styles.headerStatValue} style={{ color: s.color }}>{s.value}</div>
                <div className={styles.headerStatLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filter Pills */}
        <div className={styles.filterRow}>
          {FILTER_OPTIONS.map(f => (
            <button
              key={f}
              className={`${styles.filterPill} ${activeFilter === f ? styles.filterPillActive : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f === 'Breaking' && '🔴 '}
              {f === 'Deprecation' && '⚠️ '}
              {f === 'Additive' && '✅ '}
              {f}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className={styles.feed}>
          {loading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} />)
          ) : filtered.length > 0 ? (
            <>
              {filtered.slice(0, visibleCount).map((change, i) => (
                <ChangeCard key={change.id} change={change} index={i} />
              ))}
              {filtered.length > visibleCount && (
                <button
                  className={styles.showMoreBtn}
                  onClick={() => setVisibleCount(v => v + 5)}
                >
                  Show {Math.min(5, filtered.length - visibleCount)} more
                  <span className={styles.showMoreCount}>({filtered.length - visibleCount} remaining)</span>
                </button>
              )}
            </>
          ) : (
            <motion.div
              className={styles.emptyState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className={styles.emptyIcon}>{entries.length === 0 ? '📭' : '🎉'}</div>
              <h3 className={styles.emptyTitle}>
                {entries.length === 0 ? 'No changelog entries yet' : `No ${activeFilter} found`}
              </h3>
              <p className={styles.emptySub}>
                {entries.length === 0
                  ? 'Changelog entries will appear here as APIs update.'
                  : 'There are no changes matching this filter right now.'}
              </p>
            </motion.div>
          )}
        </div>

        {/* Subscribe Banner */}
        <motion.div
          className={styles.subscribeBanner}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles.bannerIcon}>📡</div>
          <div className={styles.bannerContent}>
            <h3 className={styles.bannerTitle}>Never miss a breaking change</h3>
            <p className={styles.bannerText}>Get instant alerts for APIs you use via email, Slack, or webhook.</p>
          </div>
          <button className={styles.bannerBtn} onClick={() => setAlertModal(true)}>Set Up Alerts →</button>
        </motion.div>

      </div>

      {/* Alerts Modal */}
      <AnimatePresence>
        {alertModal && (
          <>
            <motion.div
              className={styles.modalOverlay}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAlertModal(false)}
            />
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>📡 Set Up Change Alerts</h3>
                <button className={styles.modalClose} onClick={() => setAlertModal(false)}>✕</button>
              </div>

              {alertDone ? (
                <div className={styles.alertSuccess}>
                  <div style={{ fontSize: 32 }}>✅</div>
                  <div>You&apos;re subscribed! We&apos;ll email you when breaking changes are detected.</div>
                </div>
              ) : (
                <form onSubmit={handleAlertSubmit} className={styles.alertForm}>
                  <p className={styles.alertDesc}>
                    Get notified by email when breaking changes, deprecations, or new additions are detected.
                  </p>
                  <div className={styles.alertField}>
                    <label className={styles.alertLabel}>Email address</label>
                    <input
                      type="email"
                      className={styles.alertInput}
                      placeholder="you@example.com"
                      value={alertEmail}
                      onChange={e => setAlertEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.alertField}>
                    <label className={styles.alertLabel}>Alert me for</label>
                    <div className={styles.alertOptions}>
                      {[
                        { value: 'all',         label: 'All changes' },
                        { value: 'breaking',    label: '🔴 Breaking only' },
                        { value: 'deprecation', label: '⚠️ Deprecations' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`${styles.alertOption} ${alertType === opt.value ? styles.alertOptionActive : ''}`}
                          onClick={() => setAlertType(opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {alertError && (
                    <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{alertError}</div>
                  )}
                  <button type="submit" className={styles.alertSubmit} disabled={alertLoading}>
                    {alertLoading ? 'Subscribing…' : 'Subscribe to Alerts'}
                  </button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
