import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import FriendlyError from '../components/FriendlyError'
import { createConcern, friendlyErrorMessage, reportError } from '../lib/dataService'

const categories = ['Programme', 'Technical', 'Facilities', 'Safety', 'Accessibility', 'Other']

export default function ConcernsPage() {
  const [category, setCategory] = useState('Programme')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (message.trim().length < 3) return
    setBusy(true); setError('')
    try {
      await createConcern({ category, message, contact })
      setMessage('')
      setContact('')
      setSent(true)
    } catch (err) {
      setError(friendlyErrorMessage(err)); reportError(err,'concern-submit').catch(()=>{})
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page concern-page">
      <header className="page-header">
        <span className="eyebrow">Live event support</span>
        <h1>Raise a concern</h1>
        <p>Send a concern directly to the event admin team. Your concern appears in the admin dashboard live.</p>
      </header>

      {sent ? (
        <section className="simple-panel concern-success">
          <Icon name="check" size={28}/>
          <h2>Concern sent</h2>
          <p>The event admin team has received it.</p>
          <div className="button-row">
            <button className="btn btn-black" onClick={() => setSent(false)}>Raise another</button>
            <Link className="btn btn-outline" to="/">Back home</Link>
          </div>
        </section>
      ) : (
        <form className="question-form concern-form" onSubmit={submit}>
          <label className="field-label">Type of concern</label>
          <select className="select-input" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(item => <option key={item} value={item}>{item}</option>)}
          </select>

          <label className="field-label">What should the admin know?</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value.slice(0, 700))}
            rows={5}
            placeholder="Describe the concern clearly…"
            required
          />
          <div className="question-form-bottom"><span>{message.length}/700</span></div>

          <label className="field-label">Contact detail (optional)</label>
          <input
            className="select-input"
            value={contact}
            onChange={e => setContact(e.target.value.slice(0, 120))}
            placeholder="Email or mobile number, only if you want a reply"
          />

          <p className="privacy-note">Your attendee name is not displayed. Contact details are optional and are visible only to event admins.</p>
          <FriendlyError error={error ? new Error(error) : null} context="concern-submit" message={error || 'The concern could not be sent.'}/>
          <button className="btn btn-black full" disabled={busy || message.trim().length < 3}>{busy ? 'Sending…' : 'Send concern'}</button>
        </form>
      )}
    </main>
  )
}
