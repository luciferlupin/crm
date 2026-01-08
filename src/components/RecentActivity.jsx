import React from 'react'
import { User, Target, TrendingUp, CheckCircle } from 'lucide-react'

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'customer',
      title: 'New customer added',
      description: 'Sarah Johnson joined',
      time: '2 minutes ago',
      icon: User,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      type: 'lead',
      title: 'Lead converted',
      description: 'Tech Corp deal closed',
      time: '1 hour ago',
      icon: Target,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 3,
      type: 'sale',
      title: 'New sale recorded',
      description: '$5,000 from ABC Inc',
      time: '3 hours ago',
      icon: TrendingUp,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 4,
      type: 'task',
      title: 'Task completed',
      description: 'Follow-up with leads',
      time: '5 hours ago',
      icon: CheckCircle,
      color: 'bg-purple-100 text-purple-600'
    }
  ]

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
