import {
  firebaseEnabled,
  auth,
  db,
  rtdb,
  eventId,
  firebaseProjectId,
  realtimeDatabaseUrl,
  firebaseInitError
} from '../firebase'
import { createDemoData } from './seed'
import { slugId } from './utils'
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc
} from 'firebase/firestore'
import {
  get as getRealtime,
  onValue,
  push,
  ref as dbRef,
  remove as removeRealtime,
  serverTimestamp,
  set as setRealtime,
  update as updateRealtime
} from 'firebase/database'

const LOCAL_KEY = 'wit_live_data_v1'
const LOCAL_USER_KEY = 'wit_live_user_id'
const LOCAL_ADMIN_KEY = 'wit_live_admin_session'
const CHANGE_EVENT = 'wit-live-data-changed'

function nowIso() {
  return new Date().toISOString()
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function timestampToIso(value) {
  if (!value) return value
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  if (Array.isArray(value)) return value.map(timestampToIso)
  if (typeof value === 'object') {
    const result = {}
    for (const [k, v] of Object.entries(value)) result[k] = timestampToIso(v)
    return result
  }
  return value
}

function snapToItem(snap) {
  return { id: snap.id, ...timestampToIso(snap.data()) }
}

function ensureLocalData() {
  const existing = localStorage.getItem(LOCAL_KEY)
  if (existing) {
    try { return JSON.parse(existing) } catch { /* reset below */ }
  }
  const seed = createDemoData()
  localStorage.setItem(LOCAL_KEY, JSON.stringify(seed))
  return seed
}

function saveLocal(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

function localUserId() {
  let uid = localStorage.getItem(LOCAL_USER_KEY)
  if (!uid) {
    uid = `anon_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`
    localStorage.setItem(LOCAL_USER_KEY, uid)
  }
  return uid
}

function eventRef() { return doc(db, 'events', eventId) }
function childRef(name, id) { return doc(db, 'events', eventId, name, id) }
function childCollection(name) { return collection(db, 'events', eventId, name) }
function liveBase(path = '') { return `events/${eventId}${path ? `/${path}` : ''}` }
function liveRef(path = '') { return dbRef(rtdb, liveBase(path)) }


async function writeAudit(action, entity, entityId = '', summary = '', details = {}) {
  const payload = {
    action: String(action || 'change').slice(0, 80),
    entity: String(entity || 'system').slice(0, 80),
    entityId: String(entityId || '').slice(0, 160),
    summary: String(summary || '').slice(0, 500),
    details: JSON.stringify(details || {}).slice(0, 1800),
    adminUid: firebaseEnabled ? (auth.currentUser?.uid || '') : 'local-admin',
    adminEmail: firebaseEnabled ? (auth.currentUser?.email || '') : 'admin@eduvos.local',
    createdAt: firebaseEnabled ? serverTimestamp() : nowIso()
  }
  if (!firebaseEnabled) {
    const data = ensureLocalData()
    data.auditLogs ||= []
    data.auditLogs.push({ id: slugId('log'), ...payload })
    saveLocal(data)
    return
  }
  if (!auth.currentUser || auth.currentUser.isAnonymous) return
  try { await setRealtime(push(liveRef('auditLogs')), payload) } catch { /* audit must not block the live event */ }
}

export function subscribeAuditLogs(callback) {
  if (!firebaseEnabled) {
    const emit = () => callback(clone(ensureLocalData().auditLogs || []).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)))
    emit(); window.addEventListener(CHANGE_EVENT, emit); return () => window.removeEventListener(CHANGE_EVENT, emit)
  }
  return onValue(liveRef('auditLogs'), snap => {
    callback(realtimeList(snap.val()).sort((a,b)=>(Number(b.createdAt)||0)-(Number(a.createdAt)||0)))
  }, () => callback([]))
}

function realtimeList(value) {
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).map(([id, item]) => ({ id, ...(item || {}) }))
}

