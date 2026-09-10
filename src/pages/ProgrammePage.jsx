import React, { useMemo, useState } from 'react'
import { useAppData } from '../context'
import SessionCard from '../components/SessionCard'
import EmptyState from '../components/EmptyState'

export default function ProgrammePage() {
  const { sessions, speakerMap, now, liveState } = useAppData()
  const [filter, setFilter] = useState('All')
  const types = useMemo(() => ['All', ...new Set(sessions.map(s => s.type).filter(Boolean))], [sessions])
  const filtered = filter === 'All' ? sessions : sessions.filter(s => s.type === filter)

  return (
    <main className="page">
      <header className="page-header">
        <span className="eyebrow">Live agenda</span>
        <h1>Programme</h1>
        <p>Times and session details update here if the programme changes.</p>
      </header>

      {types.length > 1 && (
        <div className="filter-row" aria-label="Filter programme">
          {types.map(type => <button key={type} className={filter === type ? 'active' : ''} onClick={() => setFilter(type)}>{type}</button>)}
        </div>
      )}

      <section className="programme-list">
        {filtered.length ? filtered.map(s => <SessionCard key={s.id} session={s} speakerMap={speakerMap} now={now} liveState={liveState}/>) : <EmptyState icon="calendar" title="No sessions yet" text="The organiser will publish the programme here."/>}
      </section>
    </main>
  )
}
