'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './signup.module.css'

export default function SignUpPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const reg = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email }),
      })
      const data = await reg.json()
      if (!reg.ok) {
        if (reg.status === 409) {
          setError('An account with this email already exists. Sign in instead.')
        } else {
          setError(data.error || 'Could not create account. Please try again.')
        }
        setLoading(false)
        return
      }
      const res = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (res?.ok) {
        window.location.href = '/dashboard'
      } else {
        setError('Account created but sign-in failed. Please sign in manually.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <Link href="/" className={styles.backLink}>
        ← Back to APIverse
      </Link>

      <div className={styles.card}>
        <div className={styles.logo}>
          <Image src="/logo.png" alt="APIverse" width={120} height={36} className={styles.logoImg} />
        </div>

        <h1 className={styles.heading}>Create your account</h1>
        <p className={styles.subtitle}>Start exploring APIs in seconds — it&apos;s free</p>

        {error && (
          <div className={styles.errorBanner}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>
              {error.replace('Sign in instead.', '')}
              {error.includes('Sign in instead') && (
                <Link href="/signin" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign in instead →</Link>
              )}
            </span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Full name</label>
            <input
              type="text"
              name="name"
              className={styles.input}
              placeholder="APIverse User"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <input
              type="email"
              name="email"
              className={styles.input}
              placeholder="api@verse.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              className={styles.input}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
            />
            <span className={styles.passwordHint}>Use 8+ characters with a mix of letters and numbers</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm password</label>
            <input
              type="password"
              name="confirm"
              className={styles.input}
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className={styles.terms}>
            By creating an account you agree to our{' '}
            <Link href="/terms">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy">Privacy Policy</Link>
          </p>
        </form>

        <p className={styles.signinNote}>
          Already have an account?{' '}
          <Link href="/signin">Sign in</Link>
        </p>
      </div>

    </div>
  )
}
