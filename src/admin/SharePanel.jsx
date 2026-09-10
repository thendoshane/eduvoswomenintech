import React, { useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Icon from '../components/Icon'

export default function SharePanel(){
  const defaultUrl=useMemo(()=>import.meta.env.VITE_PUBLIC_APP_URL||window.location.origin,[])
  const [url,setUrl]=useState(defaultUrl)
  const [copied,setCopied]=useState(false)
  async function copy(){await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return <div className="admin-panel"><div className="admin-panel-title"><div><span className="eyebrow">Attendee access</span><h1>Share & QR code</h1><p>Put this QR code on screens, tables, lanyards or printed posters.</p></div></div><div className="share-layout"><section className="qr-card"><QRCodeSVG value={url||window.location.origin} size={260} bgColor="#ffffff" fgColor="#000000" level="M" marginSize={2}/><div className="qr-caption"><strong>Women in Tech Summit</strong><span>Scan for the live programme & Q&A</span></div></section><section className="admin-card share-settings"><label>Public event URL<input type="url" value={url} onChange={e=>setUrl(e.target.value)}/></label><button className="btn btn-black" onClick={copy}><Icon name="link" size={17}/>{copied?'Copied':'Copy event link'}</button><p className="muted">After Firebase Hosting deployment, paste the final public URL here before printing the QR code.</p><button className="btn btn-outline" onClick={()=>window.print()}>Print QR page</button></section></div></div>
}
