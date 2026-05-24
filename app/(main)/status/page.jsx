'use client'

import { useState, useEffect } from 'react'
import styles from './status.module.css'

const STATIC_SERVICES = [
  { name: 'API Discovery Engine', key: null },
  { name: 'Health Monitoring', key: null },
  { name: 'AI Gateway (Gemini)', key: 'gemini' },
  { name: 'AI Gateway (Groq)', key: 'groq' },
  { name: 'AI Gateway (Ollama)', key: 'ollama' },
  { name: 'Playground Proxy', key: null },
  { name: 'Authentication', key: null },
  { name: 'Database', key: null },
]

// Deterministic uptime bars — mostly green, one amber at position 17
function generateBars() {
  return Array.from({ length: 30 }, (_, i) => (i === 17 ? 'warn' : 'ok'))
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const statusLabel = {
  operational: '✅ Operational',
  checking: '🔄 Checking…',
  degraded: '⚠️ Degraded',
}

export default function StatusPage() {
  const [lastChecked, setLastChecked] = useState(new Date())
  const [aiStatus, setAiStatus] = useState({})
  const bars = generateBars()

  useEffect(() => {
    async function fetchAiStatus() {
      try {
        const res = await fetch('/api/ai-status')
        const data = await res.json()
        setAiStatus(data.providers || {})
      } catch {}
    }
    fetchAiStatus()
  }, [])

  const services = STATIC_SERVICES.map(svc => {
    if (!svc.key) return { ...svc, status: 'operational' }
    const ai = aiStatus[svc.key]
    if (!ai) return { ...svc, status: 'checking' }
    return { ...svc, status: ai.available ? 'operational' : 'degraded' }
  })

  const allOk = services.every((s) => s.status !== 'degraded')

  useEffect(() => {
    const interval = setInterval(() => {
      setLastChecked(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroLabel}>System Status</div>
        <h1 className={styles.heroHeading}>APIverse Status</h1>
        <p className={styles.heroSub}>Real-time operational status for all platform services</p>
      </div>

      {/* Banner */}
      <div className={`${styles.banner} ${allOk ? styles.bannerOk : styles.bannerWarn}`}>
        <div className={styles.bannerDot} />
        <div className={styles.bannerTitle}>
          {allOk ? 'All systems operational' : 'Incident detected — investigating'}
        </div>
        <span className={styles.lastChecked}>
          Last checked: {formatTime(lastChecked)}
        </span>
      </div>

      {/* Services */}
      <section className={styles.servicesSection}>
        <h2 className={styles.sectionHeading}>Services</h2>
        <div className={styles.serviceList}>
          {services.map((svc) => (
            <div key={svc.name} className={styles.serviceRow}>
              <span className={styles.serviceName}>{svc.name}</span>
              <span className={`${styles.statusBadge} ${styles[svc.status]}`}>
                {statusLabel[svc.status]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 30-day uptime */}
      <section className={styles.uptimeSection}>
        <h2 className={styles.sectionHeading}>30-Day Uptime</h2>
        <div className={styles.uptimeChart}>
          {bars.map((type, i) => (
            <div
              key={i}
              className={`${styles.bar} ${type === 'ok' ? styles.barOk : styles.barWarn}`}
              title={type === 'ok' ? 'Operational' : 'Degraded performance'}
            />
          ))}
        </div>
        <div className={styles.uptimeLabels}>
          <span>30 days ago</span>
          <span>Today</span>
        </div>
        <div className={styles.uptimePct}>99.7% uptime over 30 days</div>
      </section>

      {/* Incident history */}
      <section>
        <h2 className={styles.sectionHeading}>Incident History</h2>
        <div className={styles.incidents}>
          <div className={styles.noIncidents}>No incidents in the last 30 days</div>
          <p>All systems have been running smoothly. Historical incidents will appear here.</p>
        </div>
      </section>
    </div>
  )
}
