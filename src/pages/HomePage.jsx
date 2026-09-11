import React,{useMemo} from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context'
import Icon from '../components/Icon'
import SessionCard from '../components/SessionCard'
import SpeakerAvatar from '../components/SpeakerAvatar'
import { formatDate, formatTime, sessionStartValue, sessionEndValue } from '../lib/utils'
import { normalizeExternalUrl, speakerSlug } from '../lib/links'

const DEFAULT_INTRO = `Women in IT Summit is a premier platform designed to inspire, empower, and connect women across the technology ecosystem around South Africa. The summit seeks to address the gender gap in technology by creating opportunities for learning, mentorship, networking, leadership development, and industry collaboration. The event will bring together students, academics, technology professionals, entrepreneurs, executives, policymakers, and industry leaders to engage in meaningful conversations about the future of technology and the critical role women play in driving innovation.\n\nThrough keynote presentations, panel discussions, mentorship sessions, and networking opportunities, participants will gain valuable insights, practical skills, and professional connections that support their growth within the digital economy as females.`

function cleanIntro(value){
  const text=String(value||'').trim()
  const marker=/what\s+to\s+expect\s*:?/i
  const match=text.match(marker)
  return match ? text.slice(0,match.index??0).trim() : text
}

export default function HomePage() {
  const { event, liveSession, nextSession, speakerMap, sessions, speakers, now, liveState } = useAppData()
  const liveSpeakers = (liveSession?.speakerIds || []).map(id => speakerMap[id]).filter(Boolean)
  const intro=useMemo(()=>cleanIntro(event?.homeIntro || DEFAULT_INTRO),[event?.homeIntro])
  const visibleSpeakerCount=useMemo(()=>speakers.filter(s=>s.showOnPanel!==false).length,[speakers])
  const watchLiveUrl=normalizeExternalUrl(event?.streamUrl||'')

  return (
    <main className="page home-page">
      <section className="hero branded-hero">
        <div className="eyebrow">{event?.organiser || 'Faculty of Information Technology'} presents</div>
        <h1>{event?.name || 'Women in Tech Summit'}</h1>
        <div className="hero-intro">{intro.split(/\n\n+/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</div>
        <div className="hero-meta">
          {event?.date && <span><Icon name="calendar" size={16}/>{formatDate(event.date)}</span>}
          {event?.venue && <span><Icon name="pin" size={16}/>{event.venue}</span>}
        </div>
        {watchLiveUrl&&<div className="button-row"><a className="btn btn-navy" href={watchLiveUrl} target="_blank" rel="noreferrer"><Icon name="video" size={17}/> Watch live</a></div>}
      </section>

      {liveSession ? (
        <section className="live-card eduvos-live-card">
          <div className="live-card-top"><span className="status-pill live large"><i/> Live now</span><span>{formatTime(sessionStartValue(liveSession))}–{formatTime(sessionEndValue(liveSession))}</span></div>
          <h2>{liveSession.title}</h2>
          {liveSession.room && <p className="muted live-room"><Icon name="pin" size={16}/> {liveSession.room}</p>}
          {liveSpeakers.length > 0 && <div className="live-speakers">{liveSpeakers.map(s => <Link to={`/speakers/${speakerSlug(s.name)}`} className="live-speaker" key={s.id}><SpeakerAvatar speaker={s}/><div><strong>{s.name}</strong><span>{s.category?`${s.category} · `:''}{s.title}{s.organisation ? ` · ${s.organisation}` : ''}</span></div></Link>)}</div>}
          <div className="button-row"><Link className="btn btn-white" to={`/session/${liveSession.id}`}>View session</Link>{liveSession.qnaEnabled && <Link className="btn btn-outline-white" to={`/qna/${liveSession.id}`}>Live Q&A</Link>}</div>
        </section>
      ) : (
        <section className="live-card eduvos-live-card no-live"><span className="small-label light">Live programme</span><h2>No session is live right now.</h2><p>Check the programme for the next session.</p><Link className="btn btn-white" to="/programme">View programme</Link></section>
      )}

      {nextSession && <section className="section-block"><div className="section-heading"><div><span className="eyebrow">Coming up</span><h2>Up next</h2></div><Link to="/programme">Full programme <Icon name="arrow" size={16}/></Link></div><SessionCard session={nextSession} speakerMap={speakerMap} now={now} liveState={liveState} compact/></section>}

      <section className="quick-grid eduvos-quick-grid">
        <Link to="/programme" className="quick-card"><Icon name="calendar"/><strong>Programme</strong><span>{sessions.length} sessions</span></Link>
        <Link to="/speakers" className="quick-card"><Icon name="mic"/><strong>Speakers</strong><span>{visibleSpeakerCount} profiles</span></Link>
        <Link to={liveSession ? `/qna/${liveSession.id}` : '/qna'} className="quick-card"><Icon name="message"/><strong>Live Q&A</strong><span>Ask a question</span></Link>
        <Link to="/info" className="quick-card"><Icon name="info"/><strong>Event info</strong><span>Venue & contacts</span></Link>
        <Link to="/concerns" className="quick-card"><Icon name="message"/><strong>Raise a concern</strong><span>Contact the event team</span></Link>
      </section>
    </main>
  )
}
