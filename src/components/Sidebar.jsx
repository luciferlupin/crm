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
  Package,
  Warehouse
} from 'lucide-react'
import { useState } from 'react'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Leads', icon: Target, path: '/leads' },
    { name: 'Sales', icon: TrendingUp, path: '/sales' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Inventory', icon: Warehouse, path: '/inventory' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  ]


  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md"
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
        <div className="absolute bottom-4 left-0 right-0 px-6 text-xs text-gray-400 text-center">
          Built by <a href="https://www.curiouskaizer.com/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600 underline" title="Curious Kaizer - Web Development Company in Delhi">Curious Kaizer</a>
        </div>
      </div>
    </>
  )
}

export default Sidebar
