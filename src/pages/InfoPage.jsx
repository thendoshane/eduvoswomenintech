import React,{useState} from 'react'
import {Link} from 'react-router-dom'
import {useAppData} from '../context'
import Icon from '../components/Icon'
import SpeakerAvatar from '../components/SpeakerAvatar'
import ContactMessageModal from '../components/ContactMessageModal'
import {formatDate} from '../lib/utils'
import {submitFeedback,friendlyErrorMessage,reportError} from '../lib/dataService'
import {normalizeExternalUrl} from '../lib/links'

const defaultContacts=[{name:'Siba Maphukata',role:'Chairperson',email:'siba.maphukata@eduvos.com'},{name:'Danica Heusdens',role:'Deputy Chairperson',email:'danica.heusdens@eduvos.com'},{name:'Yvonne Fayeti',role:'Treasurer',email:'yvonne.fayeti@eduvos.com'},{name:'Siyaxolisa Dayisi',role:'Project Analyst',email:'siyaxolisa.dayisi@eduvos.com'}]

export default function InfoPage(){
  const {event,announcements}=useAppData()
  const [rating,setRating]=useState(0),[comment,setComment]=useState(''),[sent,setSent]=useState(false),[contacting,setContacting]=useState(null),[feedbackError,setFeedbackError]=useState('')
  const contacts=event?.contacts?.length?event.contacts:defaultContacts
  const time=[event?.startTime,event?.endTime].filter(Boolean).join(' – ')||'08:00 – 16:00'
  const join=normalizeExternalUrl(event?.streamUrl||'')
  async function sendFeedback(e){e.preventDefault();if(!rating)return;setFeedbackError('');try{await submitFeedback(rating,comment);setSent(true);setRating(0);setComment('')}catch(err){setFeedbackError(friendlyErrorMessage(err));reportError(err,'feedback-submit').catch(()=>{})}}

  return <main className="page info-page">
    <header className="page-header branded-header"><span className="eyebrow">Event details</span><h1>Information</h1><p>{event?.welcomeMessage||'Everything you need for the summit.'}</p></header>
    <section className="event-detail-panel">
      <div className="event-detail-lead"><span className="eyebrow light">{event?.eventFormat||'Hybrid event'}</span><h2>{event?.name||'Women in Tech Summit'}</h2><p>{event?.locationNote}</p>{join&&<a className="btn btn-white" href={join} target="_blank" rel="noreferrer"><Icon name="video" size={17}/> Join online</a>}</div>
      <div className="event-detail-grid">
        <div><Icon name="calendar"/><span>Date</span><strong>{event?.date?formatDate(event.date):'To be confirmed'}</strong></div>
        <div><Icon name="clock"/><span>Time</span><strong>{time}</strong></div>
        <div><Icon name="pin"/><span>Venue</span><strong>{event?.venue||'To be confirmed'}</strong></div>
        <div><Icon name="message"/><span>Hashtag</span><strong>{event?.hashtag||'#WomenInTech'}</strong></div>
      </div>
    </section>

    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">Event team</span><h2>Contact the team</h2></div></div><div className="contact-grid contact-grid-visual">{contacts.map((c,i)=><article className="contact-card contact-card-visual" key={`${c.email}-${i}`}><SpeakerAvatar speaker={{name:c.name,imageUrl:c.imageUrl,imageDataUrl:c.imageDataUrl}} size="lg"/><div className="contact-card-copy"><strong>{c.name}</strong><span>{c.role}</span>{c.email&&<a href={`mailto:${c.email}`}>{c.email}</a>}{c.phone&&<a href={`tel:${c.phone}`}>{c.phone}</a>}</div>{c.email&&<button className="btn btn-navy" onClick={()=>setContacting(c)}><Icon name="mail" size={16}/> Message</button>}</article>)}</div></section>

    {announcements.length>0&&<section className="section-block"><div className="section-heading"><div><span className="eyebrow">Latest</span><h2>Announcements</h2></div></div><div className="announcement-list">{announcements.map(a=><div className="announcement-card" key={a.id}><Icon name="bell" size={19}/><p>{a.message}</p></div>)}</div></section>}
    <section className="concern-callout"><div><span className="eyebrow">Event support</span><h2>Raise a concern</h2></div><Link className="btn btn-navy" to="/concerns">Raise concern</Link></section>
    <section className="feedback-panel"><span className="eyebrow">Feedback</span><h2>Rate the summit</h2>{sent&&<div className="success-box"><Icon name="check"/> Thank you. Your feedback was sent.</div>}{feedbackError&&<div className="error-box">{feedbackError}</div>}<form onSubmit={sendFeedback}><div className="rating-row">{[1,2,3,4,5].map(n=><button type="button" key={n} onClick={()=>setRating(n)} className={rating>=n?'active':''} aria-label={`${n} stars`}><Icon name="star" size={25}/></button>)}</div><textarea rows={3} placeholder="Why this rating? (optional)" value={comment} onChange={e=>setComment(e.target.value.slice(0,500))}/><button className="btn btn-navy" disabled={!rating}>Send feedback</button></form></section>
    {contacting&&<ContactMessageModal contact={contacting} onClose={()=>setContacting(null)}/>}  
  </main>
}
