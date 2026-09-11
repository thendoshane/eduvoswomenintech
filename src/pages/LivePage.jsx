import React from 'react'
import {Link} from 'react-router-dom'
import { useAppData } from '../context'
import Icon from '../components/Icon'
import { normalizeExternalUrl,canEmbedStreamUrl,isTeamsUrl } from '../lib/links'
import {formatTime} from '../lib/utils'

export default function LivePage(){
  const {event,liveSession,sessions}=useAppData()
  const embedRaw=liveSession?.streamEmbedUrl||event?.streamEmbedUrl||''
  const joinRaw=liveSession?.streamUrl||event?.streamUrl||''
  const embed=canEmbedStreamUrl(embedRaw)?normalizeExternalUrl(embedRaw):''
  const join=normalizeExternalUrl(joinRaw||(isTeamsUrl(embedRaw)?embedRaw:''))
  const teams=isTeamsUrl(join||embedRaw)
  const streamed=sessions.filter(s=>s.streamUrl||s.streamEmbedUrl)
  return <main className="page live-stream-page">
    <header className="page-header branded-header"><span className="eyebrow">Hybrid event</span><h1>Watch live</h1><p>{liveSession?`${liveSession.title} · ${formatTime(liveSession.startAt)}–${formatTime(liveSession.endAt)}`:'Join the online event when a session is live.'}</p></header>
    {embed ? <section className="stream-shell"><iframe src={embed} title="Women in Tech Summit live stream" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/></section> : <section className="teams-live-card"><div className="teams-live-icon"><Icon name="video" size={34}/></div><div><span className="eyebrow light">{teams?'Microsoft Teams':'Online session'}</span><h2>{liveSession?.title||'Women in Tech Summit live'}</h2><p>{teams?'Microsoft Teams blocks standard meeting pages from being displayed inside another website. Use the button below to open the live session directly.':'Open the event stream in a new tab.'}</p></div>{join&&<a className="btn btn-white" href={join} target="_blank" rel="noreferrer">Open live session <Icon name="external" size={16}/></a>}</section>}
    {embed&&join&&<a className="btn btn-outline full" href={join} target="_blank" rel="noreferrer">Open original stream <Icon name="external" size={16}/></a>}
    {streamed.length>0&&<section className="section-block"><div className="section-heading"><div><span className="eyebrow">Programme</span><h2>Online sessions</h2></div></div><div className="live-session-links">{streamed.map(s=><Link key={s.id} to={`/session/${s.id}`}><span>{formatTime(s.startAt)}</span><strong>{s.title}</strong><Icon name="arrow" size={18}/></Link>)}</div></section>}
  </main>
}
