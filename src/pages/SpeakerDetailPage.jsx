import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppData } from '../context'
import SpeakerAvatar from '../components/SpeakerAvatar'
import SessionCard from '../components/SessionCard'
import Icon from '../components/Icon'
import EmptyState from '../components/EmptyState'
import { normalizeExternalUrl, speakerSlug } from '../lib/links'

export default function SpeakerDetailPage() {
  const { id } = useParams(); const { speakers = [], sessions = [], speakerMap = {}, now, liveState } = useAppData(); const speaker=(Array.isArray(speakers)?speakers:[]).filter(Boolean).find(s=>s.id===id || speakerSlug(s?.name||'')===id)
  if(!speaker)return <main className="page"><EmptyState title="Profile not found" action={<Link className="btn btn-black" to="/speakers">Back to speakers</Link>}/></main>
  const speakerSessions=(Array.isArray(sessions)?sessions:[]).filter(s=>s && typeof s==='object' && (s.speakerIds||[]).includes(speaker.id)); const linkedin=normalizeExternalUrl(speaker.linkedinUrl)
  return <main className="page detail-page"><Link to="/speakers" className="back-link"><Icon name="back" size={18}/> Speakers</Link><section className="speaker-feature"><div className="speaker-feature-photo"><SpeakerAvatar speaker={speaker} size="xl"/></div><div className="speaker-feature-copy"><span className="eyebrow light">{speaker.category||'Speaker'}</span><h1>{speaker.name}</h1><p className="profile-title">{speaker.title}</p>{speaker.organisation&&<p className="speaker-org">{speaker.organisation}</p>}<div className="speaker-contact-links">{speaker.email&&<a href={`mailto:${speaker.email}`}><Icon name="mail" size={15}/>{speaker.email}</a>}{speaker.phone&&<a href={`tel:${speaker.phone}`}><Icon name="info" size={15}/>{speaker.phone}</a>}{linkedin&&<a href={linkedin} target="_blank" rel="noreferrer"><Icon name="external" size={15}/>LinkedIn</a>}</div></div></section><section className="speaker-bio-panel"><span className="eyebrow">Biography</span><p>{speaker.bio||'Biography coming soon.'}</p></section><section className="section-block"><div className="section-heading"><div><span className="eyebrow">Appearing in</span><h2>Sessions</h2></div></div>{speakerSessions.length?speakerSessions.map(s=><SessionCard key={s.id} session={s} speakerMap={speakerMap} now={now} liveState={liveState}/>):<p className="muted">No linked sessions yet.</p>}</section></main>
}
