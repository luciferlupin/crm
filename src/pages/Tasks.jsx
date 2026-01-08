import React, { useState } from 'react'
import { Plus, Search, Calendar, Clock, User, CheckCircle, Circle, AlertCircle } from 'lucide-react'

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')

  const tasks = [
    {
      id: 1,
      title: 'Follow up with Tech Corp lead',
      description: 'Discuss pricing options and schedule demo',
      priority: 'high',
      status: 'todo',
      dueDate: '2024-01-10',
      assignedTo: 'John Doe',
      category: 'Sales'
    },
    {
      id: 2,
      title: 'Prepare Q1 sales report',
      description: 'Compile sales data and create presentation',
      priority: 'medium',
      status: 'in-progress',
      dueDate: '2024-01-15',
      assignedTo: 'Jane Smith',
      category: 'Reporting'
    },
    {
      id: 3,
      title: 'Call new customers for onboarding',
      description: 'Welcome call and product walkthrough',
      priority: 'high',
      status: 'todo',
      dueDate: '2024-01-09',
      assignedTo: 'Mike Johnson',
      category: 'Customer Success'
    },
    {
      id: 4,
      title: 'Update CRM documentation',
      description: 'Add new features and best practices',
      priority: 'low',
      status: 'completed',
      dueDate: '2024-01-08',
      assignedTo: 'Sarah Wilson',
      category: 'Documentation'
    },
    {
      id: 5,
      title: 'Review lead scoring criteria',
      description: 'Analyze conversion rates and adjust scoring',
      priority: 'medium',
      status: 'todo',
      dueDate: '2024-01-12',
      assignedTo: 'John Doe',
      category: 'Strategy'
    }
  ]

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterPriority === 'all' || task.priority === filterPriority
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo': return <Circle className="text-gray-400" size={20} />
      case 'in-progress': return <AlertCircle className="text-yellow-500" size={20} />
      case 'completed': return <CheckCircle className="text-green-500" size={20} />
      default: return null
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Sales': return 'bg-blue-100 text-blue-800'
      case 'Customer Success': return 'bg-purple-100 text-purple-800'
      case 'Reporting': return 'bg-indigo-100 text-indigo-800'
      case 'Documentation': return 'bg-gray-100 text-gray-800'
      case 'Strategy': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const taskStats = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => 
      t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tasks</h1>
          <p className="text-gray-600 mt-2">Manage your team's tasks and deadlines</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center">
          <Plus size={20} className="mr-2" />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">To Do</p>
              <p className="text-2xl font-bold text-gray-800">{taskStats.todo}</p>
            </div>
            <Circle className="text-gray-400" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-800">{taskStats.inProgress}</p>
            </div>
            <AlertCircle className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-800">{taskStats.completed}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
            </div>
            <Clock className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredTasks.map((task) => (
            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                <button className="mt-1">
                  {getStatusIcon(task.status)}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(task.category)}`}>
                        {task.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      Due: {task.dueDate}
                    </div>
                    <div className="flex items-center">
                      <User size={16} className="mr-1" />
                      {task.assignedTo}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Tasks
