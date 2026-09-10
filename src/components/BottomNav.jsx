import React from 'react'
import { NavLink } from 'react-router-dom'
import Icon from './Icon'

const items = [
  ['/', 'home', 'Home'],
  ['/programme', 'calendar', 'Programme'],
  ['/speakers', 'mic', 'Speakers'],
  ['/qna', 'message', 'Q&A'],
  ['/info', 'info', 'Info']
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {items.map(([to, icon, label]) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
          <Icon name={icon} size={21}/>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
