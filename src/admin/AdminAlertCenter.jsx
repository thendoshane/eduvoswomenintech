import React,{useEffect,useRef,useState} from 'react'
import Icon from '../components/Icon'
import {playSoftChime,primeAlertAudio} from '../lib/alerts'

function useNewItems(items,label,onNew){
  const seen=useRef(null)
  useEffect(()=>{
    const ids=new Set((items||[]).map(x=>x.id))
    if(seen.current===null){seen.current=ids;return}
    const fresh=(items||[]).filter(x=>!seen.current.has(x.id))
    seen.current=ids
    if(fresh.length)onNew(fresh,label)
  },[items,label,onNew])
}

export default function AdminAlertCenter({questions,concerns,feedback,errorReports,setTab}){
  const [enabled,setEnabled]=useState(()=>localStorage.getItem('wit_admin_live_alerts')==='1')
  const [toasts,setToasts]=useState([])
  const idRef=useRef(0)

  const pushToast=(title,message,tab)=>{
    const id=++idRef.current
    setToasts(v=>[...v.slice(-2),{id,title,message,tab}])
    setTimeout(()=>setToasts(v=>v.filter(t=>t.id!==id)),7000)
    if(enabled){
      playSoftChime()
      if('Notification' in window && Notification.permission==='granted'){
        try{new Notification(title,{body:message,icon:'/icon.png'})}catch{/* optional */}
      }
    }
  }

  const onNew=React.useCallback((items,label)=>{
    const first=items[0]||{}
    if(label==='Q&A')pushToast('New Q&A question',first.text||`${items.length} new questions`,'questions')
    if(label==='Concern')pushToast('New attendee concern',first.message||`${items.length} new concerns`,'concerns')
    if(label==='Feedback')pushToast('New event feedback',first.comment||`Rating: ${first.rating||'-'}/5`,'feedback')
    if(label==='Error')pushToast('New system report',first.friendlyMessage||'A system issue was reported.','errors')
  },[enabled])

  useNewItems(questions,'Q&A',onNew)
  useNewItems(concerns,'Concern',onNew)
  useNewItems(feedback,'Feedback',onNew)
  useNewItems(errorReports,'Error',onNew)

  async function enableAlerts(){
    primeAlertAudio()
    if('Notification' in window && Notification.permission==='default'){
      try{await Notification.requestPermission()}catch{/* browser may block */}
    }
    localStorage.setItem('wit_admin_live_alerts','1')
    setEnabled(true)
    playSoftChime()
  }

  function disableAlerts(){
    localStorage.removeItem('wit_admin_live_alerts')
    setEnabled(false)
  }

  return <>
    <button className={`admin-alert-toggle ${enabled?'on':''}`} onClick={enabled?disableAlerts:enableAlerts} type="button">
      <Icon name="bell" size={17}/><span>{enabled?'Live alerts on':'Enable live alerts'}</span>
    </button>
    <div className="admin-toast-stack" aria-live="polite">
      {toasts.map(t=><button key={t.id} className="admin-toast" onClick={()=>{if(t.tab)setTab(t.tab);setToasts(v=>v.filter(x=>x.id!==t.id))}}>
        <Icon name="bell" size={18}/><span><strong>{t.title}</strong><small>{t.message}</small></span>
      </button>)}
    </div>
  </>
}
