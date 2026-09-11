import React, { useMemo, useState } from 'react'
import { useAppData } from '../context'
import SessionCard from '../components/SessionCard'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'
import { downloadProgramme } from '../lib/programmeDownload'
import FriendlyError from '../components/FriendlyError'

export default function ProgrammePage() {
  const { event, sessions, speakerMap, now, liveState } = useAppData()
  const [filter, setFilter] = useState('All')
  const [error,setError]=useState(null)
  const types = useMemo(() => ['All', ...new Set(sessions.map(s => s.type).filter(Boolean))], [sessions])
  const filtered = filter === 'All' ? sessions : sessions.filter(s => s.type === filter)
  function download(){try{downloadProgramme(event,sessions,speakerMap)}catch(err){setError(err)}}
  return <main className="page programme-page">
    <header className="page-header branded-header"><span className="eyebrow">Live agenda</span><h1>Programme</h1><div className="header-actions"><p>Follow the day as it happens.</p><button className="btn btn-navy" onClick={download}><Icon name="download" size={17}/> Download programme</button></div></header>
    <FriendlyError error={error} context="programme-download" message="The programme could not open for download."/>
    {types.length > 1 && <div className="filter-row" aria-label="Filter programme">{types.map(type => <button key={type} className={filter === type ? 'active' : ''} onClick={() => setFilter(type)}>{type}</button>)}</div>}
    <section className="programme-list branded-programme">{filtered.length ? filtered.map(s => <SessionCard key={s.id} session={s} speakerMap={speakerMap} now={now} liveState={liveState} event={event} showActions/>) : <EmptyState icon="calendar" title="No sessions yet" text="Programme coming soon."/>}</section>
  </main>
}
