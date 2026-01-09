import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Target, 
  CheckSquare,
  Menu,
  X,
  LogOut,
  Package,
  Warehouse
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Leads', icon: Target, path: '/leads' },
    { name: 'Sales', icon: TrendingUp, path: '/sales' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Inventory', icon: Warehouse, path: '/inventory' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      <div className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">CRM Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Business Management</p>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : ''
                  }`
                }
              >
                <Icon size={20} className="mr-3" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="bg-gray-100 rounded-lg p-4 mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate" title={user?.email || 'User'}>
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500">Business Owner</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
