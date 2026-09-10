import React, { useMemo, useState } from 'react'
import Brand from '../components/Brand'
import { getFirebaseDiagnostics, isFirebaseMode, loginAdmin, modeLabel } from '../lib/dataService'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const diagnostics = useMemo(() => getFirebaseDiagnostics(), [])

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try { await loginAdmin(email, password) }
    catch (err) { setError(err.message || 'Could not sign in.') }
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
        {/*}
        <div className="mode-note">
          <strong>{modeLabel} mode</strong>
          {!isFirebaseMode && <span>Demo login: <b>admin@eduvos.local</b> / <b>admin123</b></span>}
          {isFirebaseMode && <>
            <span>Project: <b>{diagnostics.projectId}</b></span>
            <span>Realtime DB: <b>{diagnostics.databaseUrl}</b></span>
            <span>Admin access is verified from Firestore. Realtime Database does not need a separate admin record.</span>
            <span>Use your Email/Password account from Firebase Authentication.</span>
          </>}
        </div>*/}
      </section>
    </main>
  )
}
