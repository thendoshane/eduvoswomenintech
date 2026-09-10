import React from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AppDataProvider, useAppData } from './context'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import Loading from './components/Loading'
import HomePage from './pages/HomePage'
import ProgrammePage from './pages/ProgrammePage'
import SpeakersPage from './pages/SpeakersPage'
import SpeakerDetailPage from './pages/SpeakerDetailPage'
import SessionPage from './pages/SessionPage'
import QnAPage from './pages/QnAPage'
import InfoPage from './pages/InfoPage'
import AdminPage from './pages/AdminPage'
import ConcernsPage from './pages/ConcernsPage'
import NotificationBanner from './components/NotificationBanner'

function PublicShell() {
  const { loading } = useAppData()
  const location = useLocation()
  if (loading) return <Loading />
  const isAdmin = location.pathname.startsWith('/admin')
  if (isAdmin) return <AdminPage />
  return (
    <div className="app-shell">
      <TopBar />
      <NotificationBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/programme" element={<ProgrammePage />} />
        <Route path="/speakers" element={<SpeakersPage />} />
        <Route path="/speakers/:id" element={<SpeakerDetailPage />} />
        <Route path="/session/:id" element={<SessionPage />} />
        <Route path="/qna" element={<QnAPage />} />
        <Route path="/qna/:sessionId" element={<QnAPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/concerns" element={<ConcernsPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppDataProvider>
        <PublicShell />
      </AppDataProvider>
    </BrowserRouter>
  )
}
