import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  TrendingUp, 
  Target, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  IndianRupee,
  Activity,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  PieChart,
  TrendingDown,
  Star,
  Award,
  Bell,
  Plus,
  Calendar,
  Filter,
  Eye,
  Zap,
  Target as TargetIcon
} from 'lucide-react'
import SalesChart from '../components/SalesChart.jsx'
import RecentActivity from '../components/RecentActivity.jsx'
import { leadService } from '../services/leadService.js'
import { customerService } from '../services/customerService.js'
import { taskService } from '../services/taskService.js'
import { salesService } from '../services/salesService.js'

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [alerts, setAlerts] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month') // week, month, quarter, year
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all user data
      const [leads, customers, tasks, sales] = await Promise.all([
        leadService.fetchLeads(),
        customerService.fetchCustomers(),
        taskService.fetchTasks(),
        salesService.fetchSales()
      ])
      
      // Calculate comprehensive analytics
      const analyticsData = calculateComprehensiveAnalytics(leads, customers, tasks, sales)
      setAnalytics(analyticsData)
      
      // Generate alerts
      const alertsData = generateAlerts(leads, customers, tasks, sales)
      setAlerts(alertsData)
      
      // Generate recent activities
      const activitiesData = generateRecentActivities(leads, customers, tasks, sales)
      setRecentActivities(activitiesData)
      
      // Update KPI stats
      const kpiStats = generateKPIStats(analyticsData)
      setStats(kpiStats)
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateComprehensiveAnalytics = (leads, customers, tasks, sales) => {
    // Sales Analytics
    const completedSales = sales.filter(sale => sale.status === 'Completed')
    const pendingSales = sales.filter(sale => sale.status === 'Pending')
    const cancelledSales = sales.filter(sale => sale.status === 'Cancelled')
    
    const totalRevenue = completedSales.reduce((sum, sale) => {
      const amount = parseFloat(sale.amount?.replace(/[^0-9.-]/g, '')) || 0
      return sum + amount
    }, 0)
    
    const averageOrderValue = completedSales.length > 0 ? totalRevenue / completedSales.length : 0
    const conversionRate = sales.length > 0 ? (completedSales.length / sales.length) * 100 : 0
    const cancellationRate = sales.length > 0 ? (cancelledSales.length / sales.length) * 100 : 0
    
    // Lead Analytics
    const totalLeads = leads.length
    const activeLeads = leads.filter(lead => lead.status !== 'lost').length
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length
    const leadConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
    
    const pipelineValue = leads.reduce((sum, lead) => {
      const value = parseFloat(lead.value?.replace(/[^0-9.-]/g, '')) || 0
      return sum + value
    }, 0)
    
    // Task Analytics
    const completedTasks = tasks.filter(task => task.status === 'completed').length
    const pendingTasks = tasks.filter(task => task.status === 'todo' || task.status === 'in-progress').length
    const overdueTasks = tasks.filter(task => task.status === 'overdue').length
    const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0
    
    // Customer Analytics
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(customer => customer.status === 'active').length
    
    // Monthly Trends
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const thisMonthSales = completedSales.filter(sale => {
      const saleDate = new Date(sale.date)
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
    })
    
    const lastMonthSales = completedSales.filter(sale => {
      const saleDate = new Date(sale.date)
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
      return saleDate.getMonth() === lastMonth && saleDate.getFullYear() === lastMonthYear
    })
    
    const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => {
      const amount = parseFloat(sale.amount?.replace(/[^0-9.-]/g, '')) || 0
      return sum + amount
    }, 0)
    
    const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => {
      const amount = parseFloat(sale.amount?.replace(/[^0-9.-]/g, '')) || 0
      return sum + amount
    }, 0)
    
    const monthOverMonthGrowth = lastMonthRevenue > 0 ? 
      ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0
    
    // Top Products
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
    
    return {
      totalRevenue,
      averageOrderValue,
      conversionRate,
      cancellationRate,
      totalLeads,
      activeLeads,
      leadConversionRate,
      pipelineValue,
      totalCustomers,
      completedTasks,
      pendingTasks,
      overdueTasks,
      taskCompletionRate,
      thisMonthRevenue,
      lastMonthRevenue,
      monthOverMonthGrowth,
      topProducts,
      completedOrders: completedSales.length,
      pendingOrders: pendingSales.length,
      cancelledOrders: cancelledSales.length
    }
  }

  const generateAlerts = (leads, customers, tasks, sales) => {
    const alerts = []
    
    // Overdue tasks alert
    const overdueTasks = tasks.filter(task => task.status === 'overdue')
    if (overdueTasks.length > 0) {
      alerts.push({
        id: 'overdue-tasks',
        type: 'warning',
        title: 'Overdue Tasks',
        message: `${overdueTasks.length} tasks are overdue`,
        count: overdueTasks.length,
        icon: Clock,
        color: 'text-red-600'
      })
    }
    
    // High value leads alert
    const highValueLeads = leads.filter(lead => {
      const value = parseFloat(lead.value?.replace(/[^0-9.-]/g, '')) || 0
      return value > 50000 && lead.status !== 'converted'
    })
    if (highValueLeads.length > 0) {
      alerts.push({
        id: 'high-value-leads',
        type: 'success',
        title: 'High Value Leads',
        message: `${highValueLeads.length} leads worth > ₹50,000`,
        count: highValueLeads.length,
        icon: TargetIcon,
        color: 'text-green-600'
      })
    }
    
    // Pending sales alert
    const pendingSales = sales.filter(sale => sale.status === 'Pending')
    if (pendingSales.length > 0) {
      alerts.push({
        id: 'pending-sales',
        type: 'info',
        title: 'Pending Sales',
        message: `${pendingSales.length} sales awaiting completion`,
        count: pendingSales.length,
        icon: ShoppingCart,
        color: 'text-blue-600'
      })
    }
    
    return alerts
  }

  const generateRecentActivities = (leads, customers, tasks, sales) => {
    const activities = []
    
    // Add recent sales
    sales.slice(-5).reverse().forEach(sale => {
      activities.push({
        id: `sale-${sale.id}`,
        type: 'sale',
        title: `New Sale: ${sale.product}`,
        description: `Sold to ${sale.customer} for ₹${sale.amount}`,
        time: sale.date,
        icon: ShoppingCart,
        color: 'text-green-600'
      })
    })
    
    // Add recent leads
    leads.slice(-5).reverse().forEach(lead => {
      activities.push({
        id: `lead-${lead.id}`,
        type: 'lead',
        title: `New Lead: ${lead.name}`,
        description: `From ${lead.source} - ${lead.company || 'No company'}`,
        time: lead.created_date,
        icon: TargetIcon,
        color: 'text-blue-600'
      })
    })
    
    // Add recent tasks
    tasks.slice(-5).reverse().forEach(task => {
      activities.push({
        id: `task-${task.id}`,
        type: 'task',
        title: `Task: ${task.title}`,
        description: `Status: ${task.status} - Priority: ${task.priority}`,
        time: task.dueDate,
        icon: CheckCircle,
        color: task.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
      })
    })
    
    // Sort by time and return latest 10
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10)
  }

  const generateKPIStats = (analyticsData) => {
    return [
      {
        title: 'Total Revenue',
        value: `₹${analyticsData.totalRevenue.toLocaleString('en-IN')}`,
        change: analyticsData.monthOverMonthGrowth >= 0 ? 
          `+${analyticsData.monthOverMonthGrowth.toFixed(1)}%` : 
          `${analyticsData.monthOverMonthGrowth.toFixed(1)}%`,
        changeType: analyticsData.monthOverMonthGrowth >= 0 ? 'positive' : 'negative',
        icon: IndianRupee,
        color: 'bg-green-500'
      },
      {
        title: 'Active Leads',
        value: analyticsData.activeLeads.toString(),
        change: `+${analyticsData.leadConversionRate.toFixed(1)}% conv.`,
        changeType: 'positive',
        icon: Target,
        color: 'bg-blue-500'
      },
      {
        title: 'Task Completion',
        value: `${analyticsData.taskCompletionRate.toFixed(1)}%`,
        change: analyticsData.overdueTasks > 0 ? 
          `${analyticsData.overdueTasks} overdue` : 'On track',
        changeType: analyticsData.overdueTasks > 0 ? 'negative' : 'positive',
        icon: CheckCircle,
        color: 'bg-yellow-500'
      },
      {
        title: 'Total Customers',
        value: analyticsData.totalCustomers.toString(),
        change: analyticsData.totalCustomers > 0 ? `+${analyticsData.totalCustomers}` : '+0',
        changeType: 'positive',
        icon: Users,
        color: 'bg-purple-500'
      }
    ]
  }

  // Navigation functions for quick actions
  const handleAddLead = () => {
    // Navigate to leads page
    navigate('/leads')
    // Trigger add form after navigation
    setTimeout(() => {
      const addLeadBtn = document.querySelector('[data-add-lead-btn]')
      if (addLeadBtn) {
        addLeadBtn.click()
      }
    }, 100)
  }

  const handleCreateSale = () => {
    // Navigate to sales page
    navigate('/sales')
    // Trigger add form after navigation
    setTimeout(() => {
      const addSaleBtn = document.querySelector('[data-add-sale-btn]')
      if (addSaleBtn) {
        addSaleBtn.click()
      }
    }, 100)
  }

  const handleAddTask = () => {
    // Navigate to tasks page
    navigate('/tasks')
    // Trigger add form after navigation
    setTimeout(() => {
      const addTaskBtn = document.querySelector('[data-add-task-btn]')
      if (addTaskBtn) {
        addTaskBtn.click()
      }
    }, 100)
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
    <div className="p-6 bg-gray-50 min-h-screen animate-fadeIn">
      {/* Header Section */}
      <div className="mb-8 animate-slideDown">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 animate-slideInLeft">Business Dashboard</h1>
            <p className="text-gray-600 mt-2 animate-slideInLeft animation-delay-200">Real-time insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-4 animate-slideInRight">
            {/* Time Range Selector */}
            <div className="flex bg-white rounded-lg shadow-sm p-1 hover:shadow-lg transition-all duration-300">
              {['week', 'month', 'quarter', 'year'].map((range, index) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    timeRange === range 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-110 animate-pulse-slow"
              >
                <Bell size={20} className="text-gray-600" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    {alerts.length}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-slideDown">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">Alerts & Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {alerts.length > 0 ? (
                      alerts.map((alert, index) => (
                        <div key={alert.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors animate-slideInLeft" style={{ animationDelay: `${index * 50}ms` }}>
                          <div className="flex items-start">
                            <alert.icon size={18} className={alert.color + ' mt-1 mr-3 animate-pulse-slow'} />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{alert.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slideUp">
          {alerts.map((alert, index) => (
            <div key={alert.id} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideInUp" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center">
                <alert.icon size={20} className={alert.color + ' mr-3 animate-pulse-slow'} />
                <div>
                  <h4 className="font-semibold text-gray-800">{alert.title}</h4>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 animate-slideInUp" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg transform transition-all duration-300 hover:scale-110 hover:rotate-12`}>
                  <Icon className="text-white animate-pulse-slow" size={24} />
                </div>
                <div className={`flex items-center text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight size={16} className="mr-1 animate-bounce" />
                  ) : stat.changeType === 'negative' ? (
                    <ArrowDownRight size={16} className="mr-1 animate-bounce" />
                  ) : null}
                  <span className="font-semibold animate-fadeIn">{stat.change}</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-1 animate-numberGrow">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 animate-slideInLeft">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Revenue Overview</h2>
              <div className="flex items-center text-sm">
                {analytics.monthOverMonthGrowth >= 0 ? (
                  <div className="text-green-600 flex items-center animate-pulse">
                    <TrendingUp size={16} className="mr-1" />
                    <span className="font-semibold animate-numberGrow">+{analytics.monthOverMonthGrowth.toFixed(1)}%</span>
                  </div>
                ) : (
                  <div className="text-red-600 flex items-center animate-pulse">
                    <TrendingDown size={16} className="mr-1" />
                    <span className="font-semibold animate-numberGrow">{analytics.monthOverMonthGrowth.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
            <div className="animate-fadeIn animation-delay-300">
              <SalesChart />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 animate-slideInRight">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Conversion Funnel */}
              <div className="animate-slideInLeft animation-delay-200">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Conversion Funnel</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-300 transform hover:scale-105">
                    <span className="text-sm font-medium text-blue-900">Total Leads</span>
                    <span className="text-lg font-bold text-blue-600 animate-numberGrow">{analytics.totalLeads}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-300 transform hover:scale-105">
                    <span className="text-sm font-medium text-green-900">Active Leads</span>
                    <span className="text-lg font-bold text-green-600 animate-numberGrow">{analytics.activeLeads}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-300 transform hover:scale-105">
                    <span className="text-sm font-medium text-purple-900">Converted</span>
                    <span className="text-lg font-bold text-purple-600 animate-numberGrow">{Math.round(analytics.totalLeads * analytics.leadConversionRate / 100)}</span>
                  </div>
                </div>
              </div>

              {/* Task Performance */}
              <div className="animate-slideInRight animation-delay-400">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Task Performance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-300 transform hover:scale-105">
                    <span className="text-sm font-medium text-green-900">Completed</span>
                    <span className="text-lg font-bold text-green-600 animate-numberGrow">{analytics.completedTasks}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors duration-300 transform hover:scale-105">
                    <span className="text-sm font-medium text-yellow-900">Pending</span>
                    <span className="text-lg font-bold text-yellow-600 animate-numberGrow">{analytics.pendingTasks}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-300 transform hover:scale-105">
                    <span className="text-sm font-medium text-red-900">Overdue</span>
                    <span className="text-lg font-bold text-red-600 animate-numberGrow">{analytics.overdueTasks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          {analytics.topProducts && analytics.topProducts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 animate-slideInUp animation-delay-500">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Top Products</h2>
              <div className="space-y-3">
                {analytics.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:translate-x-2 animate-slideInLeft" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transform transition-all duration-300 hover:scale-120 hover:rotate-12 ${
                        index === 0 ? 'bg-yellow-500 animate-pulse-slow' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                      }`}>
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.product}</div>
                        <div className="text-xs text-gray-500">{product.count} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 animate-numberGrow">₹{product.revenue.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 animate-slideInRight animation-delay-600">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={handleAddLead}
                className="w-full flex items-center justify-center p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-pulse-slow"
              >
                <Plus size={18} className="mr-2" />
                Add New Lead
              </button>
              <button 
                onClick={handleCreateSale}
                className="w-full flex items-center justify-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-pulse-slow" 
                style={{ animationDelay: '200ms' }}
              >
                <ShoppingCart size={18} className="mr-2" />
                Create Sale
              </button>
              <button 
                onClick={handleAddTask}
                className="w-full flex items-center justify-center p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-pulse-slow" 
                style={{ animationDelay: '400ms' }}
              >
                <CheckCircle size={18} className="mr-2" />
                Add Task
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 animate-slideInRight animation-delay-800">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-all duration-300 transform hover:scale-105 hover:translate-x-1 animate-slideInLeft" style={{ animationDelay: `${index * 100}ms` }}>
                    <activity.icon size={16} className={activity.color + ' mt-1 mr-3 animate-pulse-slow'} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm">{activity.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(activity.time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8 animate-fadeIn">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { 
            opacity: 0; 
            transform: translateX(-30px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes slideInRight {
          from { 
            opacity: 0; 
            transform: translateX(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes slideInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes numberGrow {
          0% { 
            transform: scale(0.8); 
            opacity: 0; 
          }
          50% { 
            transform: scale(1.1); 
          }
          100% { 
            transform: scale(1); 
            opacity: 1; 
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { 
            transform: translateY(0); 
          }
          40% { 
            transform: translateY(-5px); 
          }
          60% { 
            transform: translateY(-3px); 
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.05); 
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        
        .animate-numberGrow {
          animation: numberGrow 0.8s ease-out;
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        
        .animation-delay-800 {
          animation-delay: 800ms;
        }
      `}</style>
    </div>
  )
}

export default Dashboard
