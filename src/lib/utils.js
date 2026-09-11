export const pad = n => String(n).padStart(2, '0')

export function toLocalInputValue(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function sessionStartValue(session) {
  if (!session || typeof session !== 'object') return ''
  return session.startAt || session.startTime || ''
}

export function sessionEndValue(session) {
  if (!session || typeof session !== 'object') return ''
  return session.endAt || session.endTime || ''
}

function asDate(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const raw = String(value).trim()
  if (/^\d{1,2}:\d{2}$/.test(raw)) {
    const [h, m] = raw.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return d
  }
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatTime(value) {
  const d = asDate(value)
  if (!d) return ''
  return new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false }).format(d)
}

export function formatDate(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

export function compactDate(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short' }).format(d)
}

export function sessionState(session, now = new Date(), liveState = {}) {
  if (!session || typeof session !== 'object') return 'upcoming'
  if (liveState?.forcedSessionId === session.id) return 'live'
  if (session.manualStatus && session.manualStatus !== 'auto') return session.manualStatus

  const start = asDate(sessionStartValue(session))
  const end = asDate(sessionEndValue(session))
  if (!start || !end) return 'upcoming'

  if (now >= start && now <= end) return 'live'
  if (now > end) return 'finished'
  const mins = (start - now) / 60000
  if (mins > 0 && mins <= 15) return 'soon'
  return 'upcoming'
}

export function getLiveSession(sessions, now = new Date(), liveState = {}) {
  const safeSessions = Array.isArray(sessions) ? sessions.filter(s => s && typeof s === 'object') : []
  if (liveState?.forcedSessionId) {
    const forcedRealtime = safeSessions.find(s => s.id === liveState.forcedSessionId)
    if (forcedRealtime) return forcedRealtime
  }
  const forced = safeSessions.find(s => s.manualStatus === 'live')
  if (forced) return forced
  return safeSessions.find(s => sessionState(s, now, liveState) === 'live') || null
}

export function getNextSession(sessions, now = new Date()) {
  const safeSessions = Array.isArray(sessions) ? sessions.filter(s => s && typeof s === 'object') : []
  return [...safeSessions]
    .filter(s => {
      const start = asDate(sessionStartValue(s))
      return start && !['cancelled', 'finished'].includes(sessionState(s, now)) && start > now
    })
    .sort((a, b) => {
      const av = asDate(sessionStartValue(a))?.getTime() ?? Number.MAX_SAFE_INTEGER
      const bv = asDate(sessionStartValue(b))?.getTime() ?? Number.MAX_SAFE_INTEGER
      return av - bv
    })[0] || null
}

export function sortSessions(sessions) {
  const safeSessions = Array.isArray(sessions) ? sessions.filter(s => s && typeof s === 'object') : []
  return [...safeSessions].sort((a, b) => {
    const av = asDate(sessionStartValue(a))?.getTime() ?? Number.MAX_SAFE_INTEGER
    const bv = asDate(sessionStartValue(b))?.getTime() ?? Number.MAX_SAFE_INTEGER
    return av - bv
  })
}

export function sortQuestions(questions) {
  return [...(Array.isArray(questions) ? questions : [])].filter(Boolean).sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1
    if ((b.voteCount || 0) !== (a.voteCount || 0)) return (b.voteCount || 0) - (a.voteCount || 0)
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })
}

export function initials(name = '') {
  return String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(v => v[0]).join('').toUpperCase() || 'SP'
}

export function slugId(prefix = 'item') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}
