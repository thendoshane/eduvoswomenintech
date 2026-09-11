import React from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import SpeakerAvatar from './SpeakerAvatar'
import { formatTime, sessionState, sessionStartValue, sessionEndValue } from '../lib/utils'
import { normalizeExternalUrl } from '../lib/links'

export default function SessionCard({ session, speakerMap = {}, now = new Date(), liveState = {}, compact = false, event = null, showActions = false }) {
  if (!session || typeof session !== 'object') return null
  const state = sessionState(session, now, liveState)
  const speakers = (session.speakerIds || []).map(id => speakerMap[id]).filter(Boolean)
  const join = normalizeExternalUrl(session.streamUrl || event?.streamUrl || '')

  const card = (
    <Link to={`/session/${session.id}`} className={`session-card ${compact ? 'compact' : ''} state-${state}`}>
      <div className="session-time">
        <strong>{formatTime(sessionStartValue(session))}</strong>
        <span>{formatTime(sessionEndValue(session))}</span>
      </div>
      <div className="session-main">
        <div className="session-meta-row">
          {state === 'live' && <span className="status-pill live"><i/> Live</span>}
          {state === 'soon' && <span className="status-pill">Starting soon</span>}
          {state === 'delayed' && <span className="status-pill">Delayed</span>}
          {state === 'cancelled' && <span className="status-pill">Cancelled</span>}
          {session.type && <span className="small-label">{session.type}</span>}
        </div>
        <h3>{session.title}</h3>
        {session.room && <p className="muted"><Icon name="pin" size={15}/> {session.room}</p>}
        {speakers.length > 0 && (
          <div className="speaker-mini-row">
            <div className="avatar-stack">
              {speakers.slice(0, 3).map(s => <SpeakerAvatar key={s.id} speaker={s} size="xs" />)}
            </div>
            <span>{speakers.map(s => s.name).join(', ')}</span>
          </div>
        )}
      </div>
      <Icon name="arrow" size={20}/>
    </Link>
  )

  if (!showActions) return card

  return (
    <article className="programme-session-wrap">
      {card}
      {(session.qnaEnabled || join) && <div className="programme-session-actions">
        {session.qnaEnabled && <Link className="programme-action primary" to={`/qna/${session.id}`}><Icon name="message" size={15}/> Live Q&A</Link>}
        {join && <a className="programme-action" href={join} target="_blank" rel="noreferrer"><Icon name="video" size={15}/> Watch online</a>}
      </div>}
    </article>
  )
}
