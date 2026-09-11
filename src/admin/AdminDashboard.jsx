import React, { useEffect, useState } from 'react'
import Brand from '../components/Brand'
import Icon from '../components/Icon'
import { logoutAdmin, modeLabel, subscribeAllQuestions, subscribeConcerns, subscribeRealtimeConnection, subscribeFeedback, subscribeErrorReports } from '../lib/dataService'
import OverviewPanel from './OverviewPanel'
import ProgrammePanel from './ProgrammePanel'
import SpeakersPanel from './SpeakersPanel'
import QuestionsPanel from './QuestionsPanel'
import AnnouncementsPanel from './AnnouncementsPanel'
import ConcernsPanel from './ConcernsPanel'
import SettingsPanel from './SettingsPanel'
import SharePanel from './SharePanel'
import ErrorsPanel from './ErrorsPanel'
import FeedbackPanel from './FeedbackPanel'
import AdminAlertCenter from './AdminAlertCenter'

const tabs=[
  ['overview','home','Overview'],
  ['programme','calendar','Programme'],
  ['speakers','mic','Speakers'],
  ['questions','message','Q&A'],
  ['concerns','info','Concerns'],
  ['feedback','star','Feedback'],
  ['announcements','bell','Notifications'],
  ['errors','info','Errors'],
  ['settings','settings','Settings'],
  ['share','link','Share / QR']
]

export default function AdminDashboard({user}){
  const [tab,setTab]=useState('overview')
  const [questions,setQuestions]=useState([])
  const [concerns,setConcerns]=useState([])
  const [feedback,setFeedback]=useState([])
  const [errorReports,setErrorReports]=useState([])
  const [menu,setMenu]=useState(false)
  const [liveConnected,setLiveConnected]=useState(true)

  useEffect(()=>subscribeAllQuestions(setQuestions),[])
  useEffect(()=>subscribeConcerns(setConcerns),[])
  useEffect(()=>subscribeFeedback(setFeedback),[])
  useEffect(()=>subscribeErrorReports(setErrorReports),[])
  useEffect(()=>subscribeRealtimeConnection(setLiveConnected),[])

  let panel
  if(tab==='programme')panel=<ProgrammePanel/>
  else if(tab==='speakers')panel=<SpeakersPanel/>
  else if(tab==='questions')panel=<QuestionsPanel questions={questions}/>
  else if(tab==='announcements')panel=<AnnouncementsPanel/>
  else if(tab==='concerns')panel=<ConcernsPanel concerns={concerns}/>
  else if(tab==='feedback')panel=<FeedbackPanel feedback={feedback}/>
  else if(tab==='errors')panel=<ErrorsPanel reports={errorReports}/>
  else if(tab==='settings')panel=<SettingsPanel/>
  else if(tab==='share')panel=<SharePanel/>
  else panel=<OverviewPanel questions={questions} concerns={concerns} feedback={feedback} setTab={setTab}/>

  const newConcerns=concerns.filter(c=>(c.status||'new')==='new').length
  const openQuestions=questions.filter(q=>q.status!=='hidden'&&!q.answered).length

  return <div className="admin-shell">
    <aside className={`admin-sidebar ${menu?'open':''}`}>
      <div className="admin-brand-wrap"><Brand compact admin/></div>
      <nav>{tabs.map(([id,icon,label])=><button key={id} className={tab===id?'active':''} onClick={()=>{setTab(id);setMenu(false)}}><Icon name={icon} size={19}/><span>{label}</span>{id==='questions'&&openQuestions>0&&<b>{openQuestions}</b>}{id==='concerns'&&newConcerns>0&&<b>{newConcerns}</b>}</button>)}</nav>
      <div className="admin-sidebar-foot">
        <span>{modeLabel}</span>
        <small className={liveConnected?'realtime-ok':'realtime-off'}>{liveConnected?'● Live connection ready':'● Live connection offline'}</small>
        <small>{user?.email}</small>
        <button onClick={logoutAdmin}><Icon name="logout" size={18}/> Sign out</button>
      </div>
    </aside>
    <div className="admin-main">
      <header className="admin-mobile-head"><Brand compact admin/><button onClick={()=>setMenu(!menu)} aria-label="Open admin navigation"><Icon name={menu?'close':'menu'}/></button></header>
      <header className="admin-topbar">
        <div><span className="small-label">Women in Tech Summit</span><strong>Live control room</strong></div>
        <div className="admin-topbar-actions"><span className={`admin-connection ${liveConnected?'ok':'off'}`}>{liveConnected?'Live':'Offline'}</span><AdminAlertCenter questions={questions} concerns={concerns} feedback={feedback} errorReports={errorReports} setTab={setTab}/></div>
      </header>
      {panel}
    </div>
    {menu&&<button className="sidebar-scrim" onClick={()=>setMenu(false)} aria-label="Close navigation"/>}
  </div>
}
