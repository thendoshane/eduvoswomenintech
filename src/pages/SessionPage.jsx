import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppData } from '../context'
import SpeakerAvatar from '../components/SpeakerAvatar'
import Icon from '../components/Icon'
import EmptyState from '../components/EmptyState'
import { formatTime, sessionState, sessionStartValue, sessionEndValue } from '../lib/utils'
import { normalizeExternalUrl, speakerSlug } from '../lib/links'

const FAV_KEY = 'wit_live_favourites'

export default function SessionPage() {
  const { id } = useParams()
  const { sessions, speakerMap, now, liveState, event } = useAppData()
  const session = sessions.find(s => s.id === id)
  const [saved, setSaved] = useState(false)
  useEffect(() => {try { setSaved((JSON.parse(localStorage.getItem(FAV_KEY) || '[]')).includes(id)) } catch { setSaved(false) }}, [id])
  if (!session) return <main className="page"><EmptyState title="Session not found" action={<Link className="btn btn-black" to="/programme">Back to programme</Link>}/></main>

  const speakers = (session.speakerIds || []).map(sid => speakerMap[sid]).filter(Boolean)
  const state = sessionState(session, now, liveState)
  const join = normalizeExternalUrl(session.streamUrl || event?.streamUrl || session.streamEmbedUrl || event?.streamEmbedUrl || '')

  function toggleSaved(){
    let list=[]
    try{list=JSON.parse(localStorage.getItem(FAV_KEY)||'[]')}catch{}
    list=list.includes(id)?list.filter(v=>v!==id):[...list,id]
    localStorage.setItem(FAV_KEY,JSON.stringify(list))
    setSaved(list.includes(id))
  }

  return <main className="page detail-page">
    <Link to="/programme" className="back-link"><Icon name="back" size={18}/> Programme</Link>

    <section className="session-detail-hero">
      <div className="session-meta-row">
        {state==='live'&&<span className="status-pill live"><i/> Live now</span>}
        {state==='soon'&&<span className="status-pill">Starting soon</span>}
        {state==='delayed'&&<span className="status-pill">Delayed</span>}
        {state==='cancelled'&&<span className="status-pill">Cancelled</span>}
        <span className="small-label">{session.type}</span>
      </div>
      <h1>{session.title}</h1>
      <div className="session-detail-meta">
        <span><Icon name="clock" size={18}/>{formatTime(sessionStartValue(session))}–{formatTime(sessionEndValue(session))}</span>
        {session.room&&<span><Icon name="pin" size={18}/>{session.room}</span>}
      </div>
      <button className={`save-button ${saved?'saved':''}`} onClick={toggleSaved}><Icon name="heart" size={18}/> {saved?'Saved to my programme':'Save to my programme'}</button>
    </section>

    {speakers.length>0&&<section className="session-speaker-priority">
      <div className="section-heading"><div><span className="eyebrow">On this session</span><h2>{speakers.length>1?'Speakers':'Speaker'}</h2></div></div>
      <div className="session-speaker-grid">{speakers.map(s=><Link to={`/speakers/${speakerSlug(s.name)}`} key={s.id} className="session-speaker-card"><SpeakerAvatar speaker={s} size="lg"/><div><span className="small-label">{s.category||'Speaker'}</span><strong>{s.name}</strong><p>{s.title}{s.organisation?` · ${s.organisation}`:''}</p></div><Icon name="arrow" size={18}/></Link>)}</div>
    </section>}

    <section className="session-qna-priority">
      <div><span className="eyebrow">Live interaction</span><h2>Live Q&A</h2><p>{session.qnaEnabled?'Questions are open for this session.':'Q&A is currently closed for this session.'}</p></div>
      {session.qnaEnabled ? <Link className="btn btn-navy" to={`/qna/${session.id}`}><Icon name="message" size={18}/> Open Live Q&A</Link> : <span className="status-pill">Closed</span>}
    </section>

    <section className="detail-copy"><h2>About this session</h2><p>{session.description||'Session details will be added by the organiser.'}</p></section>

    {join&&<section className="session-online-secondary"><div><span className="eyebrow">Online access</span><h2>Watch online</h2><p>Open this session in Microsoft Teams.</p></div><a className="btn btn-outline-navy" href={join} target="_blank" rel="noreferrer"><Icon name="video" size={17}/> Watch online</a></section>}
  </main>
}
