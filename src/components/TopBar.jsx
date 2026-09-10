import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import Brand from './Brand'

export default function TopBar() {
  const location = useLocation()
  return (
    <header className="topbar">
      <Brand compact />
      <div className="topbar-actions">
        {location.pathname !== '/admin' && <Link to="/admin" className="quiet-link">Admin</Link>}
      </div>
    </header>
  )
}
