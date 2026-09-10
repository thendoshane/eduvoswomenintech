export const pad = n => String(n).padStart(2, '0')

export function toLocalInputValue(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatTime(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
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
  if (!session) return 'upcoming'
  if (liveState?.forcedSessionId === session.id) return 'live'
  if (session.manualStatus && session.manualStatus !== 'auto') return session.manualStatus
  const start = new Date(session.startAt)
  const end = new Date(session.endAt)
  if (now >= start && now <= end) return 'live'
  if (now > end) return 'finished'
  const mins = (start - now) / 60000
  if (mins > 0 && mins <= 15) return 'soon'
  return 'upcoming'
}

export function getLiveSession(sessions, now = new Date(), liveState = {}) {
  if (liveState?.forcedSessionId) {
    const forcedRealtime = sessions.find(s => s.id === liveState.forcedSessionId)
    if (forcedRealtime) return forcedRealtime
  }
  const forced = sessions.find(s => s.manualStatus === 'live')
  if (forced) return forced
  return sessions.find(s => sessionState(s, now, liveState) === 'live') || null
}

export function getNextSession(sessions, now = new Date()) {
  return [...sessions]
    .filter(s => !['cancelled', 'finished'].includes(sessionState(s, now)) && new Date(s.startAt) > now)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))[0] || null
}

export function sortSessions(sessions) {
  return [...sessions].sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
}

export function sortQuestions(questions) {
  return [...questions].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1
    if ((b.voteCount || 0) !== (a.voteCount || 0)) return (b.voteCount || 0) - (a.voteCount || 0)
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })
}

export function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(v => v[0]).join('').toUpperCase() || 'SP'
}

export function slugId(prefix = 'item') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}
