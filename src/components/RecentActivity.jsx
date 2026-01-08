import React, { useState, useEffect } from 'react'
import { User, Target, TrendingUp, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext-multi.jsx'
import { leadService } from '../services/leadService-multi.js'

const RecentActivity = () => {
  const { userSupabase } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [userSupabase])

  const fetchRecentActivity = async () => {
    if (!userSupabase) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const leads = await leadService.getLeads()
      
      // Create activity items from recent leads
      const recentActivities = leads.slice(0, 5).map((lead, index) => {
        const timeAgo = getTimeAgo(lead.created_at)
        let activityType, title, description, icon, color

        switch (lead.status) {
          case 'new':
            activityType = 'lead'
            title = 'New lead added'
            description = `${lead.name} from ${lead.company || 'Unknown Company'}`
            icon = User
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
            activityType = 'task'
            title = 'Lead contacted'
            description = `Reached out to ${lead.name}`
            icon = Target
            color = 'bg-yellow-100 text-yellow-600'
            break
          case 'lost':
            activityType = 'task'
            title = 'Lead lost'
            description = `${lead.name} deal closed`
            icon = TrendingUp
            color = 'bg-red-100 text-red-600'
            break
          default:
            activityType = 'lead'
            title = 'Lead updated'
            description = `${lead.name} status changed`
            icon = User
            color = 'bg-gray-100 text-gray-600'
        }

        return {
          id: lead.id,
          type: activityType,
          title,
          description,
          time: timeAgo,
          icon,
          color
        }
      })

      setActivities(recentActivities)
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
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    } else if (diffInMinutes < 1440) {
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
          <p className="text-xs mt-1">Add leads to see activity here</p>
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
