'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import styles from './observatory.module.css'

const STATUS_COLORS = { op: '#10b981', deg: '#f59e0b', down: '#ef4444' }
const STATUS_LABELS = { operational: 'Operational', degraded: 'Degraded', down: 'Down', maintenance: 'Maintenance', unknown: 'Unknown' }
const STATUS_COLOR_MAP = { operational: '#10b981', degraded: '#f59e0b', down: '#ef4444', maintenance: '#6366f1', unknown: '#64748b' }
const FILTER_TABS = ['All', 'Operational', 'Degraded', 'Down']

function Skeleton({ height = 16, width = '100%', style = {} }) {
  return (
    <div style={{
      height, width, borderRadius: 8,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style,
    }} />
  )
}

function StatCard({ label, value, color, icon, delay }) {
  return (
    <motion.div
      className={styles.statCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statValue} style={{ color }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </motion.div>
  )
}

function ApiMonitorCard({ api, index }) {
  const statusColor = STATUS_COLOR_MAP[api.status] || '#64748b'

  return (
    <motion.div
      className={styles.monitorCard}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: (index % 8) * 0.04 }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardLeft}>
          <span className={styles.cardIcon}>{api.icon}</span>
          <div>
            <Link href={`/discover/${api.id}`} className={styles.cardName} style={{ textDecoration: 'none', color: 'inherit' }}>
              {api.name}
            </Link>
            <div className={styles.cardCategory}>{api.category}</div>
          </div>
        </div>
        <div className={styles.statusWrap}>
          <span
            className={styles.statusDot}
            style={{ background: statusColor }}
            data-operational={api.status === 'operational'}
          />
          <span className={styles.statusText} style={{ color: statusColor }}>
            {STATUS_LABELS[api.status] || api.status}
          </span>
        </div>
      </div>

      <div className={styles.uptimeRow}>
        <div className={styles.uptimeLabel}>Uptime (30d)</div>
        <div className={styles.uptimeBar}>
          <div
            className={styles.uptimeBarFill}
            style={{ width: api.uptime + '%', background: statusColor }}
          />
        </div>
        <div className={styles.uptimeValue} style={{ color: statusColor }}>{api.uptime}%</div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <div className={styles.statItemValue}>
            {api.latency > 0 ? `${api.latency}ms` : '—'}
          </div>
          <div className={styles.statItemLabel}>Avg Latency</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statItemValue} style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {api.lastChecked}
          </div>
          <div className={styles.statItemLabel}>Last Checked</div>
        </div>
      </div>

      {api.history.length > 0 && (
        <div className={styles.sparkline}>
          {api.history.map((h, i) => (
            <div
              key={i}
              className={styles.sparkDot}
              style={{ background: STATUS_COLORS[h] || '#64748b' }}
              title={h === 'op' ? 'Operational' : h === 'deg' ? 'Degraded' : 'Down'}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function ObservatoryPage() {
  const [apis, setApis]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [lastUpdated, setLastUpdated]   = useState(null)

  function loadData() {
    setLoading(true)
    fetch('/api/observatory')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setApis(d.apis || [])
        setLastUpdated(new Date())
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    // Refresh every 60 seconds
    const interval = setInterval(loadData, 60_000)
    return () => clearInterval(interval)
  }, [])

  const totals = useMemo(() => ({
    total: apis.length,
    operational: apis.filter(a => a.status === 'operational').length,
    degraded: apis.filter(a => a.status === 'degraded').length,
    down: apis.filter(a => a.status === 'down').length,
  }), [apis])

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return apis
    return apis.filter(a => a.status === activeFilter.toLowerCase())
  }, [activeFilter, apis])

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
          <div className={styles.headerLeft}>
            <div className={styles.headerLabel}>
              <span className={styles.liveDot} />
              Live Monitoring
            </div>
            <h1 className={styles.pageTitle}>API Observatory</h1>
            <p className={styles.pageSubtitle}>
              Real-time health monitoring for APIs across the ecosystem. Refreshes every 60 seconds.
            </p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.lastUpdated}>
              {loading ? (
                <>
                  <span className={styles.liveDot} />
                  Checking…
                </>
              ) : lastUpdated ? (
                <>
                  <span className={styles.liveDot} />
                  Updated {lastUpdated.toLocaleTimeString()}
                </>
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* Summary Stats */}
        {loading ? (
          <div className={styles.statsGrid}>
            {[...Array(4)].map((_, i) => <Skeleton key={i} height={80} style={{ borderRadius: 12 }} />)}
          </div>
        ) : (
          <div className={styles.statsGrid}>
            <StatCard label="Total Monitored" value={totals.total} color="var(--accent-primary)" icon="📡" delay={0.1} />
            <StatCard label="Operational"     value={totals.operational} color="var(--accent-success)" icon="✅" delay={0.15} />
            <StatCard label="Degraded"        value={totals.degraded}    color="var(--accent-warning)" icon="⚠️" delay={0.2} />
            <StatCard label="Down"            value={totals.down}        color="var(--accent-danger)"  icon="🔴" delay={0.25} />
          </div>
        )}

        {/* Global Status Banner */}
        {!loading && apis.length > 0 && (
          <motion.div
            className={styles.statusBanner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              borderColor: totals.degraded > 0 || totals.down > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)',
              background: totals.degraded > 0 || totals.down > 0 ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)',
            }}
          >
            <span style={{ fontSize: 18 }}>{totals.degraded > 0 || totals.down > 0 ? '⚠️' : '✅'}</span>
            <span className={styles.bannerText}>
              {totals.down > 0
                ? `${totals.down} API${totals.down > 1 ? 's' : ''} down. ${totals.degraded > 0 ? `${totals.degraded} degraded.` : ''}`
                : totals.degraded > 0
                ? `${totals.degraded} API${totals.degraded > 1 ? 's' : ''} experiencing degraded performance. All others operational.`
                : 'All systems fully operational. No incidents detected.'}
            </span>
          </motion.div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <p>Could not load observatory data: {error}</p>
            <button onClick={loadData} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, cursor: 'pointer', background: 'var(--accent-primary)', color: '#fff', border: 'none' }}>
              Retry
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && apis.length > 0 && (
          <div className={styles.filterRow}>
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                className={`${styles.filterTab} ${activeFilter === tab ? styles.filterTabActive : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
                <span className={styles.filterCount}>
                  {tab === 'All' ? totals.total : tab === 'Operational' ? totals.operational : tab === 'Degraded' ? totals.degraded : totals.down}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Loading skeleton grid */}
        {loading && (
          <div className={styles.monitorGrid}>
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} height={160} style={{ borderRadius: 12 }} />
            ))}
          </div>
        )}

        {/* Monitor Grid */}
        {!loading && filtered.length > 0 && (
          <div className={styles.monitorGrid}>
            {filtered.map((api, i) => (
              <ApiMonitorCard key={api.id} api={api} index={i} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && apis.length > 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎉</div>
            <h3 className={styles.emptyTitle}>No APIs with this status</h3>
            <p className={styles.emptySub}>All APIs are healthy.</p>
          </div>
        )}

        {/* Legend */}
        {!loading && apis.length > 0 && (
          <div className={styles.legend}>
            <span className={styles.legendTitle}>Sparkline legend:</span>
            {[['op', '#10b981', 'Operational'], ['deg', '#f59e0b', 'Degraded'], ['down', '#ef4444', 'Down']].map(([key, color, label]) => (
              <div key={key} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: color }} />
                <span className={styles.legendLabel}>{label}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
