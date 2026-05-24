'use client'

import Link from 'next/link'
import { use } from 'react'

const ALL_POSTS = [
  {
    slug: 'building-multi-provider-ai-gateway',
    emoji: '🏗️',
    category: 'Engineering',
    title: 'Building a Multi-Provider AI Gateway: Lessons from APIverse',
    excerpt: 'How we built a unified AI gateway that routes requests to Gemini, Groq, and Ollama — with automatic fallback, streaming support, and per-model cost tracking. Everything we learned shipping this in production.',
    date: 'Jan 18, 2025',
    readTime: '12 min read',
    color: '#1a1a3e',
  },
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

export default function BlogPostPage({ params }) {
  const { slug } = use(params)
  const post = ALL_POSTS.find(p => p.slug === slug)

  if (!post) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--text-muted)', padding: '2rem' }}>
        <div style={{ fontSize: 48 }}>📄</div>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Post not found</h2>
        <Link href="/blog" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>← Back to blog</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '4rem 2rem 6rem', color: 'var(--text-primary)' }}>
      <Link href="/blog" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '2rem' }}>
        ← Blog
      </Link>

      <div style={{
        height: 260, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 72, marginBottom: '2rem',
        background: `linear-gradient(135deg, ${post.color}, var(--bg-primary))`,
      }}>
        {post.emoji}
      </div>

      <span style={{
        display: 'inline-block', padding: '4px 12px', borderRadius: 999,
        background: 'rgba(99,102,241,0.12)', color: 'var(--accent-primary)',
        fontSize: 12, fontWeight: 600, marginBottom: '1rem',
      }}>
        {post.category}
      </span>

      <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
        {post.title}
      </h1>

      <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: 14, marginBottom: '2.5rem' }}>
        <span>{post.date}</span>
        <span>·</span>
        <span>{post.readTime}</span>
      </div>

      <p style={{ fontSize: '1.1rem', lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
        {post.excerpt}
      </p>

      <div style={{
        padding: '1.5rem', borderRadius: 12,
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6,
        textAlign: 'center',
      }}>
        Full article coming soon. The APIverse blog is actively being written — check back shortly for the complete post.
      </div>
    </div>
  )
}
