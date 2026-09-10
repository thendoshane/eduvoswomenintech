import React from 'react'
import { useAppData } from '../context'
import Icon from './Icon'

export default function NotificationBanner() {
  const { event } = useAppData()
  const notice = event?.liveNotice
  if (!notice?.active || !notice?.message) return null

  return (
    <div className="global-notification" role="status" aria-live="polite">
      <div className="global-notification-inner">
        <span className="global-notification-label"><Icon name="bell" size={16}/> Live notice</span>
        <p>{notice.message}</p>
      </div>
    </div>
  )
}
