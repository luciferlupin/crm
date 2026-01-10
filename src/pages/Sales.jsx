import React, { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Filter, Plus, Edit2, Save, X, IndianRupee, BarChart3, PieChart, Target, Activity, TrendingDown, AlertCircle, Star, Award, UserPlus } from 'lucide-react'
import SalesChart from '../components/SalesChart.jsx'
import TopProducts from '../components/TopProducts.jsx'
import { salesService } from '../services/salesService.js'
import { formatIndianCurrency, parseIndianCurrency, formatIndianCurrencyInput } from '../utils/currency.js'

const Sales = () => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [productSuggestions, setProductSuggestions] = useState([])
  const [showProductSuggestions, setShowProductSuggestions] = useState(false)
  const [formData, setFormData] = useState({
    customer: '',
    product: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Completed',
    location: ''
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

  // Months list
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Generate years from current year to 10 years back
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i)

  // Generate days array (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  // Product search functionality
  const handleProductSearch = (searchTerm) => {
    setFormData({...formData, product: searchTerm});
    
    if (searchTerm.length > 0) {
      // Get unique products from existing sales
      const allProducts = [...new Set(sales.map(sale => sale.product).filter(Boolean))];
      
      // Filter products based on search term
      const filtered = allProducts.filter(product => 
        product.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setProductSuggestions(filtered);
      setShowProductSuggestions(true);
    } else {
      setProductSuggestions([]);
      setShowProductSuggestions(false);
    }
  };

  const selectProduct = (product) => {
    setFormData({...formData, product});
    setShowProductSuggestions(false);
    setProductSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProductSuggestions && !event.target.closest('.product-search-container')) {
        setShowProductSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProductSuggestions]);

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

  // Auto-fill form with existing customer data
  const autoFillFromExistingCustomer = (customerEmail) => {
    const existingCustomers = getAllCustomersFromStorage()
    const customer = existingCustomers.find(c => c.email === customerEmail)
    
    if (customer) {
      setFormData({
        customer: customer.name || '',
        product: '',
        amount: '', // Don't auto-fill amount as it may differ
        date: new Date().toISOString().split('T')[0],
        status: 'Completed'
      })
    }
  }

  useEffect(() => {
    fetchSales()
    
    // Listen for sales data updates from lead conversions
    const handleSalesDataUpdate = () => {
      console.log('Sales data updated, refreshing...')
      fetchSales()
    }
    
    window.addEventListener('salesDataUpdated', handleSalesDataUpdate)
    
    return () => {
      window.removeEventListener('salesDataUpdated', handleSalesDataUpdate)
    }
  }, [])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const data = await salesService.fetchSales()
      setSales(data)
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const newSale = await salesService.insertSale(formData)
      setSales([newSale, ...sales])
      
      // Save customer data to unified storage
      saveCustomerToStorage({
        name: formData.customer,
        email: formData.customer.toLowerCase().replace(/\s+/g, '.') + '@example.com', // Generate email from name
        company: '',
        phone: '',
        location: formData.location,
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0]
      })
      
      setShowAddForm(false)
      setFormData({
        customer: '',
        product: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        location: ''
      })
    } catch (error) {
      console.error('Error adding sale:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await salesService.deleteSale(id)
        setSales(sales.filter(sale => sale.id !== id))
      } catch (error) {
        console.error('Error deleting sale:', error)
      }
    }
  }

  const handleEdit = (sale) => {
    setEditingSale(sale.id)
    setFormData({
      customer: sale.customer,
      product: sale.product,
      amount: sale.amount,
      date: sale.date,
      status: sale.status,
      location: sale.location || ''
    })
  }

  const handleUpdate = async (id) => {
    try {
      await salesService.updateSale(id, formData)
      setSales(sales.map(sale => 
        sale.id === id ? { ...sale, ...formData } : sale
      ))
      setEditingSale(null)
      setFormData({
        customer: '',
        product: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Completed'
      })
    } catch (error) {
      console.error('Error updating sale:', error)
    }
  }

  const cancelEdit = () => {
    setEditingSale(null)
    setFormData({
      customer: '',
      product: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Completed'
    })
  }

  // Sales Analytics Functions
  const calculateSalesAnalytics = () => {
    const completedSales = sales.filter(sale => sale.status === 'Completed')
    const pendingSales = sales.filter(sale => sale.status === 'Pending')
    const cancelledSales = sales.filter(sale => sale.status === 'Cancelled')
    
    // Revenue calculations
    const totalRevenue = completedSales.reduce((sum, sale) => {
      const amount = parseFloat(sale.amount?.replace(/[^0-9.-]/g, '')) || 0
      return sum + amount
    }, 0)
    
    const pendingRevenue = pendingSales.reduce((sum, sale) => {
      const amount = parseFloat(sale.amount?.replace(/[^0-9.-]/g, '')) || 0
      return sum + amount
    }, 0)
    
    // Monthly trends
    const monthlyData = {}
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    sales.forEach(sale => {
      if (sale.status === 'Completed') {
        const saleDate = new Date(sale.date)
        const monthYear = `${saleDate.getFullYear()}-${saleDate.getMonth()}`
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { revenue: 0, count: 0 }
        }
        
        const amount = parseFloat(sale.amount?.replace(/[^0-9.-]/g, '')) || 0
        monthlyData[monthYear].revenue += amount
        monthlyData[monthYear].count += 1
      }
    })
    
    // Last 6 months data
    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthYear = `${date.getFullYear()}-${date.getMonth()}`
      const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      
      last6Months.push({
        month: monthName,
        revenue: monthlyData[monthYear]?.revenue || 0,
        count: monthlyData[monthYear]?.count || 0
      })
    }
    
    // Product performance
    const productStats = {}
    completedSales.forEach(sale => {
      if (!productStats[sale.product]) {
        productStats[sale.product] = { revenue: 0, count: 0 }
      }
      const amount = parseFloat(sale.amount?.replace(/[^0-9.-]/g, '')) || 0
      productStats[sale.product].revenue += amount
      productStats[sale.product].count += 1
    })
    
    const topProducts = Object.entries(productStats)
      .map(([product, stats]) => ({ product, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
    
    // Customer performance
    const customerStats = {}
    completedSales.forEach(sale => {
      if (!customerStats[sale.customer]) {
        customerStats[sale.customer] = { revenue: 0, count: 0 }
      }
      const amount = parseFloat(sale.amount?.replace(/[^0-9.-]/g, '')) || 0
      customerStats[sale.customer].revenue += amount
      customerStats[sale.customer].count += 1
    })
    
    const topCustomers = Object.entries(customerStats)
      .map(([customer, stats]) => ({ customer, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
    
    // Conversion rates
    const totalOrders = sales.length
    const conversionRate = totalOrders > 0 ? (completedSales.length / totalOrders) * 100 : 0
    const cancellationRate = totalOrders > 0 ? (cancelledSales.length / totalOrders) * 100 : 0
    
    // Growth calculations
    const currentMonthRevenue = monthlyData[`${currentYear}-${currentMonth}`]?.revenue || 0
    const lastMonthRevenue = monthlyData[`${currentYear}-${currentMonth - 1}`]?.revenue || 0
    const monthOverMonthGrowth = lastMonthRevenue > 0 ? 
      ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0
    
    // Average order value by month
    const avgOrderValues = last6Months.map(month => ({
      month: month.month,
      avgValue: month.count > 0 ? month.revenue / month.count : 0
    }))
    
    return {
      totalRevenue,
      pendingRevenue,
      totalOrders,
      completedOrders: completedSales.length,
      pendingOrders: pendingSales.length,
      cancelledOrders: cancelledSales.length,
      averageOrderValue: completedSales.length > 0 ? totalRevenue / completedSales.length : 0,
      conversionRate,
      cancellationRate,
      monthOverMonthGrowth,
      monthlyTrends: last6Months,
      topProducts,
      topCustomers,
      avgOrderValues,
      currentMonthRevenue,
      lastMonthRevenue
    }
  }

  // Calculate stats from user data
  const completedSales = sales.filter(sale => sale.status === 'Completed')
  const pendingSales = sales.filter(sale => sale.status === 'Pending')
  
  const totalRevenue = completedSales.reduce((sum, sale) => {
    const amount = parseFloat(sale.amount?.replace(/[^0-9.-]/g, '')) || 0
    return sum + amount
  }, 0)

  const totalOrders = sales.length
  const averageOrderValue = completedSales.length > 0 ? totalRevenue / completedSales.length : 0
  const pendingOrdersCount = pendingSales.length

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      change: totalRevenue > 0 ? `+₹${totalRevenue.toLocaleString('en-IN')}` : '+₹0',
      icon: IndianRupee,
      color: 'bg-green-500'
    },
    {
      title: 'Completed Orders',
      value: completedSales.length.toString(),
      change: completedSales.length > 0 ? `+${completedSales.length}` : '+0',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Average Order Value',
      value: `₹${Math.round(averageOrderValue).toLocaleString('en-IN')}`,
      change: averageOrderValue > 0 ? `+₹${Math.round(averageOrderValue).toLocaleString('en-IN')}` : '+₹0',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Pending Orders',
      value: pendingOrdersCount.toString(),
      change: pendingOrdersCount > 0 ? `+${pendingOrdersCount}` : '+0',
      icon: Users,
      color: 'bg-yellow-500'
    }
  ]

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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Sales Analytics</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Track your sales performance and revenue</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center text-sm sm:text-base ${
              showAnalytics 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 size={18} className="mr-2" />
            <span className="hidden sm:inline">{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span>
            <span className="sm:hidden">{showAnalytics ? 'Hide' : 'Show'}</span>
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center text-sm sm:text-base"
            data-add-sale-btn
          >
            <Plus size={18} className="mr-2" />
            <span className="hidden sm:inline">Add Sale</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Sales Analytics Dashboard */}
      {showAnalytics && (
        <div className="mb-8 space-y-6">
          {(() => {
            const analytics = calculateSalesAnalytics()
            return (
              <>
                {/* Key Performance Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="bg-green-500 p-2 sm:p-3 rounded-lg">
                        <IndianRupee className="text-white" size={18} />
                      </div>
                      <div className="flex items-center text-xs sm:text-sm">
                        {analytics.monthOverMonthGrowth >= 0 ? (
                          <div className="text-green-600 flex items-center">
                            <TrendingUp size={14} className="mr-1" />
                            +{analytics.monthOverMonthGrowth.toFixed(1)}%
                          </div>
                        ) : (
                          <div className="text-red-600 flex items-center">
                            <TrendingDown size={14} className="mr-1" />
                            {analytics.monthOverMonthGrowth.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">₹{analytics.totalRevenue.toLocaleString('en-IN')}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">Total Revenue</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="bg-blue-500 p-2 sm:p-3 rounded-lg">
                        <ShoppingCart className="text-white" size={18} />
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {analytics.conversionRate.toFixed(1)}% conv.
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{analytics.completedOrders}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">Completed Orders</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="bg-purple-500 p-2 sm:p-3 rounded-lg">
                        <Target className="text-white" size={18} />
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {analytics.pendingOrders} pending
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">₹{Math.round(analytics.averageOrderValue).toLocaleString('en-IN')}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">Avg Order Value</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="bg-yellow-500 p-2 sm:p-3 rounded-lg">
                        <Activity className="text-white" size={18} />
                      </div>
                      <div className="text-xs sm:text-sm text-red-600">
                        {analytics.cancellationRate.toFixed(1)}% cancel
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{analytics.totalOrders}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">Total Orders</p>
                  </div>
                </div>

                {/* Sales Trends and Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <TrendingUp size={18} className="mr-2 text-blue-600" />
                      Monthly Revenue Trends
                    </h2>
                    <div className="space-y-2 sm:space-y-3">
                      {analytics.monthlyTrends.map((month, index) => (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{month.month}</div>
                            <div className="text-xs text-gray-500">{month.count} orders</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs sm:text-sm font-semibold text-gray-900">₹{month.revenue.toLocaleString('en-IN')}</div>
                            <div className="text-xs text-gray-500">
                              ₹{month.count > 0 ? Math.round(month.revenue / month.count).toLocaleString('en-IN') : 0} avg
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <PieChart size={18} className="mr-2 text-green-600" />
                      Order Status Distribution
                    </h2>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2 sm:mr-3" />
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">Completed</div>
                            <div className="text-xs text-gray-500">Successfully processed</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900">{analytics.completedOrders}</div>
                          <div className="text-xs text-gray-500">{analytics.conversionRate.toFixed(1)}%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 sm:p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full mr-2 sm:mr-3" />
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">Pending</div>
                            <div className="text-xs text-gray-500">Awaiting processing</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900">{analytics.pendingOrders}</div>
                          <div className="text-xs text-gray-500">₹{analytics.pendingRevenue.toLocaleString('en-IN')}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full mr-2 sm:mr-3" />
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">Cancelled</div>
                            <div className="text-xs text-gray-500">Order cancelled</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900">{analytics.cancelledOrders}</div>
                          <div className="text-xs text-gray-500">{analytics.cancellationRate.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Performers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <Award size={18} className="mr-2 text-purple-600" />
                      Top Products by Revenue
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analytics.topProducts.map((product, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">
                                {product.product}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                {product.count}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                                ₹{product.revenue.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <Star size={18} className="mr-2 text-yellow-600" />
                      Top Customers by Revenue
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analytics.topCustomers.map((customer, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">
                                {customer.customer}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                {customer.count}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                                ₹{customer.revenue.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                    <AlertCircle size={18} className="mr-2 text-blue-600" />
                    Performance Insights
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">Revenue Growth</h3>
                      <div className="text-lg sm:text-2xl font-bold text-blue-600">
                        {analytics.monthOverMonthGrowth >= 0 ? '+' : ''}{analytics.monthOverMonthGrowth.toFixed(1)}%
                      </div>
                      <p className="text-xs text-blue-700 mt-1">Month over Month</p>
                    </div>
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="text-xs sm:text-sm font-medium text-green-900 mb-2">Conversion Rate</h3>
                      <div className="text-lg sm:text-2xl font-bold text-green-600">
                        {analytics.conversionRate.toFixed(1)}%
                      </div>
                      <p className="text-xs text-green-700 mt-1">Order Completion</p>
                    </div>
                    <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="text-xs sm:text-sm font-medium text-purple-900 mb-2">Average Order</h3>
                      <div className="text-lg sm:text-2xl font-bold text-purple-600">
                        ₹{Math.round(analytics.averageOrderValue).toLocaleString('en-IN')}
                      </div>
                      <p className="text-xs text-purple-700 mt-1">Per Order Value</p>
                    </div>
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}

      {showAddForm && (
        <div className="mb-4 sm:mb-6 bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Add New Sale</h3>
          
          {/* Customer Selection Dropdown */}
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="bg-purple-600 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                <UserPlus size={14} className="text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-900">
                  Quick Fill from Existing Customer
                </label>
                <p className="text-xs text-purple-700 mt-1">Select a customer to auto-fill their information</p>
              </div>
            </div>
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    autoFillFromExistingCustomer(e.target.value)
                  }
                }}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm font-medium appearance-none cursor-pointer hover:border-purple-400 transition-colors"
              >
                <option value="">👤 Choose existing customer to auto-fill...</option>
                {getAllCustomersFromStorage().map((customer, index) => (
                  <option key={index} value={customer.email} className="py-2">
                    {customer.name} • {customer.email} • {customer.company || 'No Company'}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-purple-700">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
              <span>Customers are automatically saved when you add them to any form</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <input
                type="text"
                required
                value={formData.customer}
                onChange={(e) => setFormData({...formData, customer: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                placeholder="Customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <select
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-purple-400 transition-colors duration-200 text-sm"
                >
                  <option value="">📍 Select a state...</option>
                  {indianStates.map((state, index) => (
                    <option key={index} value={state} className="text-gray-700">
                      {state}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6m0 0l6-6" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="product-search-container">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.product}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    onFocus={() => {
                      if (formData.product.length > 0) {
                        setShowProductSuggestions(true);
                      }
                    }}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium hover:border-green-400 transition-colors duration-200 text-sm"
                    placeholder="Search or enter product name..."
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ShoppingCart size={14} className="text-gray-400" />
                  </div>
                </div>
                
                {/* Product Suggestions Dropdown */}
                {showProductSuggestions && productSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {productSuggestions.map((product, index) => (
                      <div
                        key={index}
                        onClick={() => selectProduct(product)}
                        className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 flex items-center justify-between text-xs sm:text-sm"
                      >
                        <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-none">{product}</span>
                        <ShoppingCart size={12} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* No Results Message */}
                {showProductSuggestions && productSuggestions.length === 0 && formData.product.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="px-3 sm:px-4 py-2 sm:py-3 text-gray-500 text-center text-xs sm:text-sm">
                      No products found. Type to add new product.
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee size={14} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.amount}
                  onChange={(e) => {
                    const formatted = formatIndianCurrencyInput(e.target.value);
                    setFormData({...formData, amount: formatted});
                  }}
                  onBlur={(e) => {
                    const parsed = parseIndianCurrency(e.target.value);
                    setFormData({...formData, amount: parsed.toString()});
                  }}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="grid grid-cols-4 gap-1 sm:gap-2">
                <div>
                  <select
                    value={new Date(formData.date).getMonth() + 1}
                    onChange={(e) => {
                      const month = e.target.value
                      const day = new Date(formData.date).getDate()
                      const year = new Date(formData.date).getFullYear()
                      const newDate = new Date(year, month - 1, day).toISOString().split('T')[0]
                      setFormData({...formData, date: newDate})
                    }}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-purple-400 transition-colors duration-200 text-xs sm:text-sm"
                  >
                    <option value="">Month</option>
                    {months.map((month, index) => (
                      <option key={index} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={new Date(formData.date).getDate()}
                    onChange={(e) => {
                      const day = e.target.value
                      const month = new Date(formData.date).getMonth() + 1
                      const year = new Date(formData.date).getFullYear()
                      const newDate = new Date(year, month - 1, day).toISOString().split('T')[0]
                      setFormData({...formData, date: newDate})
                    }}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-purple-400 transition-colors duration-200 text-xs sm:text-sm"
                  >
                    <option value="">Day</option>
                    {days.map((day, index) => (
                      <option key={index} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={new Date(formData.date).getFullYear()}
                    onChange={(e) => {
                      const year = e.target.value
                      const month = new Date(formData.date).getMonth() + 1
                      const day = new Date(formData.date).getDate()
                      const newDate = new Date(year, month - 1, day).toISOString().split('T')[0]
                      setFormData({...formData, date: newDate})
                    }}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-purple-400 transition-colors duration-200 text-xs sm:text-sm"
                  >
                    <option value="">Year</option>
                    {years.map((year, index) => (
                      <option key={index} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-green-400 transition-colors duration-200 text-sm"
                >
                  <option value="Completed" className="text-green-700">✅ Completed</option>
                  <option value="Pending" className="text-yellow-700">⏳ Pending</option>
                  <option value="Cancelled" className="text-red-700">❌ Cancelled</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Activity size={14} className="text-gray-400" />
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm sm:text-base"
              >
                Add Sale
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                  <Icon className="text-white" size={18} />
                </div>
                <div className="flex items-center text-xs sm:text-sm text-green-600">
                  <TrendingUp size={14} className="mr-1" />
                  {stat.change}
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">{stat.title}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Revenue Overview</h2>
            <select className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
          <SalesChart />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Top Products</h2>
          <TopProducts />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 sm:px-6 py-8 sm:py-12 text-center">
                    <div className="text-gray-500">
                      <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                      <p className="text-sm sm:text-base">No sales found</p>
                      <p className="text-xs sm:text-sm mt-1">Add your first sale to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {editingSale === sale.id ? (
                        <input
                          type="text"
                          value={formData.customer}
                          onChange={(e) => setFormData({...formData, customer: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm"
                        />
                      ) : (
                        <span className="truncate max-w-[100px] sm:max-w-none">{sale.customer}</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {editingSale === sale.id ? (
                        <input
                          type="text"
                          value={formData.product}
                          onChange={(e) => setFormData({...formData, product: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm"
                        />
                      ) : (
                        <span className="truncate max-w-[100px] sm:max-w-none">{sale.product}</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {editingSale === sale.id ? (
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({...formData, amount: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm"
                        />
                      ) : (
                        formatIndianCurrency(sale.amount)
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {editingSale === sale.id ? (
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm"
                        />
                      ) : (
                        sale.date
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      {editingSale === sale.id ? (
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm"
                        >
                          <option value="Completed">Completed</option>
                          <option value="Pending">Pending</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sale.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : sale.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {sale.status}
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {editingSale === sale.id ? (
                        <div className="flex space-x-1 sm:space-x-2">
                          <button 
                            onClick={() => handleUpdate(sale.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save size={14} />
                          </button>
                          <button 
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-1 sm:space-x-2">
                          <button 
                            onClick={() => handleEdit(sale)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(sale.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Orders Section */}
      {pendingSales.length > 0 && (
        <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Pending Orders</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Orders awaiting completion</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      <span className="truncate max-w-[100px] sm:max-w-none">{sale.customer}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      <span className="truncate max-w-[100px] sm:max-w-none">{sale.product}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {formatIndianCurrency(sale.amount)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {sale.date}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      <div className="flex space-x-1 sm:space-x-2">
                        <button 
                          onClick={() => handleEdit(sale)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(sale.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sales
