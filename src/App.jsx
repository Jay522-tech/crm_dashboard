import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useStore from './store'
import Sidebar from './components/Sidebar'
import KanbanBoard from './components/KanbanBoard'
import Header from './components/Header'
import DealModal from './components/DealModal'
import Login from './pages/Login'
import Register from './pages/Register'
import api from './api'

const Dashboard = () => {
  const [selectedDealId, setSelectedDealId] = useState(null)
  const { fetchWorkspaces } = useStore()

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <KanbanBoard onDealClick={(id) => setSelectedDealId(id)} />
        </main>
      </div>
      {selectedDealId && (
        <DealModal dealId={selectedDealId} onClose={() => setSelectedDealId(null)} />
      )}
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
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