function questionFromRealtime(id, item, sessionId) {
  const voters = item?.voters && typeof item.voters === 'object' ? item.voters : {}
  const voterIds = Object.keys(voters).filter(uid => voters[uid] === true)
  return {
    id,
    ...(item || {}),
    sessionId: item?.sessionId || sessionId,
    voterIds,
    voteCount: voterIds.length
  }
}

function readableAuthError(error) {
  const code = error?.code || ''
  if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
    return 'That Firebase Authentication account does not exist or the password is wrong. The old admin@eduvos.local / admin123 login was demo-only.'
  }
  if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation') {
    return 'Anonymous sign-in is disabled for attendees. In Firebase Console go to Authentication → Sign-in method → Anonymous → Enable. This does not require Blaze.'
  }
  if (code === 'auth/too-many-requests') return 'Firebase temporarily blocked sign-in after too many attempts. Wait a little and try again.'
  if (code === 'permission-denied' || code === 'PERMISSION_DENIED') return 'Firebase blocked this request. Deploy the included Firestore and Realtime Database security rules.'
  return error?.message || 'Firebase request failed.'
}

async function verifyAdminUser(user) {
  const adminSnap = await getDoc(doc(db, 'admins', user.uid))
  if (!adminSnap.exists() || adminSnap.data()?.active !== true) {
    return { ok: false, reason: `Create Firestore document admins/${user.uid} with active = true.` }
  }
  return { ok: true, role: adminSnap.data()?.role || 'admin' }
}

export const modeLabel = firebaseEnabled ? 'Firestore + RTDB Live' : 'Local demo'
export const isFirebaseMode = firebaseEnabled

export function getFirebaseDiagnostics() {
  return {
    enabled: firebaseEnabled,
    projectId: firebaseProjectId || 'not configured',
    databaseUrl: realtimeDatabaseUrl || 'default database URL',
    initError: firebaseInitError || ''
  }
}


export function friendlyErrorMessage(error) {
  const code = error?.code || ''
  const message = String(error?.message || '')
  if (code.includes('auth/') || message.includes('auth/')) return 'We could not complete the sign-in. Please check your details and try again.'
  if (code === 'permission-denied' || code === 'PERMISSION_DENIED' || message.toLowerCase().includes('permission')) return 'This action is not available right now. Please try again or report the issue.'
  if (message === 'POPUP_BLOCKED') return 'Your browser blocked the programme download window. Allow pop-ups for this site and try again.'
  if (message.toLowerCase().includes('network')) return 'The connection was interrupted. Please check your internet connection and try again.'
  return 'Something went wrong. Please try again. If it continues, report the issue to the event team.'
}

export async function reportError(error, context='application', extra={}) {
  const technicalMessage = String(error?.message || error || 'Unknown error').slice(0, 1200)
  const payload = {
    context: String(context || 'application').slice(0, 80),
    friendlyMessage: friendlyErrorMessage(error),
    technicalMessage,
    code: String(error?.code || '').slice(0, 120),
    url: typeof window !== 'undefined' ? window.location.href.slice(0, 500) : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : '',
    extra: JSON.stringify(extra || {}).slice(0, 1200),
    createdAt: firebaseEnabled ? serverTimestamp() : nowIso()
  }
  if (!firebaseEnabled) {
    const data = ensureLocalData(); data.errorReports ||= []; data.errorReports.push({id:slugId('error'),...payload}); saveLocal(data); return
  }
  try {
    const user = auth.currentUser || (await signInAnonymously(auth)).user
    payload.userId = user.uid
    const r = push(liveRef('errorReports'))
    await setRealtime(r, payload)
  } catch { /* avoid error-report loops */ }
  const endpoint = String(import.meta.env.VITE_RESEND_ENDPOINT || import.meta.env.VITE_ERROR_REPORT_ENDPOINT || '').trim()
  if (endpoint) {
    try {
      await fetch(endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({kind:'error',...payload})
      })
    } catch { /* RTDB remains the fallback */ }
  }
}

