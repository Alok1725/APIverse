'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PROVIDER_CONFIG = {
  gemini: {
    label: 'Gemini',
    icon: '⚡',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.3)',
    description: 'Google Gemini 1.5 Flash',
    tooltip: 'Powered by Google Gemini 1.5 Flash — multimodal AI with 1M token context.',
  },
  groq: {
    label: 'Groq',
    icon: '⚡',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    description: 'Groq · LLaMA 3.1 8B',
    tooltip: "Powered by Groq's LPU inference engine — the fastest AI inference available.",
  },
  ollama: {
    label: 'Ollama',
    icon: '🏠',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    description: 'Ollama · Local LLM',
    tooltip: 'Powered by a locally-running Ollama model. Your data never leaves your machine.',
  },
  mock: {
    label: 'Mock',
    icon: '🔧',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.3)',
    description: 'Mock Provider · Offline',
    tooltip: 'Using pre-computed mock responses. Add an AI API key to enable live AI features.',
  },
}

export default function ProviderBadge({ provider, latency, className = '', showTooltip = true }) {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const config = PROVIDER_CONFIG[provider]

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => showTooltip && setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
      className={className}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 10px',
          borderRadius: 9999,
          fontSize: 11,
          fontWeight: 600,
          background: config.bg,
          border: `1px solid ${config.border}`,
          color: config.color,
          cursor: showTooltip ? 'default' : 'inherit',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: 12 }}>{config.icon}</span>
        <span>{config.label}</span>
        {latency !== undefined && (
          <span
            style={{
              fontSize: 10,
              opacity: 0.7,
              fontWeight: 400,
              marginLeft: 2,
            }}
          >
            {latency}ms
          </span>
        )}
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltipVisible && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 200,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                background: 'rgba(15, 15, 26, 0.98)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 10,
                padding: '10px 14px',
                minWidth: 200,
                maxWidth: 260,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 16 }}>{config.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: config.color }}>
                  {config.description}
                </span>
              </div>

              <p
                style={{
                  fontSize: 11,
                  color: 'rgba(148, 163, 184, 0.9)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {config.tooltip}
              </p>

              {latency !== undefined && (
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    color: 'rgba(148, 163, 184, 0.7)',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: latency < 200 ? '#10b981' : latency < 500 ? '#f59e0b' : '#ef4444',
                      display: 'inline-block',
                    }}
                  />
                  {latency}ms response time
                </div>
              )}
            </div>

            {/* Arrow */}
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid rgba(255, 255, 255, 0.1)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
