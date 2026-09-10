import React from 'react'
import { Link } from 'react-router-dom'

export default function Brand({ compact = false, admin = false }) {
  return (
    <Link to={admin ? '/admin' : '/'} className={`brand ${compact ? 'brand-compact' : ''}`} aria-label="Eduvos Women in Tech Summit home">
      <img src="/eduvos-logo.png" alt="Eduvos" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/eduvos-logo.svg' }} />
      <span className="brand-divider" />
      <span className="brand-event">Women in Tech<br/>Summit</span>
    </Link>
  )
}
