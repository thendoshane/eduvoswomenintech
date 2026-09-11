import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import { initializeFirebase } from './firebase'

await initializeFirebase()
const { default: App } = await import('./App')
const { reportError } = await import('./lib/dataService')

window.addEventListener('error', event => reportError(event.error || event.message, 'window-error').catch(() => {}))
window.addEventListener('unhandledrejection', event => reportError(event.reason, 'unhandled-promise').catch(() => {}))

// Remove older PWA service workers so live deployments are not trapped behind stale browser caches.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => registrations.forEach(r => r.unregister())).catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
