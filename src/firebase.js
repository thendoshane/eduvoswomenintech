import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

export let app = null
export let auth = null
export let db = null
export let rtdb = null
export let firebaseEnabled = false
export let firebaseProjectId = ''
export let realtimeDatabaseUrl = ''
export let firebaseInitError = ''

export const eventId = import.meta.env.VITE_EVENT_ID || 'women-in-tech-summit'

function envConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || ''
  }
}

function hasMinimumConfig(config) {
  return Boolean(config?.apiKey && config?.authDomain && config?.projectId && config?.appId)
}

async function getHostedFirebaseConfig() {
  try {
    const response = await fetch('/__/firebase/init.json', { cache: 'no-store' })
    if (!response.ok) return null
    const config = await response.json()
    return hasMinimumConfig(config) ? config : null
  } catch {
    return null
  }
}

export async function initializeFirebase() {
  const useSetting = String(import.meta.env.VITE_USE_FIREBASE || 'auto').toLowerCase()
  if (useSetting === 'false') return false

  let config = envConfig()

  // On Firebase Hosting this endpoint exposes the current project's public web config.
  // This lets the deployed app work even if a local .env file was not bundled.
  if (!hasMinimumConfig(config)) {
    const hosted = await getHostedFirebaseConfig()
    if (hosted) config = { ...hosted, databaseURL: config.databaseURL || hosted.databaseURL || '' }
  }

  if (!hasMinimumConfig(config)) {
    if (useSetting === 'true') {
      firebaseInitError = 'Firebase is enabled, but the web configuration is incomplete.'
    }
    return false
  }

  // Your current default Realtime Database. Keep the env override so the project can be moved later.
  if (!config.databaseURL && config.projectId === 'wit2026') {
    config.databaseURL = 'https://wit2026-default-rtdb.firebaseio.com'
  }

  try {
    app = getApps().length ? getApp() : initializeApp(config)
    auth = getAuth(app)
    db = getFirestore(app)
    rtdb = getDatabase(app, config.databaseURL || undefined)
    firebaseProjectId = config.projectId
    realtimeDatabaseUrl = config.databaseURL || ''
    firebaseEnabled = true
    firebaseInitError = ''
    return true
  } catch (error) {
    firebaseInitError = error?.message || 'Firebase could not be initialised.'
    firebaseEnabled = false
    return false
  }
}
