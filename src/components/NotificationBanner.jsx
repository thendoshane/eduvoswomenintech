import React,{useEffect,useRef,useState} from 'react'
import { useAppData } from '../context'
import Icon from './Icon'
import {playSoftChime,primeAlertAudio} from '../lib/alerts'

export default function NotificationBanner() {
  const { event } = useAppData()
  const notice = event?.liveNotice
  const lastKey=useRef(null)
  const initialized=useRef(false)
  const unlocked=useRef(false)
  const [flash,setFlash]=useState(false)

  useEffect(()=>{
    const unlock=()=>{unlocked.current=true;primeAlertAudio()}
    window.addEventListener('pointerdown',unlock,{once:true})
    window.addEventListener('keydown',unlock,{once:true})
    return()=>{window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock)}
  },[])

  useEffect(()=>{
    const key=notice?.active&&notice?.message?`${notice.updatedAt||''}:${notice.message}`:null
    if(!initialized.current){initialized.current=true;lastKey.current=key;return}
    if(key&&lastKey.current!==key){
      lastKey.current=key
      setFlash(true)
      const timer=setTimeout(()=>setFlash(false),1400)
      if(unlocked.current)playSoftChime()
      return()=>clearTimeout(timer)
    }
    lastKey.current=key
  },[notice?.active,notice?.message,notice?.updatedAt])

  if (!notice?.active || !notice?.message) return null

  return (
    <aside className={`global-notification ${flash?'is-new':''}`} role="status" aria-live="polite">
      <div className="global-notification-inner">
        <span className="global-notification-label"><Icon name="bell" size={16}/> Live update</span>
        <p>{notice.message}</p>
      </div>
    </aside>
  )
}
