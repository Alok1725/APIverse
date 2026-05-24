import styles from './changelog.module.css'

export const metadata = {
  title: 'Changelog — APIverse',
  description: 'What\'s new in APIverse — version history and release notes.',
}

const RELEASES = [
  {
    version: 'v0.3.0',
    date: 'January 18, 2025',
    title: 'API Composition Studio',
    desc: 'Introduced the visual pipeline builder — drag, drop, and connect APIs without writing a single line of glue code. Compose complex multi-step workflows and export them as ready-to-use code.',
    changes: [
      { type: 'added', text: 'Drag-and-drop node canvas using React Flow with persistent layout storage' },
      { type: 'added', text: 'Step result passing — pipe outputs of one API call directly into the next request body' },
      { type: 'added', text: 'Pipeline export to JavaScript, Python, and cURL formats' },
      { type: 'fixed', text: 'Canvas zoom/pan behavior on trackpad on macOS Safari' },
      { type: 'changed', text: 'Sidebar layout reorganized to surface Compose alongside Discover and Monitor' },
    ]
  },
  {
    version: 'v0.2.5',
    date: 'January 5, 2025',
    title: 'Breaking Change Radar',
    desc: 'Automated detection of API changelog diffs — APIverse now fetches upstream changelog pages and uses AI to extract and classify breaking versus non-breaking changes.',
    changes: [
      { type: 'added', text: 'AI-powered changelog summarization via Gemini and Groq' },
      { type: 'added', text: 'Breaking change severity scoring (low / medium / critical)' },
      { type: 'added', text: 'Email notification support for subscribed APIs with detected changes' },
      { type: 'fixed', text: 'Parser edge case for APIs that version their changelogs with dates rather than semver' },
    ]
  },
  {
    version: 'v0.2.0',
    date: 'December 20, 2024',
    title: 'Health Observatory',
    desc: 'Real-time uptime monitoring with BullMQ background workers. Track response times, error rates, and availability for every indexed API — all updated automatically every 5 minutes.',
    changes: [
      { type: 'added', text: 'BullMQ health check workers with configurable polling intervals' },
      { type: 'added', text: 'Historical uptime chart with 30-day rolling window' },
      { type: 'added', text: 'Response time P50/P95 percentile tracking' },
      { type: 'added', text: 'Health score algorithm (0–100) factoring uptime, latency, and error rate' },
      { type: 'changed', text: 'API detail page redesigned to surface health metrics prominently' },
      { type: 'fixed', text: 'Worker memory leak on Redis connection pool exhaustion' },
    ]
  },
  {
    version: 'v0.1.5',
    date: 'December 8, 2024',
    title: 'AI Playground',
    desc: 'In-browser API testing powered by Monaco Editor. Write requests, view formatted responses, and use AI to summarize what the API returned — across Gemini, Groq, and Ollama.',
    changes: [
      { type: 'added', text: 'Monaco Editor integration for request body authoring with JSON schema hints' },
      { type: 'added', text: 'Multi-provider AI summarization toggle (Gemini / Groq / Ollama)' },
      { type: 'added', text: 'Code generation — auto-generate fetch, axios, or curl from the request config' },
      { type: 'added', text: 'Response history stored in localStorage for the session' },
      { type: 'fixed', text: 'CORS proxy edge case for APIs that return binary content types' },
    ]
  },
  {
    version: 'v0.1.0',
    date: 'November 25, 2024',
    title: 'Initial Launch',
    desc: 'The first public release of APIverse. Semantic API discovery using pgvector embeddings, a clean catalog UI, and the foundations for everything that followed.',
    changes: [
      { type: 'added', text: 'Semantic search with pgvector and natural language query understanding' },
      { type: 'added', text: 'API catalog with 50+ hand-curated entries across 12 categories' },
      { type: 'added', text: 'Basic API detail pages with endpoint list, auth type, and pricing info' },
      { type: 'added', text: 'Next.js 14 App Router architecture with shared layout system' },
    ]
  },
]

const typeMeta = { added: 'added', fixed: 'fixed', changed: 'changed' }

export default function ChangelogPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroHeading}>Changelog</h1>
        <p className={styles.heroSub}>What&apos;s new in APIverse — every release, documented.</p>
      </div>

      <div className={styles.timeline}>
        {RELEASES.map((release) => (
          <div key={release.version} className={styles.entry}>
            <div className={styles.entryCard}>
              <div className={styles.entryHeader}>
                <span className={styles.versionBadge}>{release.version}</span>
                <span className={styles.date}>{release.date}</span>
              </div>
              <h2 className={styles.entryTitle}>{release.title}</h2>
              <p className={styles.entryDesc}>{release.desc}</p>
              <div className={styles.changeList}>
                {release.changes.map((c, i) => (
                  <div key={i} className={styles.changeItem}>
                    <span className={`${styles.changeBadge} ${styles[typeMeta[c.type]]}`}>
                      {c.type}
                    </span>
                    <span>{c.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
