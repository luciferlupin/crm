import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreVertical, Phone, Mail, MapPin, User, Users, Building, Edit2, Save, X, MessageCircle, History, IndianRupee, TrendingUp, BarChart3, PieChart, Star, Target, AlertCircle, UserPlus, ShoppingCart } from 'lucide-react'
import { customerService } from '../services/customerService.js'

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState('')
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [customerNotes, setCustomerNotes] = useState({})
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0]
  })

  // Indian states list
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
    'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
    'Lakshadweep', 'Puducherry'
  ]

  // Save customer data to localStorage for use in other forms
  const saveCustomerToStorage = (customerData) => {
    const existingCustomers = JSON.parse(localStorage.getItem('crmCustomers') || '[]')
    const customerIndex = existingCustomers.findIndex(c => c.email === customerData.email)
    
    if (customerIndex >= 0) {
      // Update existing customer
      existingCustomers[customerIndex] = customerData
    } else {
      // Add new customer
      existingCustomers.push(customerData)
    }
    
    localStorage.setItem('crmCustomers', JSON.stringify(existingCustomers))
  }

  // Get all customers from storage
  const getAllCustomersFromStorage = () => {
    return JSON.parse(localStorage.getItem('crmCustomers') || '[]')
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await customerService.fetchCustomers()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const newCustomer = await customerService.insertCustomer(formData)
      setCustomers([newCustomer, ...customers])
      
      // Save to unified storage for other forms
      saveCustomerToStorage(formData)
      
      setShowAddForm(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        location: '',
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error adding customer:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerService.deleteCustomer(id)
        setCustomers(customers.filter(customer => customer.id !== id))
      } catch (error) {
        console.error('Error deleting customer:', error)
      }
    }
  }

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer.id)
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      location: customer.location,
      status: customer.status,
      joinDate: customer.joinDate || new Date().toISOString().split('T')[0]
    })
  }

  const handleUpdateCustomer = async (id) => {
    try {
      await customerService.updateCustomer(id, formData)
      setCustomers(customers.map(customer => 
        customer.id === id ? { ...customer, ...formData } : customer
      ))
      
      // Update in unified storage
      saveCustomerToStorage(formData)
      
      setEditingCustomer(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        location: '',
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error updating customer:', error)
    }
  }

  const handleSendWhatsAppMessage = () => {
    if (!selectedCustomer || !selectedCustomer.phone) {
      alert('Phone number is required to send WhatsApp message')
      return
    }
    
    if (!whatsappMessage.trim()) {
      alert('Please enter a message to send')
      return
    }
    
    // Clean and format phone number for WhatsApp
    let cleanPhone = selectedCustomer.phone.replace(/[\s\-\(\)]/g, '')
    
    // Handle Indian phone numbers
    if (cleanPhone.startsWith('+91')) {
      cleanPhone = cleanPhone.substring(3)
    } else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      cleanPhone = cleanPhone.substring(2)
    } else if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1)
    }
    
    // Ensure we have a valid 10-digit number for India
    if (cleanPhone.length !== 10) {
      alert('Invalid phone number format. Please ensure it\'s a valid 10-digit Indian mobile number.')
      return
    }
    
    // Create WhatsApp URL with Indian country code
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`
    
    // Open WhatsApp with message
    window.open(whatsappUrl, '_blank')
    setShowWhatsAppModal(false)
    setWhatsappMessage('')
  }

  const setMessageSuggestion = (message) => {
    setWhatsappMessage(message)
  }

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setShowCustomerModal(true)
  }

  const handleAddCustomerNote = (customerId, note) => {
    setCustomerNotes(prev => ({
      ...prev,
      [customerId]: [...(prev[customerId] || []), {
        text: note,
        timestamp: new Date().toISOString()
      }]
    }))
  }

  // Auto-fill form with existing customer data
  const autoFillFromExistingCustomer = (customerEmail) => {
    const existingCustomers = getAllCustomersFromStorage()
    const customer = existingCustomers.find(c => c.email === customerEmail)
    
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
        location: customer.location || '',
        status: customer.status || 'Active',
        joinDate: customer.joinDate || new Date().toISOString().split('T')[0]
      })
    }
  }

  // Customer Analytics Functions
  const calculateCustomerAnalytics = () => {
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.status === 'Active').length
    const inactiveCustomers = totalCustomers - activeCustomers

    // Get sales data for customer analysis
    const salesData = JSON.parse(localStorage.getItem('crm_sales') || '[]')
    
    // Calculate customer performance based on sales data
    const customerSalesMap = {}
    salesData.forEach(sale => {
      if (sale.status === 'Completed') {
        const customerName = sale.customer
        if (!customerSalesMap[customerName]) {
          customerSalesMap[customerName] = {
            totalRevenue: 0,
            orderCount: 0,
            avgOrderValue: 0,
            lastOrderDate: null,
            products: new Set()
          }
        }
        
        const amount = parseFloat(sale.amount?.replace(/[^0-9.-]/g, '')) || 0
        customerSalesMap[customerName].totalRevenue += amount
        customerSalesMap[customerName].orderCount += 1
        customerSalesMap[customerName].avgOrderValue = customerSalesMap[customerName].totalRevenue / customerSalesMap[customerName].orderCount
        customerSalesMap[customerName].products.add(sale.product)
        
        const saleDate = new Date(sale.date)
        if (!customerSalesMap[customerName].lastOrderDate || saleDate > customerSalesMap[customerName].lastOrderDate) {
          customerSalesMap[customerName].lastOrderDate = saleDate
        }
      }
    })

    // Combine customer data with sales data
    const customersWithSales = customers.map(customer => {
      const salesInfo = customerSalesMap[customer.name] || {
        totalRevenue: 0,
        orderCount: 0,
        avgOrderValue: 0,
        lastOrderDate: null,
        products: new Set()
      }
      
      return {
        ...customer,
        salesData: {
          totalRevenue: salesInfo.totalRevenue,
          orderCount: salesInfo.orderCount,
          avgOrderValue: salesInfo.avgOrderValue,
          lastOrderDate: salesInfo.lastOrderDate,
          productsPurchased: Array.from(salesInfo.products)
        }
      }
    })

    // Calculate overall metrics
    const totalRevenue = Object.values(customerSalesMap).reduce((sum, sales) => sum + sales.totalRevenue, 0)
    const totalOrders = Object.values(customerSalesMap).reduce((sum, sales) => sum + sales.orderCount, 0)
    const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    // Customer distribution by status
    const newCustomers = customers.filter(c => {
      const joinDate = c.joinDate ? new Date(c.joinDate) : new Date()
      const daysSinceJoin = (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceJoin <= 30
    }).length

    const longTermCustomers = customers.filter(c => {
      const joinDate = c.joinDate ? new Date(c.joinDate) : new Date()
      const daysSinceJoin = (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceJoin > 90
    }).length

    // Top customers by revenue
    const topCustomersByRevenue = customersWithSales
      .filter(c => c.salesData.totalRevenue > 0)
      .sort((a, b) => b.salesData.totalRevenue - a.salesData.totalRevenue)
      .slice(0, 5)

    // Top customers by order frequency
    const topCustomersByOrders = customersWithSales
      .filter(c => c.salesData.orderCount > 0)
      .sort((a, b) => b.salesData.orderCount - a.salesData.orderCount)
      .slice(0, 5)

    // Customers with no orders
    const customersWithNoOrders = customers.filter(customer => {
      const salesInfo = customerSalesMap[customer.name]
      return !salesInfo || salesInfo.orderCount === 0
    }).length

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      newCustomers,
      longTermCustomers,
      totalRevenue,
      totalOrders,
      avgCustomerValue,
      avgOrderValue,
      customersWithNoOrders,
      customersWithSales,
      topCustomersByRevenue,
      topCustomersByOrders
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const analytics = calculateCustomerAnalytics()

  const getSegmentColor = (segment) => {
    const colors = {
      'VIP': 'bg-purple-100 text-purple-800',
      'VIP New': 'bg-purple-100 text-purple-800',
      'High Value': 'bg-blue-100 text-blue-800',
      'New': 'bg-green-100 text-green-800',
      'Regular': 'bg-gray-100 text-gray-800',
      'Inactive': 'bg-red-100 text-red-800'
    }
    return colors[segment] || 'bg-gray-100 text-gray-800'
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-600 mt-2">Manage your customer relationships</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              showAnalytics 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 size={20} className="mr-2" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Customer Analytics Dashboard */}
      {showAnalytics && (
        <div className="mb-8 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.totalCustomers}</p>
                </div>
                <Users className="text-blue-500" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">₹{analytics.totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <IndianRupee className="text-yellow-500" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.totalOrders}</p>
                </div>
                <ShoppingCart className="text-purple-500" size={24} />
              </div>
            </div>
          </div>

          {/* Customer Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <BarChart3 size={20} className="mr-2 text-blue-600" />
                Customer Distribution
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-blue-900">New Customers</div>
                    <div className="text-xs text-blue-700">Joined in last 30 days</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{analytics.newCustomers}</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-green-900">Long-term Customers</div>
                    <div className="text-xs text-green-700">More than 90 days</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{analytics.longTermCustomers}</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-red-900">No Orders</div>
                    <div className="text-xs text-red-700">Customers without purchases</div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{analytics.customersWithNoOrders}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <TrendingUp size={20} className="mr-2 text-green-600" />
                Performance Metrics
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-purple-900">Avg Customer Value</div>
                    <div className="text-xs text-purple-700">Revenue per customer</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">₹{Math.round(analytics.avgCustomerValue).toLocaleString('en-IN')}</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-orange-900">Avg Order Value</div>
                    <div className="text-xs text-orange-700">Revenue per order</div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">₹{Math.round(analytics.avgOrderValue).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Customers by Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <TrendingUp size={20} className="mr-2 text-blue-600" />
              Top Customers by Revenue
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.topCustomersByRevenue.map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{customer.salesData.orderCount}</div>
                        <div className="text-xs text-gray-500">orders</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{customer.salesData.totalRevenue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Customers by Order Frequency */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Star size={20} className="mr-2 text-yellow-600" />
              Top Customers by Order Frequency
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.topCustomersByOrders.map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{customer.salesData.orderCount}</div>
                        <div className="text-xs text-gray-500">orders</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{customer.salesData.totalRevenue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Add New Customer</h3>
          
          {/* Customer Selection Dropdown */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <UserPlus size={18} className="text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-900">
                  Quick Fill from Existing Customer
                </label>
                <p className="text-xs text-blue-700 mt-1">Select a customer to auto-fill their information</p>
              </div>
            </div>
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    autoFillFromExistingCustomer(e.target.value)
                  }
                }}
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium appearance-none cursor-pointer hover:border-blue-400 transition-colors"
              >
                <option value="">👤 Choose existing customer to auto-fill...</option>
                {getAllCustomersFromStorage().map((customer, index) => (
                  <option key={index} value={customer.email} className="py-2">
                    {customer.name} • {customer.email} • {customer.company || 'No Company'}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-blue-700">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
              <span>Customers are automatically saved when you add them to any form</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-blue-400 transition-colors duration-200"
                >
                  <option value="">📍 Select a state...</option>
                  {indianStates.map((state, index) => (
                    <option key={index} value={state} className="text-gray-700">
                      {state}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6m0 0l6-6" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Customer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
              <Filter size={20} className="mr-2" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No customers found</p>
                      <p className="text-sm mt-1">Add your first customer to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.company}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {customer.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <User size={16} />
                        </button>
                        {editingCustomer === customer.id ? (
                          <button 
                            onClick={() => handleUpdateCustomer(customer.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Save"
                          >
                            <Save size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleEditCustomer(customer)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setShowWhatsAppModal(true)
                            setWhatsappMessage('')
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Send WhatsApp Message"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <User className="mr-2 text-blue-600" size={24} />
                Customer Details - {selectedCustomer.name}
              </h2>
              <button onClick={() => setShowCustomerModal(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-3 text-sm">
                  <div><strong>Name:</strong> {selectedCustomer.name}</div>
                  <div><strong>Email:</strong> {selectedCustomer.email}</div>
                  <div><strong>Phone:</strong> {selectedCustomer.phone || 'Not provided'}</div>
                  <div><strong>Company:</strong> {selectedCustomer.company || 'Not provided'}</div>
                  <div><strong>Location:</strong> {selectedCustomer.location || 'Not provided'}</div>
                  <div><strong>Status:</strong> {selectedCustomer.status}</div>
                  <div><strong>Customer Since:</strong> {selectedCustomer.joinDate || 'Not available'}</div>
                </div>
              </div>

              {/* Actions and Notes */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setShowCustomerModal(false)
                        setShowWhatsAppModal(true)
                        setWhatsappMessage('')
                      }}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                    >
                      <MessageCircle size={16} className="mr-2" />
                      Send WhatsApp Message
                    </button>
                    <button
                      onClick={() => window.open(`mailto:${selectedCustomer.email}`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                    >
                      <Mail size={16} className="mr-2" />
                      Send Email
                    </button>
                    <button
                      onClick={() => {
                        if (selectedCustomer.phone) {
                          window.open(`tel:${selectedCustomer.phone}`)
                        }
                      }}
                      disabled={!selectedCustomer.phone}
                      className={`w-full px-4 py-2 rounded-md flex items-center justify-center ${
                        selectedCustomer.phone 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Phone size={16} className="mr-2" />
                      Call Customer
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">Customer Notes</h3>
                  <textarea
                    className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                    rows="4"
                    placeholder="Add notes about this customer..."
                    onChange={(e) => {
                      const note = e.target.value
                      if (note.trim()) {
                        handleAddCustomerNote(selectedCustomer.id, note)
                      }
                    }}
                  />
                  {customerNotes[selectedCustomer.id] && (
                    <div className="mt-3 space-y-2">
                      {customerNotes[selectedCustomer.id].map((note, index) => (
                        <div key={index} className="text-xs bg-yellow-100 p-2 rounded">
                          <div className="text-gray-700">{note.text}</div>
                          <div className="text-gray-500 mt-1">
                            {new Date(note.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Messaging Modal */}
      {showWhatsAppModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <MessageCircle className="mr-2 text-green-600" size={24} />
                Send WhatsApp Message - {selectedCustomer.name}
              </h2>
              <button onClick={() => setShowWhatsAppModal(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedCustomer.name}</div>
                  <div><strong>Email:</strong> {selectedCustomer.email}</div>
                  <div><strong>Phone:</strong> {selectedCustomer.phone || 'Not provided'}</div>
                  <div><strong>Company:</strong> {selectedCustomer.company || 'Not provided'}</div>
                  <div><strong>Status:</strong> {selectedCustomer.status}</div>
                </div>
              </div>

              {/* Message Composition */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">Compose Message</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message
                    </label>
                    <textarea
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows="4"
                    />
                  </div>

                  <button
                    onClick={handleSendWhatsAppMessage}
                    disabled={!selectedCustomer?.phone || !whatsappMessage.trim()}
                    className={`w-full px-4 py-3 rounded-md flex items-center justify-center ${
                      selectedCustomer?.phone && whatsappMessage.trim()
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <MessageCircle size={20} className="mr-2" />
                    Send WhatsApp Message
                  </button>
                </div>

                {/* Message Suggestions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-3">Message Suggestions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setMessageSuggestion(`Hi ${selectedCustomer.name}! 👋\n\nThank you for being a valued customer! We wanted to check in and see how everything is going with your recent purchases.\n\nIs there anything we can help you with or any questions you have?\n\nBest regards,\nCustomer Support Team`)}
                      className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded-md hover:bg-blue-100 text-sm"
                    >
                      🤝 Customer Check-in
                    </button>
                    <button
                      onClick={() => setMessageSuggestion(`Hi ${selectedCustomer.name}! 👋\n\nGreat news! We have some exciting new products/services that we think you'll love based on your purchase history.\n\nWould you be interested in learning more about our latest offerings?\n\nBest regards,\nSales Team`)}
                      className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded-md hover:bg-blue-100 text-sm"
                    >
                      🎯 New Product Announcement
                    </button>
                    <button
                      onClick={() => setMessageSuggestion(`Hi ${selectedCustomer.name}! 👋\n\nThis is a friendly reminder about any outstanding payments or upcoming renewals for your account.\n\nPlease let us know if you have any questions or need assistance with payment processing.\n\nThank you for your continued business!\n\nBilling Team`)}
                      className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded-md hover:bg-blue-100 text-sm"
                    >
                      💳 Payment Reminder
                    </button>
                    <button
                      onClick={() => setMessageSuggestion(`Hi ${selectedCustomer.name}! 👋\n\nWe hope you're having a great week! We wanted to personally reach out and see if there's anything we can do to improve your experience with our services.\n\nYour feedback is valuable to us!\n\nCustomer Success Team`)}
                      className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded-md hover:bg-blue-100 text-sm"
                    >
                      📞 Feedback Request
                    </button>
                    <button
                      onClick={() => setMessageSuggestion(`Hi ${selectedCustomer.name}! 👋\n\nSpecial offer just for you! As a valued customer, we'd like to offer you an exclusive discount on your next purchase.\n\nUse code: CUSTOMER10\n\nLimited time offer!\n\nMarketing Team`)}
                      className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded-md hover:bg-blue-100 text-sm"
                    >
                      🎁 Special Offer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
