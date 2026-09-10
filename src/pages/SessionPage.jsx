import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppData } from '../context'
import SpeakerAvatar from '../components/SpeakerAvatar'
import Icon from '../components/Icon'
import EmptyState from '../components/EmptyState'
import { formatTime, sessionState } from '../lib/utils'

const FAV_KEY = 'wit_live_favourites'

export default function SessionPage() {
  const { id } = useParams()
  const { sessions, speakerMap, now, liveState } = useAppData()
  const session = sessions.find(s => s.id === id)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try { setSaved((JSON.parse(localStorage.getItem(FAV_KEY) || '[]')).includes(id)) } catch { setSaved(false) }
  }, [id])

  if (!session) return <main className="page"><EmptyState title="Session not found" action={<Link className="btn btn-black" to="/programme">Back to programme</Link>}/></main>
  const speakers = (session.speakerIds || []).map(sid => speakerMap[sid]).filter(Boolean)
  const state = sessionState(session, now, liveState)

  function toggleSaved() {
    let list = []
    try { list = JSON.parse(localStorage.getItem(FAV_KEY) || '[]') } catch { /* ignore */ }
    list = list.includes(id) ? list.filter(v => v !== id) : [...list, id]
    localStorage.setItem(FAV_KEY, JSON.stringify(list))
    setSaved(list.includes(id))
  }

  return (
    <main className="page detail-page">
      <Link to="/programme" className="back-link"><Icon name="back" size={18}/> Programme</Link>
      <section className="session-detail-hero">
        <div className="session-meta-row">
          {state === 'live' && <span className="status-pill live"><i/> Live now</span>}
          {state === 'soon' && <span className="status-pill">Starting soon</span>}
          {state === 'delayed' && <span className="status-pill">Delayed</span>}
          {state === 'cancelled' && <span className="status-pill">Cancelled</span>}
          <span className="small-label">{session.type}</span>
        </div>
        <h1>{session.title}</h1>
        <div className="session-detail-meta"><span><Icon name="clock" size={18}/>{formatTime(session.startAt)}–{formatTime(session.endAt)}</span>{session.room && <span><Icon name="pin" size={18}/>{session.room}</span>}</div>
        <button className={`save-button ${saved ? 'saved' : ''}`} onClick={toggleSaved}><Icon name="heart" size={18}/> {saved ? 'Saved to my programme' : 'Save to my programme'}</button>
      </section>

      {speakers.length > 0 && <section className="detail-copy"><h2>{speakers.length > 1 ? 'Speakers' : 'Speaker'}</h2><div className="speaker-list-inline">{speakers.map(s => <Link to={`/speakers/${s.id}`} key={s.id} className="inline-speaker"><SpeakerAvatar speaker={s}/><div><strong>{s.name}</strong><span>{s.title}{s.organisation ? ` · ${s.organisation}` : ''}</span></div><Icon name="arrow" size={18}/></Link>)}</div></section>}

      <section className="detail-copy"><h2>About this session</h2><p>{session.description || 'Session details will be added by the organiser.'}</p></section>

      <section className="session-actions-panel">
        {session.qnaEnabled && <Link className="btn btn-black" to={`/qna/${session.id}`}><Icon name="message" size={18}/> Ask a question</Link>}
        {session.streamUrl && <a className="btn btn-outline" href={session.streamUrl} target="_blank" rel="noreferrer"><Icon name="external" size={18}/> Watch stream</a>}
      </section>
    </main>
  )
}
