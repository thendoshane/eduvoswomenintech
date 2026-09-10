import React from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context'
import Icon from '../components/Icon'
import SessionCard from '../components/SessionCard'
import SpeakerAvatar from '../components/SpeakerAvatar'
import { formatDate, formatTime } from '../lib/utils'

export default function HomePage() {
  const { event, liveSession, nextSession, speakerMap, sessions, speakers, now, liveState } = useAppData()
  const liveSpeakers = (liveSession?.speakerIds || []).map(id => speakerMap[id]).filter(Boolean)

  return (
    <main className="page home-page">
      <section className="hero">
        <div className="eyebrow">{event?.organiser || 'Eduvos'} presents</div>
        <h1>{event?.name || 'Women in Tech Summit'}</h1>
        <p className="hero-tagline">{event?.tagline || 'Technology. Leadership. Opportunity.'}</p>
        <div className="hero-meta">
          {event?.date && <span><Icon name="calendar" size={16}/>{formatDate(event.date)}</span>}
          {event?.venue && <span><Icon name="pin" size={16}/>{event.venue}</span>}
        </div>
      </section>

      {liveSession ? (
        <section className="live-card">
          <div className="live-card-top">
            <span className="status-pill live large"><i/> Live now</span>
            <span>{formatTime(liveSession.startAt)}–{formatTime(liveSession.endAt)}</span>
          </div>
          <h2>{liveSession.title}</h2>
          {liveSession.room && <p className="muted live-room"><Icon name="pin" size={16}/> {liveSession.room}</p>}
          {liveSpeakers.length > 0 && (
            <div className="live-speakers">
              {liveSpeakers.map(s => (
                <Link to={`/speakers/${s.id}`} className="live-speaker" key={s.id}>
                  <SpeakerAvatar speaker={s}/>
                  <div><strong>{s.name}</strong><span>{s.title}{s.organisation ? ` · ${s.organisation}` : ''}</span></div>
                </Link>
              ))}
            </div>
          )}
          <div className="button-row">
            <Link className="btn btn-white" to={`/session/${liveSession.id}`}>View session</Link>
            {liveSession.qnaEnabled && <Link className="btn btn-outline-white" to={`/qna/${liveSession.id}`}>Ask a question</Link>}
          </div>
        </section>
      ) : (
        <section className="live-card no-live">
          <span className="small-label light">Live programme</span>
          <h2>No session is live right now.</h2>
          <p>The programme automatically updates as sessions begin.</p>
          <Link className="btn btn-white" to="/programme">View programme</Link>
        </section>
      )}

      {nextSession && (
        <section className="section-block">
          <div className="section-heading"><div><span className="eyebrow">Coming up</span><h2>Up next</h2></div><Link to="/programme">Full programme <Icon name="arrow" size={16}/></Link></div>
          <SessionCard session={nextSession} speakerMap={speakerMap} now={now} liveState={liveState} compact/>
        </section>
      )}

      <section className="quick-grid">
        <Link to="/programme" className="quick-card"><Icon name="calendar"/><strong>Programme</strong><span>{sessions.length} sessions</span></Link>
        <Link to="/speakers" className="quick-card"><Icon name="mic"/><strong>Speakers</strong><span>{speakers.length} profiles</span></Link>
        <Link to={liveSession ? `/qna/${liveSession.id}` : '/qna'} className="quick-card"><Icon name="message"/><strong>Live Q&A</strong><span>Ask anonymously</span></Link>
        <Link to="/info" className="quick-card"><Icon name="info"/><strong>Event info</strong><span>Venue & details</span></Link>
        <Link to="/concerns" className="quick-card"><Icon name="message"/><strong>Raise a concern</strong><span>Send directly to admin</span></Link>
      </section>

      <section className="section-block compact-section">
        <div className="section-heading"><div><span className="eyebrow">Stay involved</span><h2>Your questions matter</h2></div></div>
        <div className="simple-panel">
          <p>Ask anonymously during Q&A-enabled sessions and upvote questions you want the speakers to answer.</p>
          <Link className="text-link" to="/qna">Open live Q&A <Icon name="arrow" size={16}/></Link>
        </div>
      </section>
    </main>
  )
}
