import React, { useState } from 'react'
import Brand from '../components/Brand'
import { isFirebaseMode, loginAdmin, friendlyErrorMessage, reportError } from '../lib/dataService'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try { await loginAdmin(email, password) }
    catch (err) { setError(friendlyErrorMessage(err)); reportError(err,'admin-login').catch(()=>{}) }
    finally { setBusy(false) }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Brand admin/>
        <div className="admin-login-copy"><span className="eyebrow">Event management</span><h1>Admin sign in</h1><p>Manage the live programme, speakers, Q&A, notices and attendee concerns.</p></div>
        <form onSubmit={submit} className="admin-login-form">
          <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/></label>
          <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"/></label>
          {error && <div className="error-box">{error}</div>}
          <button className="btn btn-black full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        {!isFirebaseMode && <div className="mode-note"><span>Demo mode</span></div>}
      </section>
    </main>
  )
}
