import React from 'react'
import Icon from './Icon'

export default function EmptyState({ icon = 'info', title, text, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon name={icon} size={26}/></span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}
