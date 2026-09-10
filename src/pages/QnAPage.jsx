import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppData } from '../context'
import Icon from '../components/Icon'
import EmptyState from '../components/EmptyState'
import { createQuestion, ensureAttendeeAuth, subscribeQuestions, toggleVote } from '../lib/dataService'
import { formatTime, sortQuestions } from '../lib/utils'

export default function QnAPage() {
  const params = useParams()
  const navigate = useNavigate()
  const { sessions, liveSession } = useAppData()
  const firstOpenId = sessions.find(s => s.qnaEnabled)?.id || ''
  const initialId = params.sessionId || (liveSession?.qnaEnabled ? liveSession.id : '') || firstOpenId
  const [sessionId, setSessionId] = useState(initialId)
  const [questions, setQuestions] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [uid, setUid] = useState(null)
  const [authError, setAuthError] = useState('')
  const openSessions = sessions.filter(s => s.qnaEnabled)
  const current = sessions.find(s => s.id === sessionId)
  const sessionOptions = sessions.filter(s => s.qnaEnabled || s.id === sessionId)

  useEffect(() => {
    let active = true
    ensureAttendeeAuth()
      .then(user => { if (active) setUid(user.uid) })
      .catch(err => { if (active) setAuthError(err.message || 'Anonymous Q&A could not be started.') })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (params.sessionId && params.sessionId !== sessionId) setSessionId(params.sessionId)
  }, [params.sessionId, sessionId])

  useEffect(() => {
    if (!params.sessionId && !sessionId && firstOpenId) setSessionId(firstOpenId)
  }, [params.sessionId, sessionId, firstOpenId])

  useEffect(() => subscribeQuestions(sessionId, setQuestions), [sessionId])

  const visibleQuestions = useMemo(() => sortQuestions(questions.filter(q => q.status !== 'hidden')), [questions])

  function changeSession(id) {
    setSessionId(id)
    navigate(id ? `/qna/${id}` : '/qna', { replace: true })
  }

  async function submit(e) {
    e.preventDefault()
    if (!sessionId || !current?.qnaEnabled || text.trim().length < 2) return
    setSending(true); setMessage('')
    try {
      const user = await ensureAttendeeAuth()
      setUid(user.uid)
      await createQuestion(sessionId, text)
      setText('')
      setMessage('Question submitted anonymously.')
    } catch (err) {
      setMessage(err.message || 'Could not submit your question.')
    } finally { setSending(false) }
  }

  async function vote(question) {
    if (!current?.qnaEnabled) return
    try {
      const user = await ensureAttendeeAuth()
      setUid(user.uid)
      await toggleVote(question)
    } catch (err) {
      setMessage(err.message || 'Could not update your vote.')
    }
  }

  return (
    <main className="page qna-page">
      <header className="page-header">
        <span className="eyebrow">Anonymous by design</span>
        <h1>Live Q&A</h1>
        <p>Ask what you want answered. No attendee name is shown with your question.</p>
      </header>

      {authError && <div className="error-box">{authError}</div>}

      {!sessionId && openSessions.length === 0 ? <EmptyState icon="message" title="Q&A is closed" text="The organiser will open Q&A when a session is ready for questions."/> : <>
        {sessionOptions.length > 0 && <>
          <label className="field-label">Session</label>
          <select className="select-input" value={sessionId} onChange={e => changeSession(e.target.value)}>
            {sessionOptions.map(s => <option key={s.id} value={s.id}>{formatTime(s.startAt)} · {s.title}{s.qnaEnabled ? '' : ' · CLOSED'}</option>)}
          </select>
        </>}

        {current && <div className="qna-session-head"><span className="small-label">Questions for</span><h2>{current.title}</h2></div>}

        {current?.qnaEnabled ? (
          <form className="question-form" onSubmit={submit}>
            <textarea value={text} onChange={e => setText(e.target.value.slice(0, 500))} placeholder="Type your question…" rows={4}/>
            <div className="question-form-bottom"><span>{text.length}/500 · Anonymous</span><button className="btn btn-black" disabled={sending || text.trim().length < 2}>{sending ? 'Submitting…' : 'Submit question'}</button></div>
            {message && <p className="form-message">{message}</p>}
          </form>
        ) : current ? (
          <div className="qna-closed-panel"><Icon name="message" size={24}/><div><strong>Q&A is currently closed for this session.</strong><span>The organiser can reopen it live at any time.</span></div></div>
        ) : null}

        {current && <section className="questions-section">
          <div className="section-heading"><div><span className="eyebrow">Community questions</span><h2>Top questions</h2></div><span className="count-badge">{visibleQuestions.length}</span></div>
          {visibleQuestions.length ? visibleQuestions.map(q => {
            const voted = uid && (q.voterIds || []).includes(uid)
            return <article className={`question-card ${q.pinned ? 'pinned' : ''}`} key={q.id}>
              <button className={`vote-button ${voted ? 'voted' : ''}`} onClick={() => vote(q)} disabled={!current.qnaEnabled} aria-label={voted ? 'Remove upvote' : 'Upvote question'}><Icon name="chevronUp" size={20}/><strong>{q.voteCount || 0}</strong></button>
              <div className="question-body"><div className="question-meta">{q.pinned && <span>PINNED</span>}{q.answered && <span>ANSWERED</span>}<span>ANONYMOUS</span></div><p>{q.text}</p></div>
            </article>
          }) : <EmptyState icon="message" title={current.qnaEnabled ? 'Be the first to ask' : 'No questions yet'} text={current.qnaEnabled ? 'Questions submitted for this session will appear here instantly.' : 'Q&A is closed for this session.'}/>} 
        </section>}
      </>}
    </main>
  )
}