export async function sendContactEmail({to,contactName,subject,where,message,replyTo}) {
  const endpoint = String(import.meta.env.VITE_RESEND_ENDPOINT || '').trim()
  if (!endpoint) throw new Error('EMAIL_SERVICE_NOT_CONFIGURED')
  const response = await fetch(endpoint,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({kind:'contact',to,contactName,subject,where,message,replyTo})
  })
  if (!response.ok) throw new Error('EMAIL_SEND_FAILED')
  return response.json().catch(()=>({ok:true}))
}

export function subscribeErrorReports(callback) {
  if (!firebaseEnabled) {
    const emit=()=>callback(clone(ensureLocalData().errorReports||[])); emit(); window.addEventListener(CHANGE_EVENT,emit); return()=>window.removeEventListener(CHANGE_EVENT,emit)
  }
  return onValue(liveRef('errorReports'),snap=>callback(realtimeList(snap.val()).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))))
}

export function subscribeRealtimeConnection(callback) {
  if (!firebaseEnabled) {
    callback(true)
    return () => {}
  }
  return onValue(dbRef(rtdb, '.info/connected'), snap => callback(snap.val() === true))
}

export function subscribeCore(callback) {
  if (!firebaseEnabled) {
    const emit = () => {
      const data = ensureLocalData()
      callback({
        event: clone(data.event),
        sessions: clone(data.sessions || []),
        speakers: clone(data.speakers || []),
        announcements: clone(data.announcements || []),
        liveState: clone(data.liveState || {})
      })
    }
    emit()
    window.addEventListener(CHANGE_EVENT, emit)
    return () => window.removeEventListener(CHANGE_EVENT, emit)
  }

  // Firestore stores the slower-changing event/programme/speaker data.
  // Realtime Database stores every live-event control so changes broadcast instantly.
  const state = {
    event: null,
    firestoreSessions: [],
    speakers: [],
    announcements: [],
    liveState: {},
    qnaState: {},
    liveNotice: null
  }

  const emit = () => {
    const sessions = state.firestoreSessions.map(session => {
      const liveQna = state.qnaState?.[session.id]
      return {
        ...session,
        qnaEnabled: typeof liveQna?.enabled === 'boolean' ? liveQna.enabled : Boolean(session.qnaEnabled)
      }
    })

    const event = state.event
      ? {
          ...state.event,
          liveNotice: state.liveNotice && typeof state.liveNotice === 'object'
            ? state.liveNotice
            : state.event.liveNotice
        }
      : state.event

    callback(clone({
      event,
      sessions,
      speakers: state.speakers,
      announcements: state.announcements,
      liveState: state.liveState
    }))
  }

  const unsubs = [
    onSnapshot(eventRef(), snap => {
      state.event = snap.exists() ? { id: snap.id, ...timestampToIso(snap.data()) } : null
      emit()
    }),
    onSnapshot(childCollection('sessions'), snap => {
      state.firestoreSessions = snap.docs.map(snapToItem)
      emit()
    }),
    onSnapshot(childCollection('speakers'), snap => {
      state.speakers = snap.docs.map(snapToItem)
      emit()
    }),
    onValue(liveRef('announcements'), snap => {
      state.announcements = realtimeList(snap.val())
      emit()
    }),
    onValue(liveRef('live'), snap => {
      state.liveState = snap.val() || {}
      emit()
    }),
    onValue(liveRef('qna'), snap => {
      state.qnaState = snap.val() || {}
      emit()
    }),
    onValue(liveRef('notice'), snap => {
      state.liveNotice = snap.val() || null
      emit()
    })
  ]
  return () => unsubs.forEach(fn => fn())
}

export function subscribeQuestions(sessionId, callback) {
  if (!sessionId) {
    callback([])
    return () => {}
  }
  if (!firebaseEnabled) {
    const emit = () => callback(clone((ensureLocalData().questions || []).filter(q => q.sessionId === sessionId)))
    emit()
    window.addEventListener(CHANGE_EVENT, emit)
    return () => window.removeEventListener(CHANGE_EVENT, emit)
  }

  return onValue(liveRef(`questions/${sessionId}`), snap => {
    const value = snap.val() || {}
    callback(Object.entries(value).map(([id, item]) => questionFromRealtime(id, item, sessionId)))
  })
}

