import React,{useMemo,useState} from 'react'
import Icon from '../components/Icon'

function when(value){
  if(!value)return ''
  const d=new Date(value)
  return Number.isNaN(d.getTime())?'':d.toLocaleString([],{dateStyle:'medium',timeStyle:'short'})
}
function csvCell(value){return `"${String(value??'').replaceAll('"','""')}"`}
function exportFeedback(items){
  const rows=[['Submitted','Rating','Comment'],...items.map(x=>[when(x.createdAt),x.rating||'',x.comment||''])]
  const blob=new Blob([rows.map(r=>r.map(csvCell).join(',')).join('\n')],{type:'text/csv;charset=utf-8'})
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`wit2026-feedback-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url)
}

export default function FeedbackPanel({feedback=[]}){
  const [sort,setSort]=useState('newest')
  const ordered=useMemo(()=>{
    const items=[...feedback]
    if(sort==='highest')return items.sort((a,b)=>Number(b.rating||0)-Number(a.rating||0)||new Date(b.createdAt||0)-new Date(a.createdAt||0))
    if(sort==='lowest')return items.sort((a,b)=>Number(a.rating||0)-Number(b.rating||0)||new Date(b.createdAt||0)-new Date(a.createdAt||0))
    return items.sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0))
  },[feedback,sort])
  const average=ordered.length?(ordered.reduce((sum,x)=>sum+Number(x.rating||0),0)/ordered.length).toFixed(1):'–'
  return <div className="admin-panel">
    <div className="admin-panel-title"><div><span className="eyebrow">Attendee voice</span><h1>Feedback</h1><p>Live ratings and comments received from attendees.</p></div><div className="admin-title-actions"><select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="highest">Highest rating</option><option value="lowest">Lowest rating</option></select><button className="btn btn-navy" disabled={!ordered.length} onClick={()=>exportFeedback(ordered)}><Icon name="download" size={16}/> Export CSV</button></div></div>
    <div className="stats-grid"><div className="admin-stat-static"><span>Responses</span><strong>{ordered.length}</strong></div><div className="admin-stat-static"><span>Average rating</span><strong>{average}</strong></div></div>
    <div className="admin-feedback-list">
      {ordered.map(item=><article className="admin-feedback-card" key={item.id}><div className="feedback-stars" aria-label={`${item.rating||0} out of 5`}>{[1,2,3,4,5].map(n=><Icon key={n} name="star" size={16} className={n<=Number(item.rating||0)?'active':''}/>)}</div><p>{item.comment||'No written comment.'}</p><small>{when(item.createdAt)}</small></article>)}
      {!ordered.length&&<div className="admin-empty">No feedback yet.</div>}
    </div>
  </div>
}
