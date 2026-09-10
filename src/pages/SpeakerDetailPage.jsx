import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppData } from '../context'
import SpeakerAvatar from '../components/SpeakerAvatar'
import SessionCard from '../components/SessionCard'
import Icon from '../components/Icon'
import EmptyState from '../components/EmptyState'

export default function SpeakerDetailPage() {
  const { id } = useParams()
  const { speakers, sessions, speakerMap, now } = useAppData()
  const speaker = speakers.find(s => s.id === id)
  if (!speaker) return <main className="page"><EmptyState title="Speaker not found" text="This profile may have been removed." action={<Link className="btn btn-black" to="/speakers">Back to speakers</Link>}/></main>
  const speakerSessions = sessions.filter(s => (s.speakerIds || []).includes(id))

  return (
    <main className="page detail-page">
      <Link to="/speakers" className="back-link"><Icon name="back" size={18}/> Speakers</Link>
      <section className="profile-hero">
        <SpeakerAvatar speaker={speaker} size="xl"/>
        <div><span className="eyebrow">Speaker</span><h1>{speaker.name}</h1><p className="profile-title">{speaker.title}</p>{speaker.organisation && <p className="muted">{speaker.organisation}</p>}</div>
      </section>
      <section className="detail-copy"><h2>About</h2><p>{speaker.bio || 'Speaker biography will be added by the organiser.'}</p>{speaker.linkedinUrl && <a className="text-link" href={speaker.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn profile <Icon name="external" size={15}/></a>}</section>
      <section className="section-block"><div className="section-heading"><div><span className="eyebrow">Appearing in</span><h2>Sessions</h2></div></div>{speakerSessions.length ? speakerSessions.map(s => <SessionCard key={s.id} session={s} speakerMap={speakerMap} now={now}/>) : <p className="muted">No linked sessions yet.</p>}</section>
    </main>
  )
}
