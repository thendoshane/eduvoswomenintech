import React, { useEffect, useState } from 'react'
import { initials } from '../lib/utils'

export default function SpeakerAvatar({ speaker, size = 'md' }) {
  const [failed, setFailed] = useState(false)
  const source = speaker?.imageDataUrl || speaker?.imageUrl || ''
  useEffect(() => setFailed(false), [source])
  const canShow = Boolean(source) && !failed
  return (
    <div className={`speaker-avatar avatar-${size}`} aria-hidden="true">
      {canShow ? <img src={source} alt="" onError={() => setFailed(true)} /> : <span>{initials(speaker?.name)}</span>}
    </div>
  )
}
