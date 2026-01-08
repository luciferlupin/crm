import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Customers from './pages/Customers.jsx'
import Leads from './pages/Leads.jsx'
import Sales from './pages/Sales.jsx'
import Tasks from './pages/Tasks.jsx'
import Login from './components/Login.jsx'

function AppContent() {
  const { user, loading } = useAuth()

  console.log('AppContent: Rendering with state:', { user: !!user, loading })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    console.log('AppContent: Showing login page')
    return <Login />
  }

  console.log('AppContent: Showing dashboard')
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
