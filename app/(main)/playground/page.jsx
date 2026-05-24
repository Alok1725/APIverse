'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import styles from './playground.module.css'

const METHOD_COLORS = {
  GET: '#10b981',
  POST: '#6366f1',
  PUT: '#f59e0b',
  DELETE: '#ef4444',
  PATCH: '#8b5cf6',
}

const QUICK_EXAMPLES = [
  {
    label: 'JSONPlaceholder · Posts',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: [{ key: 'Accept', value: 'application/json' }],
    body: '',
    auth: { type: 'none', value: '' },
  },
  {
    label: 'JSONPlaceholder · Create',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    body: JSON.stringify({ title: 'Hello APIverse', body: 'Testing from playground', userId: 1 }, null, 2),
    auth: { type: 'none', value: '' },
  },
  {
    label: 'GitHub · Public User',
    method: 'GET',
    url: 'https://api.github.com/users/vercel',
    headers: [{ key: 'Accept', value: 'application/vnd.github.v3+json' }],
    body: '',
    auth: { type: 'none', value: '' },
  },
]


function syntaxHighlight(json) {
  if (typeof json !== 'string') return json
  return json
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
      let cls = styles.jsonNumber
      if (/^"/.test(match)) {
        if (/:$/.test(match)) cls = styles.jsonKey
        else cls = styles.jsonString
      } else if (/true|false/.test(match)) cls = styles.jsonBool
      else if (/null/.test(match)) cls = styles.jsonNull
      return `<span class="${cls}">${match}</span>`
    })
}

