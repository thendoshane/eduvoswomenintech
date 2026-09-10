import React from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context'
import { loadStarterContent } from '../lib/dataService'
import Icon from '../components/Icon'
import { formatTime } from '../lib/utils'

export default function OverviewPanel({ questions, concerns, setTab }) {
  const { event, liveSession, nextSession, sessions, speakers } = useAppData()
  const visibleQuestions = questions.filter(q => q.status !== 'hidden')
  const newConcerns = concerns.filter(c => (c.status || 'new') === 'new')

  return (
    <div className="admin-panel">
      <div className="admin-panel-title"><div><span className="eyebrow">Control room</span><h1>Event dashboard</h1></div><Link to="/" className="btn btn-outline">View attendee app</Link></div>
      <div className="stats-grid stats-grid-five">
        <button onClick={() => setTab('programme')}><span>Sessions</span><strong>{sessions.length}</strong></button>
        <button onClick={() => setTab('speakers')}><span>Speakers</span><strong>{speakers.length}</strong></button>
        <button onClick={() => setTab('questions')}><span>Live questions</span><strong>{visibleQuestions.length}</strong></button>
        <button onClick={() => setTab('announcements')}><span>Notification</span><strong>{event?.liveNotice?.active ? 1 : 0}</strong></button>
        <button onClick={() => setTab('concerns')}><span>New concerns</span><strong>{newConcerns.length}</strong></button>
      </div>

      {sessions.length === 0 && <section className="admin-card" style={{marginBottom:16}}><h2>Start with sample content</h2><p>Load editable starter sessions, speakers and an announcement, then replace them with the real event details.</p><button className="btn btn-black" onClick={()=>loadStarterContent()}>Load starter content</button></section>}

      <div className="admin-two-col">
        <section className="admin-card dark-card">
          <div className="admin-card-label"><span className="status-pill live"><i/> Live now</span></div>
          {liveSession ? <><h2>{liveSession.title}</h2><p>{formatTime(liveSession.startAt)}–{formatTime(liveSession.endAt)} · {liveSession.room || 'Venue'}</p><button className="btn btn-white" onClick={() => setTab('programme')}>Manage session</button></> : <><h2>No active session</h2><p>The system will mark a session live automatically based on its time.</p><button className="btn btn-white" onClick={() => setTab('programme')}>Open programme</button></>}
        </section>
        <section className="admin-card">
          <span className="small-label">Up next</span>
          {nextSession ? <><h2>{nextSession.title}</h2><p>{formatTime(nextSession.startAt)} · {nextSession.room || 'Venue'}</p></> : <><h2>Programme complete</h2><p>No upcoming sessions.</p></>}
        </section>
      </div>

      <div className="admin-two-col">
        <section className="admin-card">
          <div className="admin-card-head"><div><span className="small-label">Q&A</span><h2>Questions needing attention</h2></div><button className="text-button" onClick={() => setTab('questions')}>Open Q&A <Icon name="arrow" size={16}/></button></div>
          <div className="mini-question-list">
            {visibleQuestions.slice().sort((a,b)=>(b.voteCount||0)-(a.voteCount||0)).slice(0,4).map(q => <div key={q.id}><strong>{q.voteCount || 0}</strong><p>{q.text}</p>{q.pinned && <span>PINNED</span>}</div>)}
            {!visibleQuestions.length && <p className="muted">No attendee questions yet.</p>}
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-head"><div><span className="small-label">Attendee support</span><h2>New concerns</h2></div><button className="text-button" onClick={() => setTab('concerns')}>Open concerns <Icon name="arrow" size={16}/></button></div>
          <div className="mini-concern-list">
            {newConcerns.slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,4).map(c => <div key={c.id}><span>{c.category || 'Other'}</span><p>{c.message}</p></div>)}
            {!newConcerns.length && <p className="muted">No new concerns.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
