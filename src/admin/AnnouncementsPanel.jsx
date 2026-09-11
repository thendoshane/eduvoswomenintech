import React, { useEffect, useState } from 'react'
import { useAppData } from '../context'
import Icon from '../components/Icon'
import { saveLiveNotice, friendlyErrorMessage, reportError } from '../lib/dataService'

export default function AnnouncementsPanel(){
  const { event }=useAppData()
  const [message,setMessage]=useState(event?.liveNotice?.message||'')
  const [active,setActive]=useState(Boolean(event?.liveNotice?.active))
  const [busy,setBusy]=useState(false)
  const [saved,setSaved]=useState(false)

  useEffect(()=>{
    setMessage(event?.liveNotice?.message||'')
    setActive(Boolean(event?.liveNotice?.active))
  },[event?.liveNotice?.message,event?.liveNotice?.active])

  async function publish(e){
    e.preventDefault()
    if(!message.trim())return
    setBusy(true);setSaved(false)
    try{
      await saveLiveNotice({message:message.trim(),active:true})
      setActive(true);setSaved(true)
    }catch(err){alert(friendlyErrorMessage(err)); reportError(err,'admin-notice-publish').catch(()=>{})}
    finally{setBusy(false)}
  }

  async function toggle(){
    if(!message.trim())return
    setBusy(true);setSaved(false)
    try{
      await saveLiveNotice({message:message.trim(),active:!active})
      setActive(!active);setSaved(true)
    }catch(err){alert(friendlyErrorMessage(err)); reportError(err,'admin-notice-toggle').catch(()=>{})}
    finally{setBusy(false)}
  }

  async function clear(){
    if(!confirm('Clear the current top notification?'))return
    setBusy(true);setSaved(false)
    try{
      await saveLiveNotice({message:'',active:false})
      setMessage('');setActive(false);setSaved(true)
    }catch(err){alert(friendlyErrorMessage(err)); reportError(err,'admin-notice-clear').catch(()=>{})}
    finally{setBusy(false)}
  }

  return <div className="admin-panel">
    <div className="admin-panel-title"><div><span className="eyebrow">Live updates</span><h1>Top notification</h1><p>Publish one live notice across the top of every attendee page. Changes use Realtime Database and appear immediately.</p></div></div>

    <form className="announcement-compose" onSubmit={publish}>
      <textarea rows="4" value={message} onChange={e=>setMessage(e.target.value.slice(0,300))} placeholder="e.g. The next panel will begin at 14:15."/>
      <div><span>{message.length}/300 {saved?'· Saved':''}</span><button className="btn btn-black" disabled={busy||!message.trim()}><Icon name="bell" size={17}/> {active?'Update notification':'Publish notification'}</button></div>
    </form>

    {message && <section className="admin-card notification-control-card">
      <div><span className={`status-pill ${active?'live':''}`}>{active&&<i/>}{active?'Visible now':'Hidden'}</span><h2>{message}</h2><p>{active?'Attendees can see this notice at the top of the app.':'The message is saved but not visible to attendees.'}</p></div>
      <div className="moderation-actions"><button onClick={toggle} disabled={busy}>{active?'Hide notification':'Show notification'}</button><button className="danger-text" onClick={clear} disabled={busy}>Clear</button></div>
    </section>}
  </div>
}