export function subscribeAllQuestions(callback) {
  if (!firebaseEnabled) {
    const emit = () => callback(clone(ensureLocalData().questions || []))
    emit()
    window.addEventListener(CHANGE_EVENT, emit)
    return () => window.removeEventListener(CHANGE_EVENT, emit)
  }

  return onValue(liveRef('questions'), snap => {
    const root = snap.val() || {}
    const all = []
    for (const [sessionId, questions] of Object.entries(root)) {
      for (const [id, item] of Object.entries(questions || {})) {
        all.push(questionFromRealtime(id, item, sessionId))
      }
    }
    callback(all)
  })
}


export function subscribeConcerns(callback) {
  if (!firebaseEnabled) {
    const emit = () => callback(clone(ensureLocalData().concerns || []))
    emit()
    window.addEventListener(CHANGE_EVENT, emit)
    return () => window.removeEventListener(CHANGE_EVENT, emit)
  }

  return onValue(liveRef('concerns'), snap => {
    callback(realtimeList(snap.val()))
  }, error => {
    console.error('Concern listener failed:', error)
    callback([])
  })
}

export function subscribePublicFeedback(callback) {
  if (!firebaseEnabled) {
    const emit = () => callback(clone(ensureLocalData().feedback || []).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)))
    emit()
    window.addEventListener(CHANGE_EVENT, emit)
    return () => window.removeEventListener(CHANGE_EVENT, emit)
  }

  return onSnapshot(childCollection('publicFeedback'), snap => {
    callback(snap.docs.map(snapToItem).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)))
  }, error => {
    console.error('Feedback listener failed:', error)
    callback([])
  })
}

export function subscribeFeedback(callback) {
  return subscribePublicFeedback(callback)
}

export async function ensureAttendeeAuth() {
  if (!firebaseEnabled) return { uid: localUserId(), isAnonymous: true }
  if (auth.currentUser) return auth.currentUser
  try {
    const result = await signInAnonymously(auth)
    return result.user
  } catch (error) {
    throw new Error(readableAuthError(error))
  }
}

export function observeAuth(callback) {
  if (!firebaseEnabled) {
    const admin = localStorage.getItem(LOCAL_ADMIN_KEY)
    callback(admin ? { uid: 'local-admin', email: 'admin@eduvos.local', isAnonymous: false } : null)
    const listener = () => {
      const active = localStorage.getItem(LOCAL_ADMIN_KEY)
      callback(active ? { uid: 'local-admin', email: 'admin@eduvos.local', isAnonymous: false } : null)
    }
    window.addEventListener('wit-admin-auth', listener)
    return () => window.removeEventListener('wit-admin-auth', listener)
  }

  return onAuthStateChanged(auth, async user => {
    if (!user || user.isAnonymous) { callback(null); return }
    try {
      const verification = await verifyAdminUser(user)
      if (verification.ok) {
        callback(user)
        syncRealtimeDefaults().catch(() => {})
      } else callback(null)
    } catch {
      callback(null)
    }
  })
}

export async function loginAdmin(email, password) {
  if (!firebaseEnabled) {
    if (email.trim().toLowerCase() !== 'admin@eduvos.local' || password !== 'admin123') {
      throw new Error('Use the demo credentials shown below the form.')
    }
    localStorage.setItem(LOCAL_ADMIN_KEY, '1')
    window.dispatchEvent(new CustomEvent('wit-admin-auth'))
    return { uid: 'local-admin', email }
  }

  let result
  try {
    result = await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    throw new Error(readableAuthError(error))
  }

  const verification = await verifyAdminUser(result.user)
  if (!verification.ok) {
    await firebaseSignOut(auth)
    throw new Error(`The account signed in, but it is not fully configured as an admin. ${verification.reason}`)
  }
  syncRealtimeDefaults().catch(() => {})
  await writeAudit('login','admin',result.user.uid,`Admin signed in: ${result.user.email || ''}`)
  return result.user
}

