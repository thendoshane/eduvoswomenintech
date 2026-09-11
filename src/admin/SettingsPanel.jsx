import React,{useEffect,useState} from 'react'
import {useAppData} from '../context'
import Icon from '../components/Icon'
import SpeakerAvatar from '../components/SpeakerAvatar'
import {saveEvent,friendlyErrorMessage,reportError} from '../lib/dataService'
import {imageFileToDataUrl} from '../lib/imageUpload'

const baseContacts=[
  {name:'Siba Maphukata',role:'Chairperson',email:'siba.maphukata@eduvos.com',phone:'',imageUrl:'',imageDataUrl:''},
  {name:'Danica Heusdens',role:'Deputy Chairperson',email:'danica.heusdens@eduvos.com',phone:'',imageUrl:'',imageDataUrl:''},
  {name:'Yvonne Fayeti',role:'Treasurer',email:'yvonne.fayeti@eduvos.com',phone:'',imageUrl:'',imageDataUrl:''},
  {name:'Siyaxolisa Dayisi',role:'Project Analyst',email:'siyaxolisa.dayisi@eduvos.com',phone:'',imageUrl:'',imageDataUrl:''}
]
export default function SettingsPanel(){
  const {event}=useAppData();const [form,setForm]=useState(event||{}),[saved,setSaved]=useState(false),[busy,setBusy]=useState(false),[imageBusy,setImageBusy]=useState(null),[error,setError]=useState('')
  useEffect(()=>{if(event)setForm({...event,contacts:event.contacts?.length?event.contacts:baseContacts})},[event])
  function updateContact(i,key,val){const contacts=[...(form.contacts||[])];contacts[i]={...contacts[i],[key]:val};setForm({...form,contacts})}
  function addContact(){setForm({...form,contacts:[...(form.contacts||[]),{name:'',role:'',email:'',phone:'',imageUrl:'',imageDataUrl:''}]})}
  function removeContact(i){setForm({...form,contacts:(form.contacts||[]).filter((_,x)=>x!==i)})}
  async function chooseContactImage(i,e){
    const file=e.target.files?.[0];if(!file)return
    setImageBusy(i);setError('')
    try{const imageDataUrl=await imageFileToDataUrl(file,{size:320,quality:.72,maxOutputBytes:90*1024});updateContact(i,'imageDataUrl',imageDataUrl)}
    catch(err){setError(friendlyErrorMessage(err));reportError(err,'admin-contact-photo',{index:i}).catch(()=>{})}
    finally{setImageBusy(null);e.target.value=''}
  }
  async function submit(e){e.preventDefault();setBusy(true);setSaved(false);setError('');try{const {id,...payload}=form;await saveEvent(payload);setSaved(true)}catch(err){setError(friendlyErrorMessage(err));reportError(err,'admin-settings').catch(()=>{})}finally{setBusy(false)}}
  return <div className="admin-panel">
    <div className="admin-panel-title"><div><span className="eyebrow">Event setup</span><h1>Event settings</h1></div></div>
    <form className="settings-form admin-card" onSubmit={submit}>{error&&<div className="error-box">{error}</div>}
      <div className="form-grid">
        <label>Event name<input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label>Presented by<input value={form.organiser||''} onChange={e=>setForm({...form,organiser:e.target.value})} placeholder="Faculty of Information Technology"/></label>
        <label className="span-2">Home introduction<textarea rows="8" value={form.homeIntro||''} onChange={e=>setForm({...form,homeIntro:e.target.value})}/></label>
        <label>Date<input type="date" value={form.date||''} onChange={e=>setForm({...form,date:e.target.value})}/></label>
        <label>Format<input value={form.eventFormat||'Hybrid event'} onChange={e=>setForm({...form,eventFormat:e.target.value})}/></label>
        <label>Start time<input type="time" value={form.startTime||''} onChange={e=>setForm({...form,startTime:e.target.value})}/></label>
        <label>End time<input type="time" value={form.endTime||''} onChange={e=>setForm({...form,endTime:e.target.value})}/></label>
        <label className="span-2">Venue<input value={form.venue||''} onChange={e=>setForm({...form,venue:e.target.value})}/></label>
        <label className="span-2">Venue note<input value={form.locationNote||''} onChange={e=>setForm({...form,locationNote:e.target.value})}/></label>
        <label className="span-2">Teams join URL<input value={form.streamUrl||''} onChange={e=>setForm({...form,streamUrl:e.target.value})} placeholder="https://teams.microsoft.com/..."/></label>
        <label className="span-2">Embeddable stream URL (optional)<input value={form.streamEmbedUrl||''} onChange={e=>setForm({...form,streamEmbedUrl:e.target.value})} placeholder="Only use a URL that explicitly allows embedding"/></label>
      </div>
      <div className="contacts-editor">
        <div className="contacts-editor-head"><div><span className="eyebrow">Event team</span><h2>Contact persons</h2></div><button type="button" className="btn btn-outline" onClick={addContact}><Icon name="plus" size={16}/> Add contact</button></div>
        <div className="contact-editor-grid">{(form.contacts||[]).map((c,i)=><article className="contact-editor-card" key={i}>
          <div className="contact-editor-avatar"><SpeakerAvatar speaker={{name:c.name||'Contact',imageUrl:c.imageUrl,imageDataUrl:c.imageDataUrl}} size="lg"/></div>
          <div className="contact-editor-fields">
            <input placeholder="Name" value={c.name||''} onChange={e=>updateContact(i,'name',e.target.value)}/>
            <input placeholder="Role" value={c.role||''} onChange={e=>updateContact(i,'role',e.target.value)}/>
            <input placeholder="Email" type="email" value={c.email||''} onChange={e=>updateContact(i,'email',e.target.value)}/>
            <input placeholder="Phone" value={c.phone||''} onChange={e=>updateContact(i,'phone',e.target.value)}/>
            <input className="span-2" placeholder="Image link (optional)" value={c.imageUrl||''} onChange={e=>updateContact(i,'imageUrl',e.target.value)}/>
            <div className="span-2 contact-upload-row"><label className="btn btn-navy file-button">{imageBusy===i?'Processing…':'Upload photo'}<input type="file" accept="image/*" disabled={imageBusy===i} onChange={e=>chooseContactImage(i,e)}/></label>{c.imageDataUrl&&<button type="button" className="btn btn-outline" onClick={()=>updateContact(i,'imageDataUrl','')}>Remove upload</button>}<small>Uploaded photo takes priority.</small></div>
          </div>
          <button type="button" className="icon-button danger-text" onClick={()=>removeContact(i)} aria-label="Remove contact"><Icon name="trash" size={17}/></button>
        </article>)}</div>
      </div>
      <div className="settings-actions">{saved&&<span className="success-text">Saved.</span>}<button className="btn btn-black" disabled={busy||imageBusy!==null}>{busy?'Saving…':'Save settings'}</button></div>
    </form>
  </div>
}
