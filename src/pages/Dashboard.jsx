import React, { useState, useEffect } from 'react'
import { Users, TrendingUp, Target, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import SalesChart from '../components/SalesChart.jsx'
import RecentActivity from '../components/RecentActivity.jsx'
import { leadService } from '../services/leadService.js'
import { customerService } from '../services/customerService.js'
import { taskService } from '../services/taskService.js'
import { salesService } from '../services/salesService.js'

const Dashboard = () => {
  const [stats, setStats] = useState([
    {
      title: 'Total Customers',
      value: '0',
      change: '+0',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Leads',
      value: '0',
      change: '+0',
      changeType: 'positive',
      icon: Target,
      color: 'bg-green-500'
    },
    {
      title: 'Pipeline Value',
      value: '$0',
      change: '+$0',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      title: 'Tasks',
      value: '0',
      change: '+0',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

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
      
      // Calculate statistics
      const totalCustomers = customers.length
      const totalLeads = leads.length
      const activeLeads = leads.filter(lead => lead.status !== 'lost').length
      const totalTasks = tasks.length
      
      // Calculate pipeline value from leads
      const pipelineValue = leads.reduce((sum, lead) => {
        const value = parseFloat(lead.value) || 0
        return sum + value
      }, 0)
      
      // Calculate total revenue from completed sales only
      const completedSales = sales.filter(sale => sale.status === 'Completed')
      const totalRevenue = completedSales.reduce((sum, sale) => {
        const amount = parseFloat(sale.amount) || 0
        return sum + amount
      }, 0)
      
      // Update stats with real user data
      setStats([
        {
          title: 'Total Customers',
          value: totalCustomers.toString(),
          change: totalCustomers > 0 ? `+${totalCustomers}` : '+0',
          changeType: 'positive',
          icon: Users,
          color: 'bg-blue-500'
        },
        {
          title: 'Active Leads',
          value: activeLeads.toString(),
          change: activeLeads > 0 ? `+${activeLeads}` : '+0',
          changeType: 'positive',
          icon: Target,
          color: 'bg-green-500'
        },
        {
          title: 'Total Revenue',
          value: `$${totalRevenue.toLocaleString()}`,
          change: totalRevenue > 0 ? `+$${totalRevenue.toLocaleString()}` : '+$0',
          changeType: 'positive',
          icon: DollarSign,
          color: 'bg-yellow-500'
        },
        {
          title: 'Tasks',
          value: totalTasks.toString(),
          change: totalTasks > 0 ? `+${totalTasks}` : '+0',
          changeType: 'positive',
          icon: TrendingUp,
          color: 'bg-purple-500'
        }
      ])
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your business overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className={`flex items-center text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight size={16} className="mr-1" />
                  ) : (
                    <ArrowDownRight size={16} className="mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales Overview</h2>
          <SalesChart />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
