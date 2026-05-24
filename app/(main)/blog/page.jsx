'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './blog.module.css'

const CATEGORIES = ['All', 'Tutorials', 'API News', 'Engineering', 'Best Practices', 'Announcements']

const POSTS = [
  {
    slug: 'top-10-payment-apis-2025',
    emoji: '💳',
    category: 'API News',
    title: 'Top 10 Payment APIs for 2025',
    excerpt: 'A curated comparison of Stripe, Paddle, Braintree, and seven more payment APIs — pricing, features, and developer experience.',
    date: 'Jan 14, 2025',
    readTime: '7 min read',
    color: '#1a2e1a',
  },
  {
    slug: 'understanding-api-rate-limits',
    emoji: '🚦',
    category: 'Tutorial',
    title: 'Understanding API Rate Limits',
    excerpt: 'A practical guide to reading rate limit headers, implementing exponential backoff, and avoiding 429 errors in production.',
    date: 'Jan 9, 2025',
    readTime: '5 min read',
    color: '#1a1a2e',
  },
  {
    slug: 'pgvector-vs-pinecone-api-search',
    emoji: '🧠',
    category: 'Engineering',
    title: 'pgvector vs Pinecone for API Search',
    excerpt: 'We benchmarked both vector stores at 100k documents. The results surprised us — and informed the APIverse architecture.',
    date: 'Jan 3, 2025',
    readTime: '10 min read',
    color: '#2e1a1a',
  },
  {
    slug: 'handling-api-deprecations',
    emoji: '⚠️',
    category: 'Best Practices',
    title: 'Breaking Changes: How to Handle API Deprecations',
    excerpt: 'What to do when an upstream API removes a field, changes an endpoint, or bumps a major version without warning.',
    date: 'Dec 28, 2024',
    readTime: '6 min read',
    color: '#2e2a1a',
  },
  {
    slug: 'ollama-vs-groq-local-vs-cloud',
    emoji: '🤖',
    category: 'Engineering',
    title: 'Ollama vs Groq: Local vs Cloud AI Inference',
    excerpt: 'We compare privacy, latency, cost, and model quality for two very different approaches to running LLMs in your stack.',
    date: 'Dec 20, 2024',
    readTime: '8 min read',
    color: '#1a1a2e',
  },
  {
    slug: 'rise-of-composable-apis',
    emoji: '🔗',
    category: 'API News',
    title: 'The Rise of Composable APIs',
    excerpt: 'The composable architecture trend is reshaping how developers build integrations. Here is what it means for the API economy.',
    date: 'Dec 15, 2024',
    readTime: '4 min read',
    color: '#1a2a2e',
  },
]

export { POSTS }

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? POSTS
    : POSTS.filter((p) => p.category === activeCategory)

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroHeading}>Blog</h1>
        <p className={styles.heroSub}>Insights on the API ecosystem, engineering deep-dives, and platform updates</p>
      </section>

      {/* Category pills */}
      <div className={styles.categories}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {/* Featured post */}
        <Link href="/blog/building-multi-provider-ai-gateway" className={styles.featured}>
          <div className={styles.featuredImage} style={{ background: 'linear-gradient(135deg, #1a1a3e 0%, #0a0a1f 60%, rgba(99,102,241,0.3) 100%)' }}>
            <div className={styles.featuredImageBadge}>Featured</div>
            🏗️
          </div>
          <div className={styles.featuredBody}>
            <div className={styles.featuredLabel}>Engineering</div>
            <div className={styles.featuredTitle}>
              Building a Multi-Provider AI Gateway: Lessons from APIverse
            </div>
            <p className={styles.featuredExcerpt}>
              How we built a unified AI gateway that routes requests to Gemini, Groq, and Ollama
              — with automatic fallback, streaming support, and per-model cost tracking. Everything
              we learned shipping this in production.
            </p>
            <div className={styles.featuredMeta}>
              <span>Jan 18, 2025</span>
              <span>12 min read</span>
              <span className={styles.readMoreLink}>Read more →</span>
            </div>
          </div>
        </Link>

        {/* Posts grid */}
        <div className={styles.postsGrid}>
          {filtered.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.postCard}>
              <div className={styles.postThumb} style={{ background: `linear-gradient(135deg, ${post.color}, var(--bg-primary))` }}>
                {post.emoji}
              </div>
              <div className={styles.postBody}>
                <span className={styles.categoryBadge}>{post.category}</span>
                <div className={styles.postTitle}>{post.title}</div>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
                <div className={styles.postMeta}>
                  <span>{post.date} · {post.readTime}</span>
                  <span className={styles.postReadMore}>Read more →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.note}>
          These are sample posts. Full blog with real content coming soon.
        </div>
      </div>
    </div>
  )
}
