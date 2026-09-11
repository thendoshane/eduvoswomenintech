import React, { useMemo, useState } from 'react'
import { useAppData } from '../context'
import Icon from '../components/Icon'
import { deleteSession, saveSession, friendlyErrorMessage, reportError } from '../lib/dataService'
import { formatTime, sessionState, toLocalInputValue } from '../lib/utils'

const blank = () => ({ title:'', description:'', startAt:'', endAt:'', room:'Main Stage', type:'Session', speakerIds:[], manualStatus:'auto', qnaEnabled:true, streamUrl:'', streamEmbedUrl:'' })

export default function ProgrammePanel() {
  const { sessions, speakers, now, liveState } = useAppData()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank())
  const [busy, setBusy] = useState(false)
  const ordered = useMemo(() => [...sessions].sort((a,b)=>new Date(a.startAt)-new Date(b.startAt)), [sessions])

  function openNew() { setEditing('new'); setForm(blank()) }
  function openEdit(s) { setEditing(s.id); setForm({ ...s, startAt:toLocalInputValue(s.startAt), endAt:toLocalInputValue(s.endAt), speakerIds:s.speakerIds||[] }) }
  function toggleSpeaker(id) { setForm(v => ({...v, speakerIds:v.speakerIds.includes(id) ? v.speakerIds.filter(x=>x!==id) : [...v.speakerIds,id]})) }

  async function submit(e) {
    e.preventDefault(); setBusy(true)
    try {
      await saveSession({
        ...form,
        id: editing === 'new' ? undefined : editing,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString()
      })
      setEditing(null)
    } catch (err) { alert(friendlyErrorMessage(err)); reportError(err,'admin-programme-save').catch(()=>{}) }
    finally { setBusy(false) }
  }

  async function remove(id) {
    if (!confirm('Delete this session? Questions linked to it may also be removed in demo mode.')) return
    await deleteSession(id)
  }

  return <div className="admin-panel">
    <div className="admin-panel-title"><div><span className="eyebrow">Live agenda</span><h1>Programme</h1><p>Add sessions, adjust times and manually override live status when needed.</p></div><button className="btn btn-black" onClick={openNew}><Icon name="plus" size={17}/> Add session</button></div>
    <div className="admin-list">
      {ordered.map(s => <div className="admin-list-row" key={s.id}>
        <div className="admin-time"><strong>{formatTime(s.startAt)}</strong><span>{formatTime(s.endAt)}</span></div>
        <div className="admin-list-main"><div className="session-meta-row"><span className={`status-pill ${sessionState(s,now,liveState)==='live'?'live':''}`}>{sessionState(s,now,liveState)==='live' && <i/>}{sessionState(s,now,liveState)}</span><span className="small-label">{s.type}</span></div><h3>{s.title}</h3><p>{s.room}{s.speakerIds?.length ? ` · ${s.speakerIds.length} speaker${s.speakerIds.length>1?'s':''}`:''}</p></div>
        <div className="row-actions"><button onClick={()=>openEdit(s)}><Icon name="edit"/></button><button onClick={()=>remove(s.id)}><Icon name="trash"/></button></div>
      </div>)}
      {!ordered.length && <div className="admin-empty">No sessions yet. Add the first programme item.</div>}
    </div>

    {editing && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setEditing(null)}}><form className="modal-card form-card" onSubmit={submit}>
      <div className="modal-head"><div><span className="eyebrow">{editing==='new'?'New':'Edit'} session</span><h2>{editing==='new'?'Add programme item':form.title}</h2></div><button type="button" onClick={()=>setEditing(null)}><Icon name="close"/></button></div>
      <div className="form-grid">
        <label className="span-2">Session title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></label>
        <label>Start<input type="datetime-local" value={form.startAt} onChange={e=>setForm({...form,startAt:e.target.value})} required/></label>
        <label>End<input type="datetime-local" value={form.endAt} onChange={e=>setForm({...form,endAt:e.target.value})} required/></label>
        <label>Room / stage<input value={form.room} onChange={e=>setForm({...form,room:e.target.value})}/></label>
        <label>Session type<input value={form.type} onChange={e=>setForm({...form,type:e.target.value})} placeholder="Keynote, Panel, Break…"/></label>
        <label>Status override<select value={form.manualStatus} onChange={e=>setForm({...form,manualStatus:e.target.value})}><option value="auto">Automatic by time</option><option value="live">Force live</option><option value="delayed">Delayed</option><option value="finished">Finished</option><option value="cancelled">Cancelled</option></select></label>
        <label>Live join URL<input type="url" value={form.streamUrl||''} onChange={e=>setForm({...form,streamUrl:e.target.value})} placeholder="Teams meeting / event link"/></label><label>Embeddable stream URL<input type="url" value={form.streamEmbedUrl||''} onChange={e=>setForm({...form,streamEmbedUrl:e.target.value})} placeholder="Only if the provider allows iframe embedding"/></label>
        <label className="span-2">Description<textarea rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
        <fieldset className="span-2"><legend>Speakers</legend><div className="check-grid">{speakers.map(sp=><label className="check-item" key={sp.id}><input type="checkbox" checked={form.speakerIds.includes(sp.id)} onChange={()=>toggleSpeaker(sp.id)}/><span>{sp.name}</span></label>)}{!speakers.length && <span className="muted">Add speakers first, then link them here.</span>}</div></fieldset>
        <label className="toggle-row span-2"><input type="checkbox" checked={Boolean(form.qnaEnabled)} onChange={e=>setForm({...form,qnaEnabled:e.target.checked})}/><span><strong>Enable live Q&A</strong><small>Attendees can submit and upvote anonymous questions.</small></span></label>
      </div>
      <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={()=>setEditing(null)}>Cancel</button><button className="btn btn-black" disabled={busy}>{busy?'Saving…':'Save session'}</button></div>
    </form></div>}
  </div>
}