export async function logoutAdmin() {
  if (!firebaseEnabled) {
    localStorage.removeItem(LOCAL_ADMIN_KEY)
    window.dispatchEvent(new CustomEvent('wit-admin-auth'))
    return
  }
  await writeAudit('logout','admin',auth.currentUser?.uid || '',`Admin signed out: ${auth.currentUser?.email || ''}`)
  await firebaseSignOut(auth)
}

export async function syncRealtimeDefaults() {
  if (!firebaseEnabled || !auth.currentUser || auth.currentUser.isAnonymous) return
  try {
    const allSessions = await getDocs(childCollection('sessions'))
    const qnaSnap = await getRealtime(liveRef('qna'))
    const existing = qnaSnap.val() || {}
    const updates = {}
    allSessions.docs.forEach(snap => {
      if (!existing[snap.id] || typeof existing[snap.id]?.enabled !== 'boolean') {
        updates[`qna/${snap.id}/enabled`] = Boolean(snap.data()?.qnaEnabled)
        updates[`qna/${snap.id}/updatedAt`] = Date.now()
      }
    })
    if (Object.keys(updates).length) await updateRealtime(liveRef(), updates)
  } catch (error) {
    console.warn('Realtime defaults could not be synced:', error)
  }
}

export async function createQuestion(sessionId, text) {
  const user = await ensureAttendeeAuth()
  const payload = {
    sessionId,
    text: text.trim().slice(0, 500),
    userId: user.uid,
    status: 'visible',
    pinned: false,
    answered: false,
    createdAt: firebaseEnabled ? serverTimestamp() : nowIso(),
    updatedAt: firebaseEnabled ? serverTimestamp() : nowIso()
  }

  if (!firebaseEnabled) {
    const data = ensureLocalData()
    data.questions ||= []
    data.questions.push({ id: slugId('question'), voteCount: 0, voterIds: [], ...payload })
    saveLocal(data)
    return
  }

  const questionRef = push(liveRef(`questions/${sessionId}`))
  await setRealtime(questionRef, payload)
}

export async function toggleVote(question) {
  const user = await ensureAttendeeAuth()
  const hasVoted = (question.voterIds || []).includes(user.uid)

  if (!firebaseEnabled) {
    const data = ensureLocalData()
    const target = (data.questions || []).find(q => q.id === question.id)
    if (!target) return
    target.voterIds ||= []
    const idx = target.voterIds.indexOf(user.uid)
    if (idx >= 0) target.voterIds.splice(idx, 1)
    else target.voterIds.push(user.uid)
    target.voteCount = target.voterIds.length
    target.updatedAt = nowIso()
    saveLocal(data)
    return
  }

  const voteRef = liveRef(`questions/${question.sessionId}/${question.id}/voters/${user.uid}`)
  if (hasVoted) await removeRealtime(voteRef)
  else await setRealtime(voteRef, true)
}

export async function submitFeedback(rating, comment = '') {
  await ensureAttendeeAuth()
  const payload = { rating: Number(rating), comment: comment.trim().slice(0, 500), createdAt: nowIso() }
  if (!firebaseEnabled) {
    const data = ensureLocalData()
    data.feedback ||= []
    data.feedback.push({ id: slugId('feedback'), ...payload })
    saveLocal(data)
    return
  }
  const feedbackRef = doc(childCollection('publicFeedback'))
  await setDoc(feedbackRef, payload)
}

export async function saveEvent(values) {
  const payload = { ...values, updatedAt: nowIso() }
  if (!firebaseEnabled) {
    const data = ensureLocalData()
    data.event = { ...data.event, ...payload }
    saveLocal(data)
    return
  }
  await setDoc(eventRef(), payload, { merge: true })
  await writeAudit('update','event',eventId,'Updated event settings')
}


