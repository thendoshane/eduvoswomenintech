import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context'
import SpeakerAvatar from '../components/SpeakerAvatar'
import Icon from '../components/Icon'
import EmptyState from '../components/EmptyState'

export default function SpeakersPage() {
  const { speakers } = useAppData()
  const visible=useMemo(()=>speakers.filter(s=>s.showOnPanel!==false),[speakers])
  const [search, setSearch] = useState('')
  const [category,setCategory]=useState('All')
  const categories=useMemo(()=>['All',...new Set(visible.map(s=>s.category||'Speaker').filter(Boolean))],[visible])
  const filtered = useMemo(() => {
    const q=search.trim().toLowerCase()
    return visible.filter(s=>(category==='All'||(s.category||'Speaker')===category)&&(!q||`${s.name} ${s.title} ${s.organisation} ${s.category}`.toLowerCase().includes(q)))
  },[visible,search,category])
  return <main className="page speakers-page">
    <header className="page-header branded-header"><span className="eyebrow">Meet the people</span><h1>Speakers</h1><p>Voices shaping the conversations across the summit.</p></header>
    {visible.length>4&&<input className="search-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search people"/>}
    {categories.length>2&&<div className="filter-row">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>}
    <section className="speaker-grid speaker-grid-branded">{filtered.length?filtered.map((s,i)=><Link to={`/speakers/${s.id}`} className="speaker-card branded-speaker-card" key={s.id}><div className="speaker-card-art" data-variant={i%3}><SpeakerAvatar speaker={s} size="lg"/></div><div className="speaker-card-copy"><span className="eyebrow light">{s.category||'Speaker'}</span><h3>{s.name}</h3><p>{s.title}</p>{s.organisation&&<span>{s.organisation}</span>}</div><Icon name="arrow" size={20}/></Link>):<EmptyState icon="mic" title="No people found" text="Try another search or category."/>}</section>
  </main>
}
