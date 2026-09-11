import React, { useMemo, useState } from 'react'
import { useAppData } from '../context'
import { deleteQuestion, setSessionQnaEnabled, updateQuestionAdmin, friendlyErrorMessage, reportError } from '../lib/dataService'
import { sortQuestions } from '../lib/utils'

export default function QuestionsPanel({ questions }) {
  const { sessions } = useAppData()
  const [filter,setFilter]=useState('all')
  const [busyId,setBusyId]=useState('')
  const sessionMap=Object.fromEntries(sessions.map(s=>[s.id,s]))
  const list=useMemo(()=>sortQuestions(questions.filter(q=>filter==='all'||q.sessionId===filter)),[questions,filter])

  async function patch(question,p){
    try{await updateQuestionAdmin(question.sessionId,question.id,p)}
    catch(err){alert(friendlyErrorMessage(err)); reportError(err,'admin-question-update').catch(()=>{})}
  }

  async function remove(question){
    if(confirm('Delete this question permanently?')) await deleteQuestion(question.sessionId,question.id)
  }

  async function toggleQna(session){
    setBusyId(session.id)
    try{await setSessionQnaEnabled(session.id,!session.qnaEnabled)}
    catch(err){alert(friendlyErrorMessage(err)); reportError(err,'admin-qna-toggle').catch(()=>{})}
    finally{setBusyId('')}
  }

  return <div className="admin-panel">
    <div className="admin-panel-title">
      <div><span className="eyebrow">Moderator view</span><h1>Live Q&A</h1><p>Open or close Q&A for each session, then pin, answer or hide attendee questions in real time.</p></div>
      <select className="admin-filter" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All sessions</option>{sessions.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
    </div>

    <section className="admin-card qna-control-card">
      <div className="admin-card-head"><div><span className="small-label">Session controls</span><h2>Q&A availability</h2></div></div>
      <div className="qna-toggle-list">
        {sessions.map(session=><div className="qna-toggle-row" key={session.id}>
          <div><strong>{session.title}</strong><span>{session.qnaEnabled ? 'Attendees can ask and upvote questions' : 'Q&A is closed for attendees'}</span></div>
          <button className={`qna-switch ${session.qnaEnabled?'on':''}`} onClick={()=>toggleQna(session)} disabled={busyId===session.id} aria-pressed={Boolean(session.qnaEnabled)}>
            <span className="qna-switch-track"><i/></span><b>{busyId===session.id?'Saving…':session.qnaEnabled?'Open':'Closed'}</b>
          </button>
        </div>)}
        {!sessions.length&&<div className="admin-empty">Add programme sessions first.</div>}
      </div>
    </section>

    <div className="admin-question-list">{list.map(q=><article className={`admin-question ${q.status==='hidden'?'is-hidden':''}`} key={q.id}><div className="vote-count"><strong>{q.voteCount||0}</strong><span>votes</span></div><div className="admin-question-body"><div className="question-meta"><span>{sessionMap[q.sessionId]?.title||'Unknown session'}</span>{q.pinned&&<span>PINNED</span>}{q.answered&&<span>ANSWERED</span>}{q.status==='hidden'&&<span>HIDDEN</span>}</div><p>{q.text}</p><div className="moderation-actions"><button onClick={()=>patch(q,{pinned:!q.pinned})}>{q.pinned?'Unpin':'Pin'}</button><button onClick={()=>patch(q,{answered:!q.answered})}>{q.answered?'Mark unanswered':'Mark answered'}</button><button onClick={()=>patch(q,{status:q.status==='hidden'?'visible':'hidden'})}>{q.status==='hidden'?'Show':'Hide'}</button><button className="danger-text" onClick={()=>remove(q)}>Delete</button></div></div></article>)}{!list.length&&<div className="admin-empty">No questions for this view.</div>}</div>
  </div>
}
