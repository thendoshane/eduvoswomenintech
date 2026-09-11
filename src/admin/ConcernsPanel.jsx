import React, { useMemo, useState } from 'react'
import Icon from '../components/Icon'
import { deleteConcern, updateConcernAdmin, friendlyErrorMessage, reportError } from '../lib/dataService'

function formatWhen(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function ConcernsPanel({ concerns }) {
  const [filter, setFilter] = useState('all')
  const list = useMemo(() => [...concerns]
    .filter(c => filter === 'all' || c.status === filter)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)), [concerns, filter])

  async function patch(item, values) {
    try { await updateConcernAdmin(item.id, values) }
    catch (err) { alert(friendlyErrorMessage(err)); reportError(err,'admin-concern-update').catch(()=>{}) }
  }

  async function remove(item) {
    if (!confirm('Delete this concern permanently?')) return
    try { await deleteConcern(item.id) }
    catch (err) { alert(friendlyErrorMessage(err)); reportError(err,'admin-concern-delete').catch(()=>{}) }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <span className="eyebrow">Live attendee support</span>
          <h1>Concerns</h1>
          <p>Concerns submitted by attendees appear here immediately. Mark them seen or resolved as the team handles them.</p>
        </div>
        <select className="admin-filter" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All concerns</option>
          <option value="new">New</option>
          <option value="seen">Seen</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="admin-concern-list">
        {list.map(item => (
          <article className={`admin-concern status-${item.status || 'new'}`} key={item.id}>
            <div className="concern-status-column">
              <span className={`concern-status ${item.status || 'new'}`}>{(item.status || 'new').toUpperCase()}</span>
              <small>{formatWhen(item.createdAt)}</small>
            </div>
            <div className="admin-concern-body">
              <div className="question-meta"><span>{item.category || 'Other'}</span></div>
              <p>{item.message}</p>
              {item.contact && <div className="concern-contact"><strong>Contact:</strong> {item.contact}</div>}
              <div className="moderation-actions">
                {item.status !== 'seen' && <button onClick={() => patch(item, { status: 'seen' })}>Mark seen</button>}
                {item.status !== 'resolved' && <button onClick={() => patch(item, { status: 'resolved' })}>Resolve</button>}
                {item.status === 'resolved' && <button onClick={() => patch(item, { status: 'new' })}>Reopen</button>}
                <button className="danger-text" onClick={() => remove(item)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
        {!list.length && <div className="admin-empty">No concerns for this view.</div>}
      </div>
    </div>
  )
}
