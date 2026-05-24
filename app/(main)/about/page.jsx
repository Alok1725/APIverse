import { db } from '@/lib/db'
import styles from './about.module.css'

export const metadata = {
  title: 'About — APIverse',
  description: 'Built for developers, powered by AI. Learn about the APIverse platform.',
}

const features = [
  {
    icon: '🔍',
    title: 'Discover',
    description: 'Semantic search powered by pgvector lets you find APIs by describing what you need in plain English. No more hunting through directories.'
  },
  {
    icon: '📡',
    title: 'Monitor',
    description: 'Real-time health checks, uptime tracking, and latency monitoring with BullMQ workers. Get alerted before your users notice an outage.'
  },
  {
    icon: '⚡',
    title: 'Compose',
    description: 'Drag-and-drop pipeline builder to chain APIs together. Connect authentication, data transformation, and downstream services visually.'
  }
]

const techStack = [
  'Next.js 16', 'React', 'PostgreSQL', 'Redis', 'pgvector',
  'Prisma', 'BullMQ', 'Google Gemini', 'Groq', 'Ollama',
  'Monaco Editor', 'Framer Motion', 'Vercel'
]

export default async function AboutPage() {
  let apiCount = 0
  try {
    apiCount = await db.api.count()
  } catch {}

  const stats = [
    { value: `${apiCount}`, label: 'APIs Indexed' },
    { value: '3', label: 'AI Providers' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '$0', label: 'To Get Started' },
  ]

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroLabel}>About APIverse</div>
        <h1 className={styles.heroHeading}>
          Built for developers,<br />
          powered by <span className={styles.gradient}>AI</span>
        </h1>
        <p className={styles.heroSubtitle}>
          APIverse is an open-source API intelligence platform that combines semantic search,
          real-time monitoring, and multi-provider AI into one cohesive developer tool.
        </p>
      </section>

      {/* Mission */}
      <section className={styles.mission}>
        <div className={styles.missionText}>
          <h2>Our mission</h2>
          <p>
            The modern web runs on APIs — but finding, evaluating, and monitoring them
            is still a fragmented, time-consuming process. Developers bounce between
            RapidAPI, Postman, and a dozen dashboards just to understand if a single API
            is right for their project.
          </p>
          <p>
            APIverse brings everything together: discovery powered by semantic AI, health
            monitoring with real-time workers, and an in-browser playground to test before
            you commit.
          </p>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What is APIverse */}
      <section className={styles.whatIs}>
        <div className={styles.whatIsInner}>
          <span className={styles.sectionLabel}>Platform Overview</span>
          <h2>What is APIverse?</h2>
          <p>
            APIverse is a full-stack developer platform built on Next.js 16 that gives you
            a unified interface for the entire API lifecycle. At its core is a semantic
            search engine — using pgvector embeddings — that understands natural language
            queries like &quot;find a payments API that supports recurring billing&quot;.
          </p>
          <p>
            Beyond discovery, APIverse runs continuous health checks on every indexed API
            using BullMQ background workers, surfacing uptime history, response time trends,
            and breaking-change detection so you know exactly when to act. The AI Playground
            lets you craft requests, generate code snippets, and summarize API responses
            using your choice of Gemini, Groq, or a local Ollama model.
          </p>
        </div>
      </section>

      {/* Feature highlights */}
      <section className={styles.features}>
        <div className={styles.featuresHeader}>
          <span className={styles.sectionLabel}>Core Pillars</span>
          <h2>Everything in one place</h2>
          <p>Three pillars that cover the complete API development workflow</p>
        </div>
        <div className={styles.featureCards}>
          {features.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open source */}
      <section className={styles.openSource}>
        <div className={styles.openSourceInner}>
          <span className={styles.sectionLabel}>Community</span>
          <h2>APIverse is open source</h2>
          <p>
            Every line of APIverse is publicly available on GitHub. We believe the developer
            tooling ecosystem benefits from transparency — you can inspect, fork, contribute,
            or self-host the entire platform. PRs and issues are welcome.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubBtn}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>
      </section>

      {/* Tech stack */}
      <section className={styles.techStack}>
        <span className={styles.sectionLabel}>Stack</span>
        <h2>Built with modern tools</h2>
        <p>Production-grade technologies chosen for performance, scalability, and developer experience</p>
        <div className={styles.techGrid}>
          {techStack.map((t) => (
            <div key={t} className={styles.techBadge}>{t}</div>
          ))}
        </div>
      </section>
    </div>
  )
}
