import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context'
import SpeakerAvatar from '../components/SpeakerAvatar'
import Icon from '../components/Icon'
import EmptyState from '../components/EmptyState'

export default function SpeakersPage() {
  const { speakers } = useAppData()
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return speakers
    return speakers.filter(s => `${s.name} ${s.title} ${s.organisation}`.toLowerCase().includes(q))
  }, [speakers, search])

  return (
    <main className="page">
      <header className="page-header">
        <span className="eyebrow">Meet the voices</span>
        <h1>Speakers</h1>
        <p>Explore the people leading the conversations across the summit.</p>
      </header>
      {speakers.length > 4 && <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search speakers" />}
      <section className="speaker-grid">
        {filtered.length ? filtered.map(s => (
          <Link to={`/speakers/${s.id}`} className="speaker-card" key={s.id}>
            <SpeakerAvatar speaker={s} size="lg"/>
            <div><h3>{s.name}</h3><p>{s.title}</p>{s.organisation && <span>{s.organisation}</span>}</div>
            <Icon name="arrow" size={20}/>
          </Link>
        )) : <EmptyState icon="mic" title="No speakers found" text="Try a different search."/>}
      </section>
    </main>
  )
}
