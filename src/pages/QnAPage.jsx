import React,{useEffect,useMemo,useState} from 'react'
import {useNavigate,useParams} from 'react-router-dom'
import {useAppData} from '../context'
import Icon from '../components/Icon'
import EmptyState from '../components/EmptyState'
import FriendlyError from '../components/FriendlyError'
import {createQuestion,ensureAttendeeAuth,subscribeQuestions,toggleVote,friendlyErrorMessage} from '../lib/dataService'
import {formatTime,sortQuestions} from '../lib/utils'

export default function QnAPage(){
 const params=useParams(),navigate=useNavigate(); const {sessions,liveSession}=useAppData(); const firstOpenId=sessions.find(s=>s.qnaEnabled)?.id||''; const initialId=params.sessionId||(liveSession?.qnaEnabled?liveSession.id:'')||firstOpenId
 const [sessionId,setSessionId]=useState(initialId),[questions,setQuestions]=useState([]),[text,setText]=useState(''),[sending,setSending]=useState(false),[message,setMessage]=useState(''),[uid,setUid]=useState(null),[error,setError]=useState(null)
 const current=sessions.find(s=>s.id===sessionId), visibleQuestions=useMemo(()=>sortQuestions(questions.filter(q=>q.status!=='hidden')),[questions])
 useEffect(()=>{ensureAttendeeAuth().then(u=>setUid(u.uid)).catch(setError)},[])
 useEffect(()=>{if(params.sessionId&&params.sessionId!==sessionId)setSessionId(params.sessionId)},[params.sessionId,sessionId])
 useEffect(()=>{if(!params.sessionId&&!sessionId&&firstOpenId)setSessionId(firstOpenId)},[params.sessionId,sessionId,firstOpenId])
 useEffect(()=>subscribeQuestions(sessionId,setQuestions),[sessionId])
 function changeSession(id){setSessionId(id);navigate(id?`/qna/${id}`:'/qna',{replace:true})}
 async function submit(e){e.preventDefault();if(!sessionId||!current?.qnaEnabled||text.trim().length<2)return;setSending(true);setError(null);try{const u=await ensureAttendeeAuth();setUid(u.uid);await createQuestion(sessionId,text);setText('');setMessage('Question submitted.')}catch(err){setError(err);setMessage(friendlyErrorMessage(err))}finally{setSending(false)}}
 async function vote(q){if(!current?.qnaEnabled)return;try{const u=await ensureAttendeeAuth();setUid(u.uid);await toggleVote(q)}catch(err){setError(err)}}
 return <main className="page qna-page"><header className="page-header branded-header"><span className="eyebrow">Live agenda & questions</span><h1>Q&A</h1><p>Select a session, then join the conversation.</p></header><FriendlyError error={error} context="qna" message={friendlyErrorMessage(error)}/>
 <section className="qna-agenda"><div className="section-heading"><div><span className="eyebrow">Agenda</span><h2>Choose a session</h2></div></div>{sessions.map(s=><button key={s.id} className={`qna-agenda-row ${s.id===sessionId?'active':''}`} onClick={()=>changeSession(s.id)}><span>{formatTime(s.startAt)}</span><strong>{s.title}</strong><b>{s.qnaEnabled?'Q&A OPEN':'CLOSED'}</b></button>)}</section>
 {!current?<EmptyState icon="message" title="Choose a session" text="Select a programme item above."/>:<><div className="qna-session-head"><span className="small-label">Questions for</span><h2>{current.title}</h2></div>{current.qnaEnabled?<form className="question-form" onSubmit={submit}><textarea value={text} onChange={e=>setText(e.target.value.slice(0,500))} placeholder="Type your question…" rows={4}/><div className="question-form-bottom"><span>{text.length}/500 · Anonymous</span><button className="btn btn-navy" disabled={sending||text.trim().length<2}>{sending?'Submitting…':'Submit question'}</button></div>{message&&<p className="form-message">{message}</p>}</form>:<div className="qna-closed-panel"><Icon name="message" size={24}/><div><strong>Q&A is closed for this session.</strong></div></div>}
 <section className="questions-section"><div className="section-heading"><div><span className="eyebrow">Community questions</span><h2>Top questions</h2></div><span className="count-badge">{visibleQuestions.length}</span></div>{visibleQuestions.length?visibleQuestions.map(q=>{const voted=uid&&(q.voterIds||[]).includes(uid);return <article className={`question-card ${q.pinned?'pinned':''}`} key={q.id}><button className={`vote-button ${voted?'voted':''}`} onClick={()=>vote(q)} disabled={!current.qnaEnabled}><Icon name="chevronUp" size={20}/><strong>{q.voteCount||0}</strong></button><div className="question-body"><div className="question-meta">{q.pinned&&<span>PINNED</span>}{q.answered&&<span>ANSWERED</span>}<span>ANONYMOUS</span></div><p>{q.text}</p></div></article>}):<EmptyState icon="message" title="No questions yet" text={current.qnaEnabled?'Be the first to ask.':'Q&A is closed.'}/>}</section></>}
 </main>
}
