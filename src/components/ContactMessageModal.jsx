import React,{useState} from 'react'
import Icon from './Icon'
import {createConcern} from '../lib/dataService'

export default function ContactMessageModal({contact,onClose}){
  const [subject,setSubject]=useState('Event assistance')
  const [where,setWhere]=useState('')
  const [message,setMessage]=useState('')
  const [replyTo,setReplyTo]=useState('')
  const [busy,setBusy]=useState(false)
  if(!contact)return null

  async function send(e){
    e.preventDefault();setBusy(true)
    const body=[
      `Hello ${contact.name||'Event Team'},`,
      '',
      `Request: ${subject}`,
      where?`Location / session: ${where}`:'',
      replyTo?`Reply to: ${replyTo}`:'',
      '',
      message,
      '',
      'Sent from the Women in Tech Summit event site.'
    ].filter(Boolean).join('\n')
    try{
      await createConcern({category:subject,message:`For ${contact.name}: ${message}${where?` · Location: ${where}`:''}`,contact:replyTo})
    }catch{/* email fallback still opens */}
    const url=`mailto:${String(contact.email||'').trim()}?subject=${encodeURIComponent(`Women in Tech Summit: ${subject}`)}&body=${encodeURIComponent(body)}`
    window.location.href=url
    setBusy(false);onClose?.()
  }

  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose?.()}}>
    <form className="modal-card contact-message-modal" onSubmit={send}>
      <div className="modal-head"><div><span className="eyebrow">Contact event team</span><h2>{contact.name}</h2><p>{contact.role}</p></div><button type="button" onClick={onClose} aria-label="Close"><Icon name="close"/></button></div>
      <label>What do you need?<select value={subject} onChange={e=>setSubject(e.target.value)}><option>Event assistance</option><option>Programme query</option><option>Technical support</option><option>Venue assistance</option><option>Accessibility support</option><option>Other</option></select></label>
      <label>Where are you?<input value={where} onChange={e=>setWhere(e.target.value)} placeholder="e.g. Main Stage / Online"/></label>
      <label>Your email or phone (optional)<input value={replyTo} onChange={e=>setReplyTo(e.target.value.slice(0,120))} placeholder="How the team can reach you"/></label>
      <label>Message<textarea rows="5" value={message} onChange={e=>setMessage(e.target.value.slice(0,700))} required placeholder="Write your message"/></label>
      <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-navy" disabled={busy||!contact.email||!message.trim()}><Icon name="mail" size={17}/> {busy?'Preparing…':'Send message'}</button></div>
    </form>
  </div>
}
