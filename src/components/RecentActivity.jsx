import React, { useState, useEffect } from 'react'
import { User, Target, TrendingUp, CheckCircle, ShoppingCart, Calendar } from 'lucide-react'
import { leadService } from '../services/leadService.js'
import { customerService } from '../services/customerService.js'
import { taskService } from '../services/taskService.js'
import { salesService } from '../services/salesService.js'

const RecentActivity = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      setLoading(true)
      
      // Fetch all user data
      const [leads, customers, tasks, sales] = await Promise.all([
        leadService.fetchLeads(),
        customerService.fetchCustomers(),
        taskService.fetchTasks(),
        salesService.fetchSales()
      ])
      
      // Create activity items from all data
      const allActivities = []
      
      // Add lead activities
      leads.slice(0, 10).forEach(lead => {
        const timeAgo = getTimeAgo(lead.created_at)
        let activityType, title, description, icon, color

        switch (lead.status) {
          case 'new':
            activityType = 'lead'
            title = 'New lead added'
            description = `${lead.name} from ${lead.company || 'Unknown Company'}`
            icon = Target
            color = 'bg-blue-100 text-blue-600'
            break
          case 'qualified':
            activityType = 'lead'
            title = 'Lead qualified'
            description = `${lead.name} is ready to close`
            icon = CheckCircle
            color = 'bg-green-100 text-green-600'
            break
          case 'contacted':
            activityType = 'lead'
            title = 'Lead contacted'
            description = `Reached out to ${lead.name}`
            icon = User
            color = 'bg-yellow-100 text-yellow-600'
            break
          case 'lost':
            activityType = 'lead'
            title = 'Lead lost'
            description = `${lead.name} deal closed`
            icon = TrendingUp
            color = 'bg-red-100 text-red-600'
            break
          default:
            activityType = 'lead'
            title = 'Lead updated'
            description = `${lead.name} status changed`
            icon = Target
            color = 'bg-gray-100 text-gray-600'
        }

        allActivities.push({
          id: `lead-${lead.id}`,
          type: activityType,
          title,
          description,
          time: timeAgo,
          icon,
          color,
          timestamp: new Date(lead.created_at).getTime()
        })
      })
      
      // Add customer activities
      customers.slice(0, 5).forEach(customer => {
        const timeAgo = getTimeAgo(customer.created_at)
        allActivities.push({
          id: `customer-${customer.id}`,
          type: 'customer',
          title: 'New customer added',
          description: `${customer.name} from ${customer.company || 'Unknown Company'}`,
          time: timeAgo,
          icon: User,
          color: 'bg-blue-100 text-blue-600',
          timestamp: new Date(customer.created_at).getTime()
        })
      })
      
      // Add task activities
      tasks.slice(0, 5).forEach(task => {
        const timeAgo = getTimeAgo(task.created_at)
        let icon, color
        
        if (task.status === 'completed') {
          icon = CheckCircle
          color = 'bg-green-100 text-green-600'
        } else {
          icon = Calendar
          color = 'bg-purple-100 text-purple-600'
        }
        
        allActivities.push({
          id: `task-${task.id}`,
          type: 'task',
          title: task.status === 'completed' ? 'Task completed' : 'Task created',
          description: task.title,
          time: timeAgo,
          icon,
          color,
          timestamp: new Date(task.created_at).getTime()
        })
      })
      
      // Add sales activities
      sales.slice(0, 5).forEach(sale => {
        const timeAgo = getTimeAgo(sale.created_at)
        allActivities.push({
          id: `sale-${sale.id}`,
          type: 'sale',
          title: 'New sale recorded',
          description: `$${parseFloat(sale.amount).toLocaleString()} from ${sale.customer}`,
          time: timeAgo,
          icon: ShoppingCart,
          color: 'bg-green-100 text-green-600',
          timestamp: new Date(sale.created_at).getTime()
        })
      })
      
      // Sort by timestamp (most recent first) and take top 10
      const sortedActivities = allActivities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
      
      setActivities(sortedActivities)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (createdAt) => {
    if (!createdAt) return 'Unknown time'
    
    const now = new Date()
    const created = new Date(createdAt)
    const diffInMinutes = Math.floor((now - created) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days !== 1 ? 's' : ''} ago`
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start space-x-3">
            <div className="animate-pulse bg-gray-200 rounded-lg h-8 w-8"></div>
            <div className="flex-1">
              <div className="animate-pulse bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-3 w-1/2 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No recent activity</p>
          <p className="text-xs mt-1">Add leads, customers, tasks, or sales to see activity here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activity.icon
        return (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${activity.color}`}>
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.title}
              </p>
              <p className="text-sm text-gray-500">
                {activity.description}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RecentActivity
