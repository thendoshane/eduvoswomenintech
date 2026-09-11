const DEFAULT_ALLOWED_ORIGINS = [
  'https://wit2026.web.app',
  'https://wit2026.firebaseapp.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]

function listEnv(name, fallback = []) {
  const raw = String(process.env[name] || '').trim()
  return raw ? raw.split(',').map(v => v.trim()).filter(Boolean) : fallback
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function clean(value, max = 1000) {
  return String(value || '').trim().slice(0, max)
}

function isEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
}

function applyCors(req, res) {
  const allowed = listEnv('ALLOWED_ORIGINS', DEFAULT_ALLOWED_ORIGINS)
  const origin = String(req.headers.origin || '')
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  return !origin || allowed.includes(origin)
}

async function sendResendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM || 'Women in Tech Summit <onboarding@resend.dev>'
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured')

  const body = { from, to: [to], subject, html }
  if (replyTo && isEmail(replyTo)) body.reply_to = replyTo

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data?.message || `Resend returned ${response.status}`)
    error.status = response.status
    throw error
  }
  return data
}

export default async function handler(req, res) {
  const originAllowed = applyCors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed' })
  if (!originAllowed) return res.status(403).json({ ok: false, message: 'Origin not allowed' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const kind = clean(body.kind, 30)

    if (kind === 'error') {
      const to = process.env.ERROR_REPORT_TO || 'thendo.siphuma@eduvos.com'
      const context = clean(body.context, 100) || 'application'
      const friendly = clean(body.friendlyMessage, 500)
      const technical = clean(body.technicalMessage, 3000)
      const code = clean(body.code, 200)
      const url = clean(body.url, 800)
      const userAgent = clean(body.userAgent, 1000)
      const extra = clean(body.extra, 3000)

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:720px;margin:auto;color:#173a67">
          <h2>WIT2026 system error</h2>
          <p><strong>Context:</strong> ${escapeHtml(context)}</p>
          <p><strong>User message:</strong> ${escapeHtml(friendly)}</p>
          <p><strong>Technical message:</strong><br>${escapeHtml(technical)}</p>
          ${code ? `<p><strong>Code:</strong> ${escapeHtml(code)}</p>` : ''}
          ${url ? `<p><strong>Page:</strong> ${escapeHtml(url)}</p>` : ''}
          ${extra ? `<p><strong>Extra:</strong><br>${escapeHtml(extra)}</p>` : ''}
          ${userAgent ? `<p style="font-size:12px;color:#666"><strong>Browser:</strong> ${escapeHtml(userAgent)}</p>` : ''}
          <p style="font-size:12px;color:#666">Sent automatically by the Eduvos Women in Tech Summit website.</p>
        </div>`

      const result = await sendResendEmail({
        to,
        subject: `[WIT2026 Error] ${context}`,
        html
      })
      return res.status(200).json({ ok: true, id: result?.id || '' })
    }

    if (kind === 'contact') {
      const recipient = clean(body.to, 200).toLowerCase()
      const allowedRecipients = listEnv('CONTACT_RECIPIENTS', [
        'siba.maphukata@eduvos.com',
        'danica.heusdens@eduvos.com',
        'yvonne.fayeti@eduvos.com',
        'siyaxolisa.dayisi@eduvos.com'
      ]).map(v => v.toLowerCase())

      if (!isEmail(recipient) || !allowedRecipients.includes(recipient)) {
        return res.status(400).json({ ok: false, message: 'Recipient is not approved' })
      }

      const contactName = clean(body.contactName, 120) || 'Event Team'
      const subjectType = clean(body.subject, 160) || 'Event assistance'
      const where = clean(body.where, 240)
      const message = clean(body.message, 2000)
      const replyTo = clean(body.replyTo, 200)
      if (message.length < 2) return res.status(400).json({ ok: false, message: 'Message is required' })

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:720px;margin:auto;color:#173a67">
          <h2>Women in Tech Summit attendee message</h2>
          <p>Hello ${escapeHtml(contactName)},</p>
          <p><strong>Request:</strong> ${escapeHtml(subjectType)}</p>
          ${where ? `<p><strong>Location / session:</strong> ${escapeHtml(where)}</p>` : ''}
          ${replyTo ? `<p><strong>Reply contact:</strong> ${escapeHtml(replyTo)}</p>` : ''}
          <div style="background:#f5f7fb;border-left:4px solid #173a67;padding:16px;margin:18px 0;white-space:pre-wrap">${escapeHtml(message)}</div>
          <p style="font-size:12px;color:#666">Sent from the Eduvos Women in Tech Summit website.</p>
        </div>`

      const result = await sendResendEmail({
        to: recipient,
        subject: `Women in Tech Summit: ${subjectType}`,
        html,
        replyTo: isEmail(replyTo) ? replyTo : undefined
      })
      return res.status(200).json({ ok: true, id: result?.id || '' })
    }

    return res.status(400).json({ ok: false, message: 'Unsupported email type' })
  } catch (error) {
    console.error('send-email failed', error)
    return res.status(error?.status || 500).json({ ok: false, message: 'Email could not be sent' })
  }
}
