import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { subscribeCore } from './lib/dataService'
import { getLiveSession, getNextSession, sortSessions } from './lib/utils'

const AppDataContext = createContext(null)
const CACHE_KEY = 'wit_live_core_cache_v1'

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') } catch { return null }
}

export function AppDataProvider({ children }) {
  const cached = readCache()
  const [event, setEvent] = useState(cached?.event || null)
  const [sessions, setSessions] = useState(cached?.sessions || [])
  const [speakers, setSpeakers] = useState(cached?.speakers || [])
  const [announcements, setAnnouncements] = useState(cached?.announcements || [])
  const [liveState, setLiveState] = useState(cached?.liveState || {})
  const [loading, setLoading] = useState(!cached)
  const [clock, setClock] = useState(Date.now())

  useEffect(() => {
    const unsub = subscribeCore(next => {
      if (next.event !== undefined) setEvent(next.event)
      if (next.sessions) setSessions(next.sessions)
      if (next.speakers) setSpeakers(next.speakers)
      if (next.announcements) setAnnouncements(next.announcements)
      if (next.liveState !== undefined) setLiveState(next.liveState || {})
      if (next.event) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      }
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  const orderedSessions = useMemo(() => sortSessions(sessions), [sessions])
  const now = useMemo(() => new Date(clock), [clock])
  const liveSession = useMemo(() => getLiveSession(orderedSessions, now, liveState), [orderedSessions, now, liveState])
  const nextSession = useMemo(() => getNextSession(orderedSessions, now), [orderedSessions, now])
  const activeAnnouncements = useMemo(
    () => [...announcements].filter(a => a.active !== false).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [announcements]
  )

  const speakerMap = useMemo(() => Object.fromEntries(speakers.map(s => [s.id, s])), [speakers])

  const value = {
    event,
    sessions: orderedSessions,
    speakers,
    announcements: activeAnnouncements,
    loading,
    now,
    liveSession,
    liveState,
    nextSession,
    speakerMap
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const value = useContext(AppDataContext)
  if (!value) throw new Error('useAppData must be used inside AppDataProvider')
  return value
}
