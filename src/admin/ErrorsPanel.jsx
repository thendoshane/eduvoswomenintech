import React,{useEffect,useState} from 'react'
import {subscribeErrorReports} from '../lib/dataService'

export default function ErrorsPanel({reports:providedReports}){
  const [ownReports,setOwnReports]=useState([])
  useEffect(()=>providedReports?()=>{}:subscribeErrorReports(setOwnReports),[providedReports])
  const reports=providedReports||ownReports
  return <div className="admin-panel"><div className="admin-panel-title"><div><span className="eyebrow">System reports</span><h1>Errors</h1><p>Technical reports captured from attendee and admin browsers.</p></div></div><div className="admin-error-list">{reports.map(r=><article className="admin-error-card" key={r.id}><div><strong>{r.context||'Application'}</strong><span>{r.createdAt?new Date(r.createdAt).toLocaleString():''}</span></div><p>{r.friendlyMessage}</p><details><summary>Technical details</summary><pre>{r.code?`${r.code}\n`:''}{r.technicalMessage}</pre></details></article>)}{!reports.length&&<div className="admin-empty">No error reports.</div>}</div></div>
}
