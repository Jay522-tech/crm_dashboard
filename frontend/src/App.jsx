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
import DocumentsPage from './pages/Documents'
import CommunicationsPage from './pages/Communications'
import ReportsPage from './pages/Reports'
import SettingsPage from './pages/Settings'
import TeamPage from './pages/Team'
import api, { clearAuthToken, setAuthToken } from './api'

const PipelinePage = ({ onDealClick, onCreateDealRequest }) => {
  return (
    <KanbanBoard
      onDealClick={onDealClick}
      onCreateDealRequest={onCreateDealRequest}
    />
  )
}

const AppShell = () => {
  const { fetchWorkspaces } = useStore()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false)
  const [selectedDealId, setSelectedDealId] = useState(null)
  const [defaultStageForNew, setDefaultStageForNew] = useState('Lead')

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const handleCreateDealRequest = ({ stage = 'Lead' } = {}) => {
    setDefaultStageForNew(stage)
    setSelectedDealId('new')
  }

  const handleSidebarToggle = () => {
    if (window.innerWidth >= 768) {
      setDesktopSidebarCollapsed((prev) => !prev)
      return
    }
    setMobileSidebarOpen(true)
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {!desktopSidebarCollapsed ? (
        <div className="hidden md:flex">
          <Sidebar />
        </div>
      ) : null}

      {mobileSidebarOpen ? (
        <div className="md:hidden fixed inset-0 z-[1000]">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close sidebar"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[17rem] max-w-[85vw] h-full">
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      ) : null}
      {/* overflow only on <main>: header dropdowns use position:absolute and must not be clipped */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header
          onMenuClick={handleSidebarToggle}
          onCreateDealRequest={handleCreateDealRequest}
        />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 sm:p-4 lg:p-6">
          <div className="mx-auto flex min-h-0 w-full max-w-[100rem] flex-1 flex-col rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm backdrop-blur-sm sm:p-4 lg:p-5 overflow-y-auto no-scrollbar">
            <Routes>
              <Route path="/" element={<Navigate to="/pipeline" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route
                path="/pipeline"
                element={<PipelinePage onDealClick={(id) => setSelectedDealId(id)} onCreateDealRequest={handleCreateDealRequest} />}
              />
              <Route path="/matters" element={<MattersPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/communications" element={<CommunicationsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="*" element={<Navigate to="/pipeline" replace />} />
            </Routes>
          </div>
        </main>
        {selectedDealId && (
          <DealModal
            dealId={selectedDealId}
            onClose={() => setSelectedDealId(null)}
            defaultStage={defaultStageForNew}
          />
        )}
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
        const { data } = await api.get('/auth/me');
        if (data.token) {
          setAuthToken(data.token);
        }
        setUser(data);

      } catch {
        clearAuthToken()
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
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
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
