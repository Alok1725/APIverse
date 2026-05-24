'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import styles from './page.module.css'

// =============================================
// Animation variants
// =============================================
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const staggerFast = {
  visible: {
    transition: { staggerChildren: 0.07 },
  },
}

// =============================================
// Animated counter hook
// =============================================
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])

  return count
}

// =============================================
// Counter component
// =============================================
function Counter({ value, suffix = '', prefix = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const count = useCounter(value, 2000, isInView)

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// =============================================
// Feature cards data
// =============================================
const FEATURES = [
  {
    icon: '🔍',
    title: 'AI Discovery Engine',
    desc: 'Natural language search across all indexed APIs. Describe what you need in plain English and get semantically matched results.',
    tag: 'Semantic Search',
    tagColor: { background: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' },
    iconBg: 'rgba(99,102,241,0.15)',
  },
  {
    icon: '📄',
    title: 'Auto-Documentation',
    desc: 'Instant, AI-generated docs for any API endpoint. Upload an OpenAPI spec or paste a URL — we handle the rest.',
    tag: 'AI Generated',
    tagColor: { background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' },
    iconBg: 'rgba(139,92,246,0.15)',
  },
  {
    icon: '📡',
    title: 'Health Observatory',
    desc: 'Real-time uptime monitoring with 1-minute check intervals. Get alerts before your users do.',
    tag: '99.9% SLA',
    tagColor: { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' },
    iconBg: 'rgba(16,185,129,0.15)',
  },
  {
    icon: '⚡',
    title: 'API Playground',
    desc: 'Test any REST API directly in-browser with Monaco editor. Save requests, compare responses, share sessions.',
    tag: 'Zero Setup',
    tagColor: { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' },
    iconBg: 'rgba(245,158,11,0.15)',
  },
  {
    icon: '🔗',
    title: 'Composition Studio',
    desc: 'Chain multiple APIs together using AI-assisted workflow builders. Create complex integrations without code.',
    tag: 'No-Code',
    tagColor: { background: 'rgba(6,182,212,0.12)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' },
    iconBg: 'rgba(6,182,212,0.15)',
  },
  {
    icon: '🎯',
    title: 'Change Radar',
    desc: 'Never miss a breaking change. Monitor API changelogs, detect deprecations, and get notified instantly.',
    tag: 'Auto-Scan',
    tagColor: { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' },
    iconBg: 'rgba(239,68,68,0.15)',
  },
]

// =============================================
// Categories base data (counts filled from DB)
// =============================================
const CATEGORIES_BASE = [
  { icon: '🤖', name: 'AI & ML',         key: 'ai',            href: '/discover?category=ai' },
  { icon: '💳', name: 'Payments',        key: 'payments',      href: '/discover?category=payments' },
  { icon: '🛠️', name: 'Dev Tools',       key: 'devtools',      href: '/discover?category=devtools' },
  { icon: '🔐', name: 'Auth & Identity', key: 'auth',          href: '/discover?category=auth' },
  { icon: '💬', name: 'Social & Bots',   key: 'social',        href: '/discover?category=social' },
  { icon: '🗄️', name: 'Databases',       key: 'database',      href: '/discover?category=database' },
  { icon: '📊', name: 'Analytics',       key: 'analytics',     href: '/discover?category=analytics' },
  { icon: '📧', name: 'Email & SMS',     key: 'email',         href: '/discover?category=email' },
  { icon: '🛒', name: 'E-Commerce',      key: 'ecommerce',     href: '/discover?category=ecommerce' },
  { icon: '📡', name: 'Observability',   key: 'observability', href: '/discover?category=observability' },
  { icon: '☁️', name: 'Storage',         key: 'storage',       href: '/discover?category=storage' },
  { icon: '🌍', name: 'Translation',     key: 'translation',   href: '/discover?category=translation' },
]

// =============================================
// Mock API results for the hero card
// =============================================
const HERO_APIS = [
  { icon: '💳', name: 'Stripe', desc: 'Payment processing · REST · v3', status: 'operational' },
  { icon: '🔐', name: 'Auth0', desc: 'Authentication · OAuth 2.0 · v2', status: 'operational' },
  { icon: '📧', name: 'SendGrid', desc: 'Transactional email · REST', status: 'degraded' },
]

// =============================================
// AI Providers data
// =============================================
const AI_PROVIDERS = [
  { icon: '✨', name: 'Google Gemini', meta: 'gemini-1.5-flash',    active: false, online: true },
  { icon: '⚡', name: 'Groq',          meta: 'llama-3.1-8b-instant', active: true,  online: true },
  { icon: '🏠', name: 'Ollama',        meta: 'llama3 · local',       active: false, online: false },
  { icon: '🔧', name: 'Mock Provider', meta: 'Offline fallback',     active: false, online: true },
]

// =============================================
// Main Landing Page Component
// =============================================
export default function LandingPage() {
  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' })
  const [siteStats, setSiteStats] = useState({ total: 0, byCategory: {}, avgUptime: null, avgLatency: null, heroApis: [], aiProviders: [] })

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setSiteStats(d))
      .catch(() => {})
  }, [])

  const categories = CATEGORIES_BASE.map(cat => ({
    ...cat,
    count: siteStats.byCategory[cat.key]
      ? `${siteStats.byCategory[cat.key]} APIs`
      : '—',
  }))

  return (
    <div>
      {/* ======== HERO SECTION ======== */}
      <section className={styles.hero}>
        {/* Background */}
        <div className={styles.heroBg}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.orb3} />
          <div className={styles.gridLines} />
        </div>

        <div className={styles.heroInner}>
          {/* Left: Content */}
          <motion.div
            className={styles.heroContent}
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Badge */}
            <motion.div className={styles.heroBadge} variants={fadeUp}>
              <span className={styles.heroBadgeDot} />
              Multi-Provider AI Gateway · Now with Gemini 1.5
            </motion.div>

            {/* Headline */}
            <motion.h1 className={styles.heroHeadline} variants={fadeUp}>
              The{' '}
              <span className={styles.gradient}>Intelligence Layer</span>
              {' '}for the API Economy
            </motion.h1>

            {/* Sub-headline */}
            <motion.p className={styles.heroSub} variants={fadeUp}>
              Discover, understand, test, and monitor any API — powered by a multi-provider AI gateway that never sleeps.
            </motion.p>

            {/* CTAs */}
            <motion.div className={styles.heroCtas} variants={fadeUp}>
              <Link href="/discover" className={styles.ctaPrimary}>
                Explore APIs
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/playground" className={styles.ctaSecondary}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
                </svg>
                Try Playground
              </Link>
            </motion.div>

            {/* Stats bar */}
            <motion.div className={styles.heroStats} variants={fadeUp}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{siteStats.total > 0 ? siteStats.total : '—'}</span>
                <span className={styles.statLabel}>APIs Indexed</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{siteStats.avgUptime != null ? `${siteStats.avgUptime}%` : '99.9%'}</span>
                <span className={styles.statLabel}>Avg Uptime</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{siteStats.aiProviders.filter(p => p.online).length || 3}</span>
                <span className={styles.statLabel}>AI Providers</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{siteStats.avgLatency != null ? `${siteStats.avgLatency}ms` : '<50ms'}</span>
                <span className={styles.statLabel}>Avg Latency</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Floating preview card */}
          <motion.div
            className={styles.heroVisual}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          >
            <div style={{ position: 'relative' }}>
              {/* Main floating card */}
              <div className={styles.floatingCard}>
                {/* Window chrome */}
                <div className={styles.cardHeader}>
                  <div className={styles.cardDots}>
                    <div className={`${styles.dot} ${styles.dotRed}`} />
                    <div className={`${styles.dot} ${styles.dotYellow}`} />
                    <div className={`${styles.dot} ${styles.dotGreen}`} />
                  </div>
                  <span className={styles.cardTitle}>apiverse · discovery</span>
                </div>

                {/* Search */}
                <div className={styles.cardSearch}>
                  <svg className={styles.cardSearchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span className={styles.cardSearchText}>payment processing APIs...</span>
                  <span className={styles.cardSearchBadge}>AI ✨</span>
                </div>

                {/* Results */}
                {(siteStats.heroApis.length > 0 ? siteStats.heroApis : HERO_APIS).map((api, i) => (
                  <motion.div
                    key={api.name}
                    className={styles.apiResult}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.12 }}
                  >
                    <div className={styles.apiResultIcon}>{api.icon}</div>
                    <div className={styles.apiResultInfo}>
                      <div className={styles.apiResultName}>{api.name}</div>
                      <div className={styles.apiResultDesc}>{api.desc}</div>
                    </div>
                    <div className={`${styles.statusBadge} ${api.status === 'operational' ? styles.statusOperational : styles.statusDegraded}`}>
                      <span className={styles.statusDot} />
                      {api.status === 'operational' ? 'Up' : 'Slow'}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mini floating cards */}
              <motion.div
                className={`${styles.floatingMini} ${styles.floatingMini1}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className={styles.miniLabel}>AI Provider</div>
                <div className={styles.miniValue}>
                  {(() => { const p = siteStats.aiProviders.find(x => x.active); return p ? `${p.icon} ${p.name.split(' ')[0]}` : '⚡ Groq' })()}
                </div>
                <div className={styles.miniSub}>Active · {siteStats.avgLatency != null ? `${siteStats.avgLatency}ms` : 'Live'}</div>
              </motion.div>

              <motion.div
                className={`${styles.floatingMini} ${styles.floatingMini2}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <div className={styles.miniLabel}>APIs Indexed</div>
                <div className={styles.miniValue}>{siteStats.total > 0 ? siteStats.total : '…'}</div>
                <div className={styles.miniSub}>Monitored 24/7</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* ======== FEATURES SECTION ======== */}
      <section className={styles.features}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            className={styles.sectionHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.span className={styles.sectionLabel} variants={fadeUp}>
              Everything You Need
            </motion.span>
            <motion.h2 className={styles.sectionTitle} variants={fadeUp}>
              A complete API intelligence platform
            </motion.h2>
            <motion.p className={styles.sectionSub} variants={fadeUp}>
              From discovery to monitoring — every tool a developer needs to work with APIs, powered by cutting-edge AI.
            </motion.p>
          </motion.div>
        </div>

        <motion.div
          className={styles.featuresGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          {FEATURES.map((feature) => (
            <motion.div key={feature.title} className={styles.featureCard} variants={fadeUp}>
              <div
                className={styles.featureIcon}
                style={{ background: feature.iconBg }}
              >
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.desc}</p>
              <span className={styles.featureTag} style={feature.tagColor}>
                {feature.tag}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div className={styles.sectionDivider} />

      {/* ======== AI GATEWAY SECTION ======== */}
      <section className={styles.gateway}>
        <div className={styles.gatewayInner}>
          {/* Left: Diagram */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            {/* Central hub */}
            <div className={styles.gatewayHub}>
              <div className={styles.hubIcon}>🧠</div>
              <div>
                <div className={styles.hubTitle}>AI Gateway</div>
                <div className={styles.hubSub}>Smart routing · Fallback chain · Usage tracking</div>
              </div>
              <div
                style={{
                  marginLeft: 'auto',
                  fontSize: 11,
                  color: 'var(--accent-success)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent-success)',
                    boxShadow: '0 0 8px var(--accent-success)',
                    display: 'inline-block',
                  }}
                />
                LIVE
              </div>
            </div>

            {/* Connector line */}
            <div style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', gap: 0 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(99,102,241,0.5), rgba(99,102,241,0.1))' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-primary)' }} />
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(99,102,241,0.1), rgba(99,102,241,0.5))' }} />
            </div>

            {/* Providers */}
            <div className={styles.providers}>
              {(siteStats.aiProviders.length > 0 ? siteStats.aiProviders : AI_PROVIDERS).map((provider, i) => (
                <motion.div
                  key={provider.name}
                  className={`${styles.providerCard} ${provider.active ? styles.active : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                >
                  <span className={styles.providerIcon}>{provider.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div className={styles.providerName}>{provider.name}</div>
                    <div className={styles.providerMeta}>{provider.meta}</div>
                  </div>
                  <div className={styles.providerStatus}>
                    <div className={`${styles.providerStatusDot} ${provider.online ? styles.online : styles.offline}`} />
                    <span style={{ fontSize: 11, color: provider.online ? 'var(--accent-success)' : 'var(--text-muted)', fontWeight: 500 }}>
                      {provider.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  {provider.active && (
                    <span style={{
                      fontSize: 10,
                      padding: '2px 7px',
                      borderRadius: 999,
                      background: 'rgba(99,102,241,0.15)',
                      color: 'var(--accent-primary)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      fontWeight: 600,
                      marginLeft: 6,
                    }}>
                      PRIMARY
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            className={styles.gatewayContent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <div>
              <motion.span className={styles.sectionLabel} variants={fadeUp}>
                Multi-Provider AI
              </motion.span>
              <motion.h2 className={styles.sectionTitle} variants={fadeUp} style={{ marginBottom: 12 }}>
                Zero-downtime AI with smart routing
              </motion.h2>
              <motion.p className={styles.sectionSub} variants={fadeUp}>
                Our AI gateway intelligently routes requests across Gemini, Groq, and Ollama — with automatic failover and usage tracking. Never hit a rate limit again.
              </motion.p>
            </div>

            <motion.div className={styles.gatewayStats} variants={fadeUp}>
              <div className={styles.gatewayStat}>
                <div className={`${styles.gatewayStatValue} ${styles.gradient}`}>45+</div>
                <div className={styles.gatewayStatLabel}>AI requests / minute</div>
              </div>
              <div className={styles.gatewayStat}>
                <div className={`${styles.gatewayStatValue} ${styles.gradient}`}>3</div>
                <div className={styles.gatewayStatLabel}>Active providers</div>
              </div>
              <div className={styles.gatewayStat}>
                <div className={`${styles.gatewayStatValue} ${styles.gradient}`}>99ms</div>
                <div className={styles.gatewayStatLabel}>Avg AI latency</div>
              </div>
              <div className={styles.gatewayStat}>
                <div className={`${styles.gatewayStatValue} ${styles.gradient}`}>∞</div>
                <div className={styles.gatewayStatLabel}>Fallback chain depth</div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link href="/discover" className={styles.ctaPrimary} style={{ width: 'fit-content' }}>
                Try the Gateway
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* ======== STATS COUNTER SECTION ======== */}
      <section className={styles.stats} ref={statsRef}>
        <div className={styles.statsGrid}>
          <motion.div
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0 }}
          >
            <div className={styles.statCardValue}>
              <Counter value={siteStats.total || 0} />
            </div>
            <div className={styles.statCardLabel}>APIs Indexed</div>
            <div className={styles.statCardSub}>Indexed & monitored</div>
          </motion.div>

          <motion.div
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            <div className={styles.statCardValue}>
              <Counter value={3} />
            </div>
            <div className={styles.statCardLabel}>AI Providers</div>
            <div className={styles.statCardSub}>Gemini · Groq · Ollama</div>
          </motion.div>

          <motion.div
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.statCardValue}>
              <Counter value={99} suffix=".9%" />
            </div>
            <div className={styles.statCardLabel}>Uptime SLA</div>
            <div className={styles.statCardSub}>Monitored 24/7</div>
          </motion.div>

          <motion.div
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.statCardValue}>
              &lt;<Counter value={50} suffix="ms" />
            </div>
            <div className={styles.statCardLabel}>Response Time</div>
            <div className={styles.statCardSub}>Average latency</div>
          </motion.div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* ======== CATEGORIES SECTION ======== */}
      <section className={styles.categories}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            className={styles.sectionHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            style={{ marginBottom: 48 }}
          >
            <motion.span className={styles.sectionLabel} variants={fadeUp}>
              Browse by Category
            </motion.span>
            <motion.h2 className={styles.sectionTitle} variants={fadeUp}>
              Every API category, covered
            </motion.h2>
            <motion.p className={styles.sectionSub} variants={fadeUp}>
              From payments to AI/ML — explore our curated collection of developer-ready APIs, complete with health stats and AI-generated docs.
            </motion.p>
          </motion.div>
        </div>

        <motion.div
          className={styles.categoriesGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerFast}
        >
          {categories.map((cat) => (
            <motion.a
              key={cat.name}
              href={cat.href}
              className={styles.categoryTile}
              variants={fadeUp}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <span className={styles.categoryName}>{cat.name}</span>
              <span className={styles.categoryCount}>{cat.count}</span>
            </motion.a>
          ))}
        </motion.div>
      </section>

      <div className={styles.sectionDivider} />

      {/* ======== FINAL CTA SECTION ======== */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaBg} />
        <motion.div
          className={styles.finalCtaContent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.span className={styles.sectionLabel} variants={fadeUp}>
            Get Started Free
          </motion.span>

          <motion.h2 className={styles.finalCtaTitle} variants={fadeUp}>
            Start exploring in{' '}
            <span className="text-gradient">seconds</span>
          </motion.h2>

          <motion.p className={styles.finalCtaSub} variants={fadeUp}>
            No signup required for basic discovery. Create a free account to unlock monitoring, the playground, and AI-powered insights.
          </motion.p>

          <motion.div className={styles.finalCtaButtons} variants={fadeUp}>
            <Link href="/discover" className={styles.ctaPrimary}>
              Explore APIs Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/signin" className={styles.ctaSecondary}>
              Create Free Account
            </Link>
          </motion.div>

          <motion.p className={styles.finalCtaNote} variants={fadeUp}>
            <span>✓ No credit card required</span>{' · '}
            <span>✓ Free tier available</span>{' · '}
            <span>✓ Open source</span>
          </motion.p>
        </motion.div>
      </section>
    </div>
  )
}