export async function setSessionQnaEnabled(sessionId, enabled) {
  const value = Boolean(enabled)
  if (!firebaseEnabled) {
    const data = ensureLocalData()
    const target = (data.sessions || []).find(s => s.id === sessionId)
    if (target) {
      target.qnaEnabled = value
      target.updatedAt = nowIso()
      saveLocal(data)
    }
    return
  }
  await updateRealtime(liveRef(`qna/${sessionId}`), {
    enabled: value,
    updatedAt: serverTimestamp()
  })
  await writeAudit('update','qna',sessionId,`Q&A ${value ? 'opened' : 'closed'}`)
}

export async function saveSession(values) {
  const id = values.id || slugId('session')
  const payload = { ...values, id: undefined, updatedAt: nowIso() }
  delete payload.id

  if (!firebaseEnabled) {
    const data = ensureLocalData()
    const index = (data.sessions || []).findIndex(s => s.id === id)
    if (index >= 0) data.sessions[index] = { ...data.sessions[index], ...values, id, updatedAt: nowIso() }
    else data.sessions.push({ ...values, id, createdAt: nowIso(), updatedAt: nowIso() })
    data.liveState ||= {}
    if (values.manualStatus === 'live') data.liveState = { forcedSessionId: id, mode: 'manual', updatedAt: nowIso() }
    else if (data.liveState.forcedSessionId === id) data.liveState = { forcedSessionId: null, mode: 'auto', updatedAt: nowIso() }
    saveLocal(data)
    return id
  }

  await setDoc(childRef('sessions', id), payload, { merge: true })
  await updateRealtime(liveRef(`qna/${id}`), {
    enabled: Boolean(values.qnaEnabled),
    updatedAt: serverTimestamp()
  })

  const stateRef = liveRef('live')
  if (values.manualStatus === 'live') {
    // Keep only one manually-forced live session at a time.
    const allSessions = await getDocs(childCollection('sessions'))
    await Promise.all(allSessions.docs
      .filter(snap => snap.id !== id && snap.data()?.manualStatus === 'live')
      .map(snap => setDoc(childRef('sessions', snap.id), { manualStatus: 'auto', updatedAt: nowIso() }, { merge: true })))
    await updateRealtime(stateRef, { forcedSessionId: id, mode: 'manual', updatedAt: serverTimestamp() })
  } else {
    const stateSnap = await getRealtime(stateRef)
    if (stateSnap.val()?.forcedSessionId === id) {
      await updateRealtime(stateRef, { forcedSessionId: null, mode: 'auto', updatedAt: serverTimestamp() })
    }
  }

  await writeAudit('save','session',id,`Saved session: ${values.title || id}`)
  return id
}

export async function deleteSession(id) {
  if (!firebaseEnabled) {
    const data = ensureLocalData()
    data.sessions = (data.sessions || []).filter(s => s.id !== id)
    data.questions = (data.questions || []).filter(q => q.sessionId !== id)
    if (data.liveState?.forcedSessionId === id) data.liveState = { forcedSessionId: null, mode: 'auto', updatedAt: nowIso() }
    saveLocal(data)
    return
  }

  await deleteDoc(childRef('sessions', id))
  await removeRealtime(liveRef(`questions/${id}`))
  await removeRealtime(liveRef(`qna/${id}`))
  const stateSnap = await getRealtime(liveRef('live'))
  if (stateSnap.val()?.forcedSessionId === id) {
    await updateRealtime(liveRef('live'), { forcedSessionId: null, mode: 'auto', updatedAt: serverTimestamp() })
  }
  await writeAudit('delete','session',id,'Deleted session')
}

export async function saveSpeaker(values) {
  const id = values.id || slugId('speaker')
  const payload = { ...values, id: undefined, updatedAt: nowIso() }
  delete payload.id
  if (!firebaseEnabled) {
    const data = ensureLocalData()
    const index = (data.speakers || []).findIndex(s => s.id === id)
    if (index >= 0) data.speakers[index] = { ...data.speakers[index], ...values, id, updatedAt: nowIso() }
    else data.speakers.push({ ...values, id, createdAt: nowIso(), updatedAt: nowIso() })
    saveLocal(data)
    return id
  }
  await setDoc(childRef('speakers', id), payload, { merge: true })
  await writeAudit('save','speaker',id,`Saved speaker: ${values.name || id}`,{showOnPanel:values.showOnPanel!==false,category:values.category||'Speaker'})
  return id
}

