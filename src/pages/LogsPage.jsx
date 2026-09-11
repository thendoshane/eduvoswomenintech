import React,{useEffect,useMemo,useState} from 'react'
import {Link} from 'react-router-dom'
import AdminLogin from '../admin/AdminLogin'
import Brand from '../components/Brand'
import Icon from '../components/Icon'
import {observeAuth,subscribeAuditLogs,logoutAdmin} from '../lib/dataService'

function formatWhen(value){
  if(!value)return '—'
  const d=new Date(typeof value==='number'?value:value)
  return Number.isNaN(d.getTime())?String(value):d.toLocaleString([], {dateStyle:'medium',timeStyle:'medium'})
}
function csvCell(value){return `"${String(value??'').replaceAll('"','""')}"`}
function exportLogs(items){
  const rows=[['Time','Admin','Action','Area','Record','Summary'],...items.map(x=>[formatWhen(x.createdAt),x.adminEmail||x.adminUid||'',x.action||'',x.entity||'',x.entityId||'',x.summary||''])]
  const blob=new Blob([rows.map(r=>r.map(csvCell).join(',')).join('\n')],{type:'text/csv;charset=utf-8'})
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`wit2026-audit-log-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url)
}

function LogsDashboard({user}){
  const [logs,setLogs]=useState([]),[search,setSearch]=useState(''),[entity,setEntity]=useState('All')
  useEffect(()=>subscribeAuditLogs(setLogs),[])
  const entities=useMemo(()=>['All',...new Set(logs.map(x=>x.entity).filter(Boolean))],[logs])
  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return logs.filter(x=>(entity==='All'||x.entity===entity)&&(!q||`${x.adminEmail} ${x.action} ${x.entity} ${x.entityId} ${x.summary}`.toLowerCase().includes(q)))},[logs,search,entity])
  return <main className="logs-page">
    <header className="logs-topbar"><Brand compact admin/><div className="logs-top-actions"><Link className="btn btn-outline" to="/admin">Admin</Link><button className="btn btn-outline" onClick={logoutAdmin}>Sign out</button></div></header>
    <section className="logs-shell">
      <div className="logs-heading"><div><span className="eyebrow">Restricted audit trail</span><h1>System logs</h1><p>Administrative changes recorded for the live event.</p></div><button className="btn btn-navy" onClick={()=>exportLogs(filtered)} disabled={!filtered.length}><Icon name="download" size={16}/> Export CSV</button></div>
      <div className="logs-controls"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search logs"/><select value={entity} onChange={e=>setEntity(e.target.value)}>{entities.map(v=><option value={v} key={v}>{v}</option>)}</select></div>
      <div className="logs-meta"><strong>{filtered.length}</strong><span>records</span><small>{user?.email}</small></div>
      <div className="logs-list">{filtered.map(item=><article className="log-card" key={item.id}><div className="log-time">{formatWhen(item.createdAt)}</div><div className="log-main"><div className="log-tags"><span>{item.action||'change'}</span><span>{item.entity||'system'}</span></div><strong>{item.summary||'System change'}</strong>{item.entityId&&<small>{item.entityId}</small>}</div><div className="log-admin">{item.adminEmail||'Admin'}</div></article>)}{!filtered.length&&<div className="admin-empty">No matching log entries.</div>}</div>
    </section>
  </main>
}

export default function LogsPage(){
  const [user,setUser]=useState(undefined)
  useEffect(()=>observeAuth(setUser),[])
  useEffect(()=>{
    const previousTitle=document.title
    document.title='WIT2026 Audit Logs'
    let meta=document.querySelector('meta[name="robots"]')
    const previous=meta?.getAttribute('content')||''
    if(!meta){meta=document.createElement('meta');meta.setAttribute('name','robots');document.head.appendChild(meta)}
    meta.setAttribute('content','noindex,nofollow')
    return()=>{document.title=previousTitle;if(previous)meta.setAttribute('content',previous);else meta.remove()}
  },[])
  if(user===undefined)return <div className="admin-auth-loading">Checking admin access…</div>
  return user?<LogsDashboard user={user}/>:<AdminLogin/>
}
