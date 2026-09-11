import React,{useState} from 'react'
import {useAppData} from '../context'
import Icon from '../components/Icon'
import SpeakerAvatar from '../components/SpeakerAvatar'
import {deleteSpeaker,saveSpeaker,friendlyErrorMessage,reportError} from '../lib/dataService'
import {imageFileToDataUrl} from '../lib/imageUpload'

const blank=()=>({name:'',title:'',organisation:'',category:'Speaker',showOnPanel:true,bio:'',imageUrl:'',imageDataUrl:'',linkedinUrl:'',email:'',phone:''})
export default function SpeakersPanel(){
  const {speakers}=useAppData()
  const [editing,setEditing]=useState(null),[form,setForm]=useState(blank()),[busy,setBusy]=useState(false),[imageBusy,setImageBusy]=useState(false),[error,setError]=useState('')
  const openNew=()=>{setEditing('new');setForm(blank());setError('')}
  const openEdit=s=>{setEditing(s.id);setForm({...blank(),...s,showOnPanel:s.showOnPanel!==false});setError('')}
  async function chooseImage(e){
    const file=e.target.files?.[0];if(!file)return
    setImageBusy(true);setError('')
    try{const imageDataUrl=await imageFileToDataUrl(file,{size:500,quality:.78,maxOutputBytes:190*1024});setForm(v=>({...v,imageDataUrl}))}
    catch(err){setError(friendlyErrorMessage(err));reportError(err,'admin-speaker-photo').catch(()=>{})}
    finally{setImageBusy(false);e.target.value=''}
  }
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{await saveSpeaker({...form,id:editing==='new'?undefined:editing});setEditing(null)}catch(err){setError(friendlyErrorMessage(err));reportError(err,'admin-speaker-save').catch(()=>{})}finally{setBusy(false)}}
  async function remove(id){if(confirm('Delete this speaker profile?'))try{await deleteSpeaker(id)}catch(err){setError(friendlyErrorMessage(err));reportError(err,'admin-speaker-delete').catch(()=>{})}}
  return <div className="admin-panel">
    <div className="admin-panel-title"><div><span className="eyebrow">People</span><h1>Speakers</h1></div><button className="btn btn-black" onClick={openNew}><Icon name="plus" size={17}/> Add person</button></div>
    {error&&<div className="error-box">{error}</div>}
    <div className="admin-speaker-grid">{speakers.map(s=><div className="admin-speaker-card" key={s.id}><SpeakerAvatar speaker={s} size="lg"/><div><div className="speaker-admin-meta"><span className="small-label">{s.category||'Speaker'}</span>{s.showOnPanel===false&&<span className="hidden-chip">Hidden from speaker panel</span>}</div><h3>{s.name}</h3><p>{s.title}</p><span>{s.organisation}</span></div><div className="row-actions"><button onClick={()=>openEdit(s)} aria-label="Edit"><Icon name="edit"/></button><button onClick={()=>remove(s.id)} aria-label="Delete"><Icon name="trash"/></button></div></div>)}</div>
    {editing&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setEditing(null)}}><form className="modal-card form-card" onSubmit={submit}><div className="modal-head"><div><span className="eyebrow">Person profile</span><h2>{editing==='new'?'Add person':form.name}</h2></div><button type="button" onClick={()=>setEditing(null)}><Icon name="close"/></button></div>
      <div className="image-upload-admin">
        <SpeakerAvatar speaker={form} size="xl"/>
        <div className="image-upload-actions"><label className="btn btn-navy file-button">{imageBusy?'Processing…':'Upload photo'}<input type="file" accept="image/*" onChange={chooseImage} disabled={imageBusy}/></label>{form.imageDataUrl&&<button type="button" className="btn btn-outline" onClick={()=>setForm({...form,imageDataUrl:''})}>Remove upload</button>}</div>
      </div>
      <div className="form-grid">
      <label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label>
      <label>Category<input value={form.category||''} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Facilitator, Speaker, Student…"/></label>
      <label>Job title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
      <label>Organisation<input value={form.organisation} onChange={e=>setForm({...form,organisation:e.target.value})}/></label>
      <label className="span-2">Image link<input value={form.imageUrl||''} onChange={e=>setForm({...form,imageUrl:e.target.value})} placeholder="https://… or /speakers/name.jpg"/><small className="field-hint">Uploaded photo takes priority when both are present.</small></label>
      <label>Email<input type="email" value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Phone<input value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
      <label className="span-2">LinkedIn URL<input value={form.linkedinUrl||''} onChange={e=>setForm({...form,linkedinUrl:e.target.value})} placeholder="linkedin.com/in/name"/></label>
      <label className="span-2">Biography<textarea rows="6" value={form.bio||''} onChange={e=>setForm({...form,bio:e.target.value})}/></label>
      <label className="toggle-row span-2"><input type="checkbox" checked={form.showOnPanel!==false} onChange={e=>setForm({...form,showOnPanel:e.target.checked})}/><span><strong>Show on Speakers page</strong><small>Visible in the public speaker panel and included in the homepage speaker count.</small></span></label>
    </div><div className="modal-actions"><button type="button" className="btn btn-outline" onClick={()=>setEditing(null)}>Cancel</button><button className="btn btn-black" disabled={busy||imageBusy}>{busy?'Saving…':'Save'}</button></div></form></div>}
  </div>
}