export async function deleteSpeaker(id) {
  if (!firebaseEnabled) {
    const data = ensureLocalData()
    data.speakers = (data.speakers || []).filter(s => s.id !== id)
    data.sessions = (data.sessions || []).map(s => ({ ...s, speakerIds: (s.speakerIds || []).filter(v => v !== id) }))
    saveLocal(data)
    return
  }
  await deleteDoc(childRef('speakers', id))
  await writeAudit('delete','speaker',id,'Deleted speaker')
}


export async function createConcern({ category, message, contact = '' }) {
  const user = await ensureAttendeeAuth()
  const payload = {
    userId: user.uid,
    category: String(category || 'Other').trim().slice(0, 50),
    message: String(message || '').trim().slice(0, 700),
    contact: String(contact || '').trim().slice(0, 120),
    status: 'new',
    createdAt: firebaseEnabled ? serverTimestamp() : nowIso(),
    updatedAt: firebaseEnabled ? serverTimestamp() : nowIso()
  }
  if (payload.message.length < 3) throw new Error('Please describe the concern before sending it.')

  if (!firebaseEnabled) {
    const data = ensureLocalData()
    data.concerns ||= []
    data.concerns.push({ id: slugId('concern'), ...payload })
    saveLocal(data)
    return
  }

  const concernRef = push(liveRef('concerns'))
  await setRealtime(concernRef, payload)
}

export async function updateConcernAdmin(id, patch) {
  const allowed = {}
  if (patch.status && ['new', 'seen', 'resolved'].includes(patch.status)) allowed.status = patch.status
  allowed.updatedAt = firebaseEnabled ? serverTimestamp() : nowIso()

  if (!firebaseEnabled) {
    const data = ensureLocalData()
    const target = (data.concerns || []).find(c => c.id === id)
    if (target) Object.assign(target, allowed)
    saveLocal(data)
    return
  }

  await updateRealtime(liveRef(`concerns/${id}`), allowed)
  await writeAudit('update','concern',id,`Concern marked ${allowed.status || 'updated'}`)
}

export async function deleteConcern(id) {
  if (!firebaseEnabled) {
    const data = ensureLocalData()
    data.concerns = (data.concerns || []).filter(c => c.id !== id)
    saveLocal(data)
    return
  }
  await removeRealtime(liveRef(`concerns/${id}`))
  await writeAudit('delete','concern',id,'Deleted concern')
}

export async function saveLiveNotice({ message = '', active = false }) {
  const payload = {
    message: String(message || '').trim().slice(0, 300),
    active: Boolean(active),
    updatedAt: firebaseEnabled ? serverTimestamp() : nowIso()
  }

  if (!firebaseEnabled) {
    const data = ensureLocalData()
    data.event = { ...data.event, liveNotice: payload, updatedAt: nowIso() }
    saveLocal(data)
    return
  }

  await setRealtime(liveRef('notice'), payload)
  await writeAudit('update','notice','live',payload.active ? `Published notice: ${payload.message}` : 'Hid live notice')
}

export async function saveAnnouncement(values) {
  const id = values.id || slugId('announcement')
  const payload = {
    message: String(values.message || '').trim().slice(0, 300),
    active: values.active !== false,
    createdAt: values.createdAt || (firebaseEnabled ? serverTimestamp() : nowIso()),
    updatedAt: firebaseEnabled ? serverTimestamp() : nowIso()
  }

  if (!firebaseEnabled) {
    const data = ensureLocalData()
    const index = (data.announcements || []).findIndex(a => a.id === id)
    if (index >= 0) data.announcements[index] = { ...data.announcements[index], ...payload, id }
    else data.announcements.push({ id, ...payload })
    saveLocal(data)
    return id
  }

  await updateRealtime(liveRef(`announcements/${id}`), payload)
  await writeAudit('save','announcement',id,`Saved announcement: ${payload.message}`)
  return id
}

