/**
 * AI Composition Studio backend.
 * Routes workflow descriptions through the AI gateway and returns
 * a structured pipeline of steps with icons and colors.
 */

import { aiGateway } from '@/lib/ai/gateway'

const API_META = {
  Stripe:      { icon: '💳', color: '#10b981' },
  Razorpay:   { icon: '💰', color: '#06b6d4' },
  PayPal:     { icon: '🅿️', color: '#3b82f6' },
  Auth0:      { icon: '🔐', color: '#6366f1' },
  Clerk:      { icon: '🔑', color: '#8b5cf6' },
  SendGrid:   { icon: '📧', color: '#f59e0b' },
  Resend:     { icon: '✉️', color: '#6366f1' },
  Twilio:     { icon: '📱', color: '#ef4444' },
  OpenAI:     { icon: '🤖', color: '#10b981' },
  Anthropic:  { icon: '🧠', color: '#8b5cf6' },
  Gemini:     { icon: '✨', color: '#06b6d4' },
  Groq:       { icon: '⚡', color: '#f59e0b' },
  'Hugging Face': { icon: '🤗', color: '#f59e0b' },
  'Google Maps':  { icon: '🗺️', color: '#10b981' },
  Mapbox:     { icon: '📍', color: '#6366f1' },
  Cloudinary: { icon: '☁️', color: '#06b6d4' },
  Supabase:   { icon: '🗄️', color: '#06b6d4' },
  Algolia:    { icon: '🔍', color: '#3b82f6' },
  Mixpanel:   { icon: '📊', color: '#8b5cf6' },
  GitHub:     { icon: '🐙', color: '#374151' },
  Vercel:     { icon: '▲', color: '#374151' },
  Firebase:   { icon: '🔥', color: '#ef4444' },
  PostHog:    { icon: '🦔', color: '#f59e0b' },
  Replicate:  { icon: '🎨', color: '#8b5cf6' },
  Mailgun:    { icon: '📮', color: '#f59e0b' },
  Trigger:    { icon: '⚡', color: '#6366f1' },
  Action:     { icon: '▶️', color: '#10b981' },
}

function getApiMeta(apiName) {
  const key = Object.keys(API_META).find(
    (k) => apiName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(apiName.toLowerCase())
  )
  return key ? API_META[key] : { icon: '🔌', color: '#6366f1' }
}

function normalizeWorkflow(raw) {
  // The AI gateway may return different shapes — normalise to our UI format
  if (!raw) return null

  let steps = []

  if (Array.isArray(raw)) {
    steps = raw
  } else if (raw.steps && Array.isArray(raw.steps)) {
    steps = raw.steps
  } else {
    return null
  }

  return steps
    .filter((s) => s && (s.api || s.name))
    .map((s) => {
      const apiName = s.api || s.name || 'API'
      const meta = getApiMeta(apiName)
      return {
        icon: s.icon || meta.icon,
        api: apiName,
        action: s.action || s.description || 'Execute',
        desc: s.description || s.desc || s.trigger || '',
        color: s.color || meta.color,
      }
    })
    .slice(0, 8) // Cap at 8 steps for UI
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { description } = body
  if (!description?.trim()) {
    return Response.json({ error: 'description is required' }, { status: 400 })
  }

  try {
    const { result, provider } = await aiGateway.composeWorkflow(description.trim())
    const steps = normalizeWorkflow(result)

    if (!steps || steps.length === 0) {
      return Response.json(
        { error: 'Could not generate pipeline — please try a more specific description' },
        { status: 422 }
      )
    }

    return Response.json({
      steps,
      name: result?.name || 'Custom Pipeline',
      description: result?.description || description,
      provider,
    })
  } catch (err) {
    console.error('[/api/compose] workflow generation failed:', err.message)
    return Response.json(
      { error: 'AI pipeline generation failed. Please try again.' },
      { status: 500 }
    )
  }
}
