import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useStore from './store'
import Sidebar from './components/Sidebar'
import KanbanBoard from './components/KanbanBoard'
import Header from './components/Header'
import DealModal from './components/DealModal'
import Login from './pages/Login'
import Register from './pages/Register'
import AcceptInvite from './pages/AcceptInvite'
import DashboardPage from './pages/Dashboard'
import CalendarPage from './pages/Calendar'
import MattersPage from './pages/Matters'
import ContactsPage from './pages/Contacts'
import ActivitiesPage from './pages/Activities'
import DealsPage from './pages/Deals'
import BillingPage from './pages/Billing'
import DocumentsPage from './pages/Documents'
import CommunicationsPage from './pages/Communications'
import ReportsPage from './pages/Reports'
import SettingsPage from './pages/Settings'
import api from './api'

const PipelinePage = () => {
  const [selectedDealId, setSelectedDealId] = useState(null)

  return (
    <>
      <KanbanBoard onDealClick={(id) => setSelectedDealId(id)} />
      {selectedDealId && (
        <DealModal dealId={selectedDealId} onClose={() => setSelectedDealId(null)} />
      )}
    </>
  )
}

const AppShell = () => {
  const { fetchWorkspaces } = useStore()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  return (
    <div className="flex h-screen bg-[#f0f4f8] text-foreground overflow-hidden">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {mobileSidebarOpen ? (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close sidebar"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[17rem] max-w-[85vw]">
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-5 sm:p-6 lg:p-8">
          <div className="mx-auto flex min-h-0 w-full max-w-[100rem] flex-1 flex-col rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm shadow-slate-200/40 backdrop-blur-sm sm:p-5">
            <Routes>
              <Route path="/" element={<Navigate to="/pipeline" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/pipeline" element={<PipelinePage />} />
              <Route path="/matters" element={<MattersPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/communications" element={<CommunicationsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/pipeline" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

function App() {
  const { user, setUser } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/me')
        setUser(data)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [setUser])

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/pipeline" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/pipeline" replace />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/*" element={user ? <AppShell /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
