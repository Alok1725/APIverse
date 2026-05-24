'use client'

import { useState } from 'react'
import styles from './contact.module.css'

const FAQ = [
  {
    q: 'Is APIverse free to use?',
    a: 'Yes, APIverse is completely free during the current beta period. We plan to introduce optional paid tiers for teams and power users in the future, but a generous free tier will always exist.'
  },
  {
    q: 'How do I add my API to the APIverse catalog?',
    a: 'Currently, APIs are manually curated by our team. Submit your API details via this contact form with the subject "API Submission" and we will review it within a week.'
  },
  {
    q: 'Can I self-host APIverse?',
    a: 'Absolutely — APIverse is open source under the MIT License. Clone the repository, set up your environment variables, and you have a fully functional private instance. Check the README for setup instructions.'
  },
  {
    q: 'Which AI providers are supported in the Playground?',
    a: 'The Playground currently supports Google Gemini, Groq (fast cloud inference), and Ollama (local models). You can switch providers with a single click, and your API key stays in your browser session only.'
  },
]

const INFO = [
  { icon: '✉️', label: 'Email', value: 'alok170903@gmail.com', href: 'mailto:alok170903@gmail.com' },
  { icon: '🐙', label: 'GitHub', value: 'github.com/Alok1725', href: 'https://github.com/Alok1725' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setSent(true)
    } catch (err) {
      setSendError(err.message)
    } finally {
      setSending(false)
    }
  }

  function toggleFaq(i) {
    setOpenFaq(prev => (prev === i ? null : i))
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroHeading}>Contact Us</h1>
        <p className={styles.heroSub}>
          Got a question, bug report, or partnership idea? We&apos;d love to hear from you.
        </p>
      </section>

      <div className={styles.main}>
        <div className={styles.grid}>
          {/* Form */}
          <div className={styles.formSection}>
            <h2>Send a message</h2>
            {sent ? (
              <div className={styles.successMsg}>
                Message received! We&apos;ll get back to you within 24 hours.
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Name</label>
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
                    <label className={styles.label}>Email</label>
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
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Subject</label>
                  <select
                    name="subject"
                    className={styles.select}
                    value={form.subject}
                    onChange={handleChange}
                  >
                    <option value="General">General Inquiry</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Partnership">Partnership</option>
                    <option value="API Submission">API Submission</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Message</label>
                  <textarea
                    name="message"
                    className={styles.textarea}
                    placeholder="Describe your question or feedback in detail…"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                {sendError && (
                  <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{sendError}</div>
                )}
                <button type="submit" className={styles.sendBtn} disabled={sending}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m22 2-7 20-4-9-9-4 20-7z"/>
                    <path d="M22 2 11 13"/>
                  </svg>
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className={styles.infoSection}>
            <h2>Get in touch</h2>
            <div className={styles.infoCards}>
              {INFO.map((item) => (
                <a key={item.label} href={item.href} className={styles.infoCard} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                  <div className={styles.infoIcon}>{item.icon}</div>
                  <div className={styles.infoBody}>
                    <div className={styles.infoLabel}>{item.label}</div>
                    <div className={styles.infoValue}>{item.value}</div>
                  </div>
                </a>
              ))}
            </div>
            <div className={styles.responseTime}>
              ⚡ Response time: Usually within 24 hours
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className={styles.faq}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {FAQ.map((item, i) => (
              <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.open : ''}`}>
                <button className={styles.faqQuestion} onClick={() => toggleFaq(i)}>
                  {item.q}
                  <svg
                    className={`${styles.faqChevron} ${openFaq === i ? styles.rotated : ''}`}
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div className={styles.faqAnswer}>{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
