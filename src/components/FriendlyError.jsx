import React, { useState } from 'react'
import { reportError } from '../lib/dataService'

export default function FriendlyError({ error, context='public', message='Something went wrong. Please try again.' }){
  const [reported,setReported]=useState(false)
  if(!error) return null
  async function report(){
    try { await reportError(error, context) } catch { /* the report is best-effort */ }
    setReported(true)
  }
  return <div className="friendly-error" role="alert">
    <strong>{message}</strong>
    <span>{reported ? 'Report sent. Thank you.' : 'You can report this to the event team.'}</span>
    {!reported && <button type="button" onClick={report}>Report</button>}
  </div>
}
