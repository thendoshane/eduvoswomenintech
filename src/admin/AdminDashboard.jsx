import React, { useEffect, useState } from 'react'
import Brand from '../components/Brand'
import Icon from '../components/Icon'
import { logoutAdmin, modeLabel, subscribeAllQuestions, subscribeConcerns, subscribeRealtimeConnection } from '../lib/dataService'
import OverviewPanel from './OverviewPanel'
import ProgrammePanel from './ProgrammePanel'
import SpeakersPanel from './SpeakersPanel'
import QuestionsPanel from './QuestionsPanel'
import AnnouncementsPanel from './AnnouncementsPanel'
import ConcernsPanel from './ConcernsPanel'
import SettingsPanel from './SettingsPanel'
import SharePanel from './SharePanel'

const tabs=[
  ['overview','home','Overview'],
  ['programme','calendar','Programme'],
  ['speakers','mic','Speakers'],
  ['questions','message','Q&A'],
  ['announcements','bell','Notifications'],
  ['concerns','info','Concerns'],
  ['settings','settings','Settings'],
  ['share','link','Share / QR']
]

export default function AdminDashboard({user}){
  const [tab,setTab]=useState('overview')
  const [questions,setQuestions]=useState([])
  const [concerns,setConcerns]=useState([])
  const [menu,setMenu]=useState(false)
  const [liveConnected,setLiveConnected]=useState(true)

  useEffect(()=>subscribeAllQuestions(setQuestions),[])
  useEffect(()=>subscribeConcerns(setConcerns),[])
  useEffect(()=>subscribeRealtimeConnection(setLiveConnected),[])

  let panel
  if(tab==='programme')panel=<ProgrammePanel/>
  else if(tab==='speakers')panel=<SpeakersPanel/>
  else if(tab==='questions')panel=<QuestionsPanel questions={questions}/>
  else if(tab==='announcements')panel=<AnnouncementsPanel/>
  else if(tab==='concerns')panel=<ConcernsPanel concerns={concerns}/>
  else if(tab==='settings')panel=<SettingsPanel/>
  else if(tab==='share')panel=<SharePanel/>
  else panel=<OverviewPanel questions={questions} concerns={concerns} setTab={setTab}/>

  const newConcerns=concerns.filter(c=>(c.status||'new')==='new').length

  return <div className="admin-shell">
    <aside className={`admin-sidebar ${menu?'open':''}`}>
      <div className="admin-brand-wrap"><Brand compact admin/></div>
      <nav>{tabs.map(([id,icon,label])=><button key={id} className={tab===id?'active':''} onClick={()=>{setTab(id);setMenu(false)}}><Icon name={icon} size={19}/><span>{label}</span>{id==='questions'&&questions.filter(q=>q.status!=='hidden').length>0&&<b>{questions.filter(q=>q.status!=='hidden').length}</b>}{id==='concerns'&&newConcerns>0&&<b>{newConcerns}</b>}</button>)}</nav>
      <div className="admin-sidebar-foot">
        {/*<span>{modeLabel}</span>*/}
        <small className={liveConnected?'realtime-ok':'realtime-off'}>{liveConnected?'● connected':'● disconnected'}</small>
        <small>{user?.email}</small>
        <button onClick={logoutAdmin}><Icon name="logout" size={18}/> Sign out</button>
      </div>
    </aside>
    <div className="admin-main"><header className="admin-mobile-head"><Brand compact admin/><button onClick={()=>setMenu(!menu)}><Icon name={menu?'close':'menu'}/></button></header>{panel}</div>
    {menu&&<button className="sidebar-scrim" onClick={()=>setMenu(false)} aria-label="Close navigation"/>}
  </div>
}
