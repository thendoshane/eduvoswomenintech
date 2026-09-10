import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import { initializeFirebase } from './firebase'

await initializeFirebase()
const { default: App } = await import('./App')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
