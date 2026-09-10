import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context'
import Icon from '../components/Icon'
import { formatDate } from '../lib/utils'
import { submitFeedback } from '../lib/dataService'

export default function InfoPage() {
  const { event, announcements } = useAppData()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)

  async function sendFeedback(e) {
    e.preventDefault()
    if (!rating) return
    await submitFeedback(rating, comment)
    setSent(true)
  }

  return (
    <main className="page">
      <header className="page-header"><span className="eyebrow">Everything you need</span><h1>Event info</h1><p>{event?.welcomeMessage}</p></header>
      <section className="info-grid">
        <div className="info-card"><Icon name="calendar"/><span>Date</span><strong>{event?.date ? formatDate(event.date) : 'To be confirmed'}</strong></div>
        <div className="info-card"><Icon name="pin"/><span>Venue</span><strong>{event?.venue || 'To be confirmed'}</strong>{event?.locationNote && <small>{event.locationNote}</small>}</div>
        <div className="info-card"><Icon name="message"/><span>Hashtag</span><strong>{event?.hashtag || '#WomenInTech'}</strong></div>
        <div className="info-card"><Icon name="users"/><span>Contact</span><strong>{event?.contactName || 'Event Team'}</strong>{event?.contactEmail && <a href={`mailto:${event.contactEmail}`}>{event.contactEmail}</a>}{event?.contactPhone && <a href={`tel:${event.contactPhone}`}>{event.contactPhone}</a>}</div>
      </section>

      {(event?.wifiName || event?.wifiPassword) && <section className="detail-copy"><h2>Wi-Fi</h2><div className="wifi-box"><span>Network</span><strong>{event.wifiName || '—'}</strong><span>Password</span><strong>{event.wifiPassword || '—'}</strong></div></section>}

      {announcements.length > 0 && <section className="section-block"><div className="section-heading"><div><span className="eyebrow">Latest</span><h2>Announcements</h2></div></div><div className="announcement-list">{announcements.map(a => <div className="announcement-card" key={a.id}><Icon name="bell" size={19}/><p>{a.message}</p></div>)}</div></section>}

      {event?.websiteUrl && <a className="btn btn-outline full" href={event.websiteUrl} target="_blank" rel="noreferrer">Eduvos website <Icon name="external" size={17}/></a>}

      <section className="concern-callout"><div><span className="eyebrow">Need help during the event?</span><h2>Raise a concern live</h2><p>Send a programme, venue, technical, accessibility or other concern directly to the admin team.</p></div><Link className="btn btn-black" to="/concerns">Raise a concern</Link></section>

      <section className="feedback-panel">
        <span className="eyebrow">Quick feedback</span>
        <h2>How is the summit going?</h2>
        {sent ? <div className="success-box"><Icon name="check"/> Thank you for your feedback.</div> : <form onSubmit={sendFeedback}>
          <div className="rating-row">{[1,2,3,4,5].map(n => <button type="button" key={n} onClick={() => setRating(n)} className={rating >= n ? 'active' : ''} aria-label={`${n} stars`}><Icon name="star" size={25}/></button>)}</div>
          <textarea rows={3} placeholder="Optional comment" value={comment} onChange={e => setComment(e.target.value.slice(0, 500))}/>
          <button className="btn btn-black" disabled={!rating}>Send feedback</button>
        </form>}
      </section>
    </main>
  )
}
