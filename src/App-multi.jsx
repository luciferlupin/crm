import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext-multi.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Customers from './pages/Customers.jsx'
import Leads from './pages/Leads.jsx'
import Sales from './pages/Sales.jsx'
import Tasks from './pages/Tasks.jsx'
import Login from './components/Login-multi.jsx'

function AppContent() {
  const { user, loading, userSupabase } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard userSupabase={userSupabase} />} />
          <Route path="/customers" element={<Customers userSupabase={userSupabase} />} />
          <Route path="/leads" element={<Leads userSupabase={userSupabase} />} />
          <Route path="/sales" element={<Sales userSupabase={userSupabase} />} />
          <Route path="/tasks" element={<Tasks userSupabase={userSupabase} />} />
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
