'use client'

import { useState } from 'react'
import Link from 'next/link'

const sectionStyle = {
  marginBottom: '2.5rem',
}

const headingStyle = {
  fontSize: '1.25rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '0.75rem',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid var(--border-subtle)',
}

const paraStyle = {
  color: 'var(--text-muted)',
  fontSize: '0.93rem',
  lineHeight: '1.8',
  marginBottom: '0.6rem',
}

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-md)',
  padding: '1.25rem 1.5rem',
  marginBottom: '0.75rem',
}

const badgeStyle = (color) => ({
  display: 'inline-block',
  fontSize: '0.72rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '0.2rem 0.6rem',
  borderRadius: '4px',
  marginBottom: '0.5rem',
  background: color === 'green' ? 'rgba(16,185,129,0.1)' : color === 'blue' ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)',
  color: color === 'green' ? 'var(--accent-success)' : color === 'blue' ? 'var(--accent-primary)' : 'var(--accent-warning)',
  border: `1px solid ${color === 'green' ? 'rgba(16,185,129,0.2)' : color === 'blue' ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)'}`,
})

export default function CookiesPage() {
  const [saved, setSaved] = useState(false)

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '4rem 2rem 6rem', color: 'var(--text-primary)' }}>
      {/* Hero */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Cookie Policy
        </h1>
        <span style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          background: 'var(--bg-card)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 1rem',
          display: 'inline-block',
        }}>
          Last updated: January 2025
        </span>
      </div>

      <div style={sectionStyle}>
        <p style={paraStyle}>
          This Cookie Policy explains how APIverse uses cookies and similar tracking technologies when you
          visit our platform. We aim to use only what is necessary to operate and improve the service.
        </p>
      </div>

      {/* Essential */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Essential Cookies</h2>
        <div style={cardStyle}>
          <div style={badgeStyle('green')}>Required</div>
          <p style={{ ...paraStyle, marginBottom: 0 }}>
            These cookies are strictly necessary for the platform to function. They handle session management,
            authentication state, and CSRF protection. They cannot be disabled without breaking core functionality.
          </p>
        </div>
        <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {['Session token — keeps you logged in securely across page loads',
            'CSRF token — protects form submissions from cross-site attacks',
            'Cookie consent flag — remembers your preferences'].map(item => (
            <li key={item} style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '0.5rem', listStyleType: 'disc' }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Analytics */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Analytics Cookies</h2>
        <div style={cardStyle}>
          <div style={badgeStyle('blue')}>Optional</div>
          <p style={{ ...paraStyle, marginBottom: 0 }}>
            Analytics cookies help us understand how developers use APIverse — which features are popular,
            where people get stuck, and what to build next. All data is anonymized and aggregated; we
            cannot identify individual users from analytics data.
          </p>
        </div>
        <p style={paraStyle}>
          We use privacy-respecting analytics that do not fingerprint users or share data with advertising networks.
          You can opt out at any time using the preference manager below.
        </p>
      </div>

      {/* Preference */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Preference Cookies</h2>
        <div style={cardStyle}>
          <div style={badgeStyle('amber')}>Optional</div>
          <p style={{ ...paraStyle, marginBottom: 0 }}>
            Preference cookies remember your settings between sessions — your chosen AI provider in the Playground,
            editor theme, and panel layout. Disabling these means your settings won&apos;t persist when you return.
          </p>
        </div>
      </div>

      {/* Third party */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Third-Party Cookies</h2>
        <p style={paraStyle}>
          APIverse does not embed third-party advertising or social media scripts that place their own cookies.
          GitHub OAuth may set a cookie during the sign-in flow, governed by{' '}
          <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
            GitHub&apos;s Privacy Statement
          </a>.
        </p>
      </div>

      {/* Manage */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Manage Your Preferences
        </h2>
        <p style={{ ...paraStyle, marginBottom: '1.5rem' }}>
          You can update your cookie preferences at any time. Essential cookies cannot be disabled.
        </p>
        {saved ? (
          <div style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.25rem',
            color: 'var(--accent-success)',
            fontWeight: '500',
            fontSize: '0.9rem',
          }}>
            Preferences saved successfully.
          </div>
        ) : (
          <button
            onClick={() => setSaved(true)}
            style={{
              background: 'var(--gradient-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 2rem',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Manage Preferences
          </button>
        )}
        <p style={{ ...paraStyle, marginTop: '1rem', marginBottom: 0, fontSize: '0.8rem' }}>
          For more details, see our <Link href="/privacy" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
