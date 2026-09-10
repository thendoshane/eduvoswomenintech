import React, { useState } from 'react'
import { useAppData } from '../context'
import Icon from '../components/Icon'
import SpeakerAvatar from '../components/SpeakerAvatar'
import { deleteSpeaker, saveSpeaker } from '../lib/dataService'

const blank = () => ({ name:'', title:'', organisation:'', bio:'', imageUrl:'', linkedinUrl:'' })

export default function SpeakersPanel() {
  const { speakers } = useAppData()
  const [editing,setEditing]=useState(null)
  const [form,setForm]=useState(blank())
  const [busy,setBusy]=useState(false)
  const openNew=()=>{setEditing('new');setForm(blank())}
  const openEdit=s=>{setEditing(s.id);setForm({...s})}
  async function submit(e){e.preventDefault();setBusy(true);try{await saveSpeaker({...form,id:editing==='new'?undefined:editing});setEditing(null)}catch(err){alert(err.message||'Could not save speaker.')}finally{setBusy(false)}}
  async function remove(id){if(confirm('Delete this speaker profile?')) await deleteSpeaker(id)}
  return <div className="admin-panel">
    <div className="admin-panel-title"><div><span className="eyebrow">People</span><h1>Speakers</h1><p>Manage profiles displayed across the programme.</p></div><button className="btn btn-black" onClick={openNew}><Icon name="plus" size={17}/> Add speaker</button></div>
    <div className="admin-speaker-grid">{speakers.map(s=><div className="admin-speaker-card" key={s.id}><SpeakerAvatar speaker={s} size="lg"/><div><h3>{s.name}</h3><p>{s.title}</p><span>{s.organisation}</span></div><div className="row-actions"><button onClick={()=>openEdit(s)}><Icon name="edit"/></button><button onClick={()=>remove(s.id)}><Icon name="trash"/></button></div></div>)}{!speakers.length&&<div className="admin-empty">No speaker profiles yet.</div>}</div>
    {editing&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setEditing(null)}}><form className="modal-card form-card" onSubmit={submit}><div className="modal-head"><div><span className="eyebrow">{editing==='new'?'New':'Edit'} speaker</span><h2>{editing==='new'?'Add speaker':form.name}</h2></div><button type="button" onClick={()=>setEditing(null)}><Icon name="close"/></button></div><div className="form-grid"><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label>Job title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Organisation<input value={form.organisation} onChange={e=>setForm({...form,organisation:e.target.value})}/></label><label>Photo URL<input type="url" value={form.imageUrl||''} onChange={e=>setForm({...form,imageUrl:e.target.value})} placeholder="Optional public image URL"/></label><label className="span-2">LinkedIn URL<input type="url" value={form.linkedinUrl||''} onChange={e=>setForm({...form,linkedinUrl:e.target.value})}/></label><label className="span-2">Biography<textarea rows="6" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="btn btn-outline" onClick={()=>setEditing(null)}>Cancel</button><button className="btn btn-black" disabled={busy}>{busy?'Saving…':'Save speaker'}</button></div></form></div>}
  </div>
}