export default function PlaygroundPage() {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts')
  const [activeTab, setActiveTab] = useState('Headers')
  const [headers, setHeaders] = useState([{ key: 'Accept', value: 'application/json' }])
  const [body, setBody] = useState('')
  const [auth, setAuth] = useState({ type: 'none', value: '' })
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [showRespHeaders, setShowRespHeaders] = useState(false)
  const [copied, setCopied] = useState(false)
  const [quickExample, setQuickExample] = useState('')

  function addHeader() {
    setHeaders(prev => [...prev, { key: '', value: '' }])
  }

  function removeHeader(i) {
    setHeaders(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateHeader(i, field, val) {
    setHeaders(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: val } : h))
  }

  function applyQuickExample(label) {
    const ex = QUICK_EXAMPLES.find(e => e.label === label)
    if (!ex) return
    setMethod(ex.method)
    setUrl(ex.url)
    setHeaders(ex.headers)
    setBody(ex.body)
    setAuth(ex.auth)
    setQuickExample(label)
    setResponse(null)
  }

  const sendRequest = useCallback(async () => {
    if (!url.trim()) return
    setLoading(true)
    setResponse(null)

    // Build headers object from key-value pairs
    const headersObj = {}
    for (const h of headers) {
      if (h.key.trim() && h.value.trim()) headersObj[h.key.trim()] = h.value.trim()
    }

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          url: url.trim(),
          headers: headersObj,
          body: body.trim() || undefined,
          auth,
        }),
      })
      const data = await res.json()
      setResponse(data)
    } catch {
      setResponse({
        status: 503,
        statusText: 'Service Unavailable',
        time: 0,
        size: '0 B',
        body: JSON.stringify({ error: 'Could not reach proxy. Please check your connection.' }, null, 2),
        headers: {},
      })
    } finally {
      setLoading(false)
    }
  }, [url, method, headers, body, auth])

  function copyResponse() {
    if (response?.body) {
      navigator.clipboard.writeText(response.body)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function downloadResponse() {
    if (!response?.body) return
    const blob = new Blob([response.body], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'response.json'
    a.click()
  }

  const statusColor = response
    ? response.status < 300 ? '#10b981' : response.status < 500 ? '#f59e0b' : '#ef4444'
    : null

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={styles.pageTitle}>API Playground</h1>
          <p className={styles.pageSubtitle}>Build, test, and debug API requests in real-time.</p>
        </motion.div>

        <div className={styles.quickExampleWrap}>
          <label className={styles.quickLabel}>Quick Examples</label>
          <select
            className={styles.quickSelect}
            value={quickExample}
            onChange={e => applyQuickExample(e.target.value)}
          >
            <option value="">Select example...</option>
            {QUICK_EXAMPLES.map(ex => (
              <option key={ex.label} value={ex.label}>{ex.label}</option>
            ))}
          </select>
        </div>
      </div>

      <motion.div
        className={styles.layout}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* LEFT PANEL */}
        <div className={styles.leftPanel}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Request</span>
            </div>

            {/* Method + URL */}
            <div className={styles.requestLine}>
              <select
                className={styles.methodSelect}
                value={method}
                onChange={e => setMethod(e.target.value)}
                style={{ color: METHOD_COLORS[method], borderColor: METHOD_COLORS[method] + '40' }}
              >
                {Object.keys(METHOD_COLORS).map(m => (
                  <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>{m}</option>
                ))}
              </select>
              <input
                className={styles.urlInput}
                type="text"
                placeholder="https://api.example.com/v1/endpoint"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendRequest()}
              />
            </div>

            {/* Tabs */}
            <div className={styles.innerTabs}>
              {['Headers', 'Body', 'Auth'].map(t => (
                <button
                  key={t}
                  className={`${styles.innerTab} ${activeTab === t ? styles.innerTabActive : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Headers Panel */}
            {activeTab === 'Headers' && (
              <div className={styles.headersPanel}>
                {headers.map((h, i) => (
                  <div key={i} className={styles.headerRow}>
                    <input
                      className={styles.headerInput}
                      placeholder="Key"
                      value={h.key}
                      onChange={e => updateHeader(i, 'key', e.target.value)}
                    />
                    <input
                      className={styles.headerInput}
                      placeholder="Value"
                      value={h.value}
                      onChange={e => updateHeader(i, 'value', e.target.value)}
                    />
                    <button className={styles.removeBtn} onClick={() => removeHeader(i)}>✕</button>
                  </div>
                ))}
                <button className={styles.addBtn} onClick={addHeader}>+ Add Header</button>
              </div>
            )}

            {/* Body Panel */}
            {activeTab === 'Body' && (
              <div className={styles.bodyPanel}>
                <div className={styles.bodyToolbar}>
                  <span className={styles.bodyLabel}>JSON</span>
                  <button
                    className={styles.formatBtn}
                    onClick={() => {
                      try {
                        setBody(JSON.stringify(JSON.parse(body), null, 2))
                      } catch {}
                    }}
                  >
                    Format
                  </button>
                </div>
                <textarea
                  className={styles.bodyTextarea}
                  placeholder={'{\n  "key": "value"\n}'}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  spellCheck={false}
                />
              </div>
            )}

            {/* Auth Panel */}
            {activeTab === 'Auth' && (
              <div className={styles.authPanel}>
                <div className={styles.authTypeRow}>
                  <label className={styles.authLabel}>Auth Type</label>
                  <select
                    className={styles.authSelect}
                    value={auth.type}
                    onChange={e => setAuth(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="none">None</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="apikey">API Key</option>
                    <option value="basic">Basic Auth</option>
                  </select>
                </div>
                {auth.type !== 'none' && (
                  <div className={styles.authValueWrap}>
                    <label className={styles.authLabel}>
                      {auth.type === 'bearer' ? 'Token' : auth.type === 'apikey' ? 'API Key' : 'Credentials'}
                    </label>
                    <input
                      className={styles.authInput}
                      type="password"
                      placeholder={auth.type === 'bearer' ? 'your_token_here' : auth.type === 'apikey' ? 'sk_live_...' : 'username:password'}
                      value={auth.value}
                      onChange={e => setAuth(prev => ({ ...prev, value: e.target.value }))}
                    />
                  </div>
                )}
                {auth.type === 'none' && (
                  <p className={styles.authNote}>No authentication will be sent with this request.</p>
                )}
              </div>
            )}

            {/* Send Button */}
            <div className={styles.sendWrap}>
              <button
                className={styles.sendBtn}
                onClick={sendRequest}
                disabled={loading || !url.trim()}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner} />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.rightPanel}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Response</span>
              {response && (
                <div className={styles.respMeta}>
                  <span className={styles.statusBadge} style={{ background: statusColor + '20', color: statusColor, borderColor: statusColor + '40' }}>
                    {response.status} {response.statusText}
                  </span>
                  <span className={styles.metaStat}>{response.time}ms</span>
                  <span className={styles.metaStat}>{response.size}</span>
                </div>
              )}
            </div>

            {!response && !loading && (
              <div className={styles.emptyResponse}>
                <div className={styles.emptyRespIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </div>
                <p className={styles.emptyRespText}>Send a request to see the response here.</p>
              </div>
            )}

            {loading && (
              <div className={styles.emptyResponse}>
                <div className={styles.loadingWave}>
                  {[0,1,2,3].map(i => <span key={i} className={styles.wave} style={{ animationDelay: `${i * 0.12}s` }} />)}
                </div>
                <p className={styles.emptyRespText}>Sending request...</p>
              </div>
            )}

            {response && !loading && (
              <>
                <div className={styles.respActions}>
                  <button className={styles.respActionBtn} onClick={copyResponse}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                  <button className={styles.respActionBtn} onClick={downloadResponse}>
                    Download
                  </button>
                </div>

                <div className={styles.respBody}>
                  <pre
                    className={styles.respPre}
                    dangerouslySetInnerHTML={{ __html: syntaxHighlight(response.body) }}
                  />
                </div>

                <div className={styles.respHeadersAccordion}>
                  <button
                    className={styles.accordionBtn}
                    onClick={() => setShowRespHeaders(!showRespHeaders)}
                  >
                    <span>Response Headers ({Object.keys(response.headers).length})</span>
                    <span>{showRespHeaders ? '▲' : '▼'}</span>
                  </button>
                  {showRespHeaders && (
                    <motion.div
                      className={styles.accordionContent}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2 }}
                    >
                      {Object.entries(response.headers).map(([k, v]) => (
                        <div key={k} className={styles.respHeaderRow}>
                          <span className={styles.respHeaderKey}>{k}</span>
                          <span className={styles.respHeaderVal}>{v}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Note */}
      <motion.div
        className={styles.notePanel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>Requests are proxied server-side to avoid CORS issues. Your API keys are never stored or logged.</span>
      </motion.div>
    </div>
  )
}