export async function deleteAnnouncement(id) {
  if (!firebaseEnabled) {
    const data = ensureLocalData()
    data.announcements = (data.announcements || []).filter(a => a.id !== id)
    saveLocal(data)
    return
  }
  await removeRealtime(liveRef(`announcements/${id}`))
  await writeAudit('delete','announcement',id,'Deleted announcement')
}

export async function updateQuestionAdmin(sessionId, id, patch) {
  if (!firebaseEnabled) {
    const data = ensureLocalData()
    const q = (data.questions || []).find(v => v.id === id)
    if (q) Object.assign(q, patch, { updatedAt: nowIso() })
    saveLocal(data)
    return
  }
  await updateRealtime(liveRef(`questions/${sessionId}/${id}`), { ...patch, updatedAt: serverTimestamp() })
  await writeAudit('update','question',id,'Moderated Q&A question',{sessionId,...patch})
}

export async function deleteQuestion(sessionId, id) {
  if (!firebaseEnabled) {
    const data = ensureLocalData()
    data.questions = (data.questions || []).filter(q => q.id !== id)
    saveLocal(data)
    return
  }
  await removeRealtime(liveRef(`questions/${sessionId}/${id}`))
  await writeAudit('delete','question',id,'Deleted Q&A question',{sessionId})
}

export async function loadStarterContent() {
  const seed = createDemoData()
  if (!firebaseEnabled) {
    saveLocal(seed)
    return
  }

  await setDoc(eventRef(), seed.event, { merge: true })
  await Promise.all(seed.sessions.map(s => {
    const { id, ...rest } = s
    return setDoc(childRef('sessions', id), rest, { merge: true })
  }))
  await Promise.all(seed.speakers.map(s => {
    const { id, ...rest } = s
    return setDoc(childRef('speakers', id), rest, { merge: true })
  }))

  const qnaUpdates = {}
  for (const session of seed.sessions || []) {
    qnaUpdates[`qna/${session.id}/enabled`] = Boolean(session.qnaEnabled)
    qnaUpdates[`qna/${session.id}/updatedAt`] = Date.now()
  }
  if (Object.keys(qnaUpdates).length) await updateRealtime(liveRef(), qnaUpdates)

  await setRealtime(liveRef('notice'), {
    message: 'Welcome to the Women in Tech Summit. Programme changes will appear here live.',
    active: true,
    updatedAt: serverTimestamp()
  })

  const announcementUpdates = {}
  for (const item of seed.announcements || []) {
    const { id, ...rest } = item
    announcementUpdates[id] = { ...rest, updatedAt: Date.now() }
  }
  await setRealtime(liveRef('announcements'), announcementUpdates)

  const questionUpdates = {}
  for (const q of seed.questions || []) {
    const voters = {}
    for (let i = 0; i < (q.voteCount || 0); i += 1) voters[`seed_voter_${i + 1}`] = true
    questionUpdates[`${q.sessionId}/${q.id}`] = {
      sessionId: q.sessionId,
      text: q.text,
      userId: q.userId,
      status: q.status || 'visible',
      pinned: Boolean(q.pinned),
      answered: Boolean(q.answered),
      createdAt: Date.parse(q.createdAt) || Date.now(),
      updatedAt: Date.now(),
      voters
    }
  }
  if (Object.keys(questionUpdates).length) await updateRealtime(liveRef('questions'), questionUpdates)
  await updateRealtime(liveRef('live'), { forcedSessionId: null, mode: 'auto', updatedAt: serverTimestamp() })
  await writeAudit('seed','system',eventId,'Loaded starter content')
}

export function getLocalAttendeeUid() {
  if (!firebaseEnabled) return localUserId()
  return auth.currentUser?.uid || null
}
