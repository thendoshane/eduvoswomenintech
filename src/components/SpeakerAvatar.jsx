import React, { useState } from 'react'
import { initials } from '../lib/utils'

export default function SpeakerAvatar({ speaker, size = 'md' }) {
  const [failed, setFailed] = useState(false)
  const canShow = speaker?.imageUrl && !failed
  return (
    <div className={`speaker-avatar avatar-${size}`} aria-hidden="true">
      {canShow ? <img src={speaker.imageUrl} alt="" onError={() => setFailed(true)} /> : <span>{initials(speaker?.name)}</span>}
    </div>
  )
}
