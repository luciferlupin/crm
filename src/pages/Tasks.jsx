import React, { useState, useEffect, useRef } from 'react'
import { Plus, Search, Clock, User, CheckCircle, Circle, AlertCircle, Edit2, Trash2, BarChart3, Layout, TrendingUp, Users, Target, Activity, AlertTriangle, Calendar, GripVertical } from 'lucide-react'
import { taskService } from '../services/taskService.js'

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [viewMode, setViewMode] = useState('list') // list, kanban, analytics
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverStatus, setDragOverStatus] = useState(null)
  const dragCounter = useRef(0)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assignedTo: '',
    category: 'General',
    estimatedHours: '',
    actualHours: ''
  })

  // Status options including overdue
  const statusOptions = [
    { value: 'todo', label: '📋 To Do', color: 'text-gray-600' },
    { value: 'in-progress', label: '⚡ In Progress', color: 'text-yellow-600' },
    { value: 'completed', label: '✅ Completed', color: 'text-green-600' },
    { value: 'overdue', label: '⚠️ Overdue', color: 'text-red-600' }
  ]

  // View mode options (removed calendar)
  const viewModes = [
    { value: 'list', label: 'List View', icon: Layout },
    { value: 'kanban', label: 'Kanban Board', icon: BarChart3 },
    { value: 'analytics', label: 'Analytics', icon: TrendingUp }
  ]

  // Months list
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Generate years from current year to 10 years forward
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i)

  // Generate days array (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await taskService.fetchTasks()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const newTask = await taskService.insertTask(formData)
      setTasks([newTask, ...tasks])
      setShowAddForm(false)
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        assignedTo: '',
        category: 'General',
        estimatedHours: '',
        actualHours: ''
      })
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const handleEdit = (task) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
      category: task.category,
      estimatedHours: task.estimatedHours || '',
      actualHours: task.actualHours || ''
    })
    setShowEditForm(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await taskService.updateTask(selectedTask.id, formData)
      setTasks(tasks.map(task => 
        task.id === selectedTask.id ? { ...task, ...formData } : task
      ))
      setShowEditForm(false)
      setSelectedTask(null)
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        assignedTo: '',
        category: 'General',
        estimatedHours: '',
        actualHours: ''
      })
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(id)
        setTasks(tasks.filter(task => task.id !== id))
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
  }

  const handleStatusToggle = async (id, currentStatus) => {
    let newStatus
    if (currentStatus === 'completed') {
      newStatus = 'todo'
    } else if (currentStatus === 'todo') {
      newStatus = 'in-progress'
    } else if (currentStatus === 'in-progress') {
      newStatus = 'completed'
    } else if (currentStatus === 'overdue') {
      newStatus = 'in-progress'
    } else {
      newStatus = 'todo'
    }
    
    try {
      await taskService.updateTask(id, { status: newStatus })
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, status: newStatus } : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  // Drag and Drop Handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.innerHTML)
    
    // Add dragging styles
    e.target.style.opacity = '0.5'
    e.target.style.transform = 'rotate(5deg)'
  }

  const handleDragEnd = (e) => {
    // Reset dragging styles
    e.target.style.opacity = '1'
    e.target.style.transform = 'rotate(0deg)'
    setDraggedTask(null)
    setDragOverStatus(null)
  }

  const handleDragOver = (e, status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (dragOverStatus !== status) {
      setDragOverStatus(status)
    }
  }

  const handleDragEnter = (e, status) => {
    e.preventDefault()
    dragCounter.current++
    setDragOverStatus(status)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    dragCounter.current--
    
    if (dragCounter.current === 0) {
      setDragOverStatus(null)
    }
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    dragCounter.current = 0
    setDragOverStatus(null)
    
    if (!draggedTask || draggedTask.status === newStatus) {
      return
    }

    try {
      // Update task status in database
      await taskService.updateTask(draggedTask.id, { status: newStatus })
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === draggedTask.id ? { ...task, status: newStatus } : task
        )
      )
      
      setDraggedTask(null)
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    return matchesSearch && matchesPriority && matchesStatus
  })

  // Group tasks by status for Kanban view
  const kanbanTasks = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    inProgress: filteredTasks.filter(t => t.status === 'in-progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
    overdue: filteredTasks.filter(t => t.status === 'overdue')
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

  // Analytics calculations
  const taskStats = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    total: tasks.length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
    totalEstimatedHours: tasks.reduce((sum, task) => sum + (parseFloat(task.estimatedHours) || 0), 0),
    totalActualHours: tasks.reduce((sum, task) => sum + (parseFloat(task.actualHours) || 0), 0),
    highPriorityTasks: tasks.filter(t => t.priority === 'high').length
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo': return <Circle className="text-gray-400" size={20} />
      case 'in-progress': return <AlertCircle className="text-yellow-500" size={20} />
      case 'completed': return <CheckCircle className="text-green-500" size={20} />
      case 'overdue': return <AlertTriangle className="text-red-500" size={20} />
      default: return <Circle className="text-gray-400" size={20} />
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Tasks</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your team's tasks and deadlines</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center text-sm sm:text-base"
            data-add-task-btn
          >
            <Plus size={16} className="mr-2" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto">
        {viewModes.map(mode => (
          <button
            key={mode.value}
            onClick={() => setViewMode(mode.value)}
            className={`px-2 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${
              viewMode === mode.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <mode.icon size={14} />
            <span className="hidden sm:inline">{mode.label}</span>
            <span className="sm:hidden">{mode.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Analytics Dashboard */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Tasks</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{taskStats.total}</p>
                </div>
                <Target className="text-blue-500" size={18} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Completion Rate</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{taskStats.completionRate}%</p>
                </div>
                <TrendingUp className="text-green-500" size={18} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Overdue Tasks</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{taskStats.overdue}</p>
                </div>
                <AlertTriangle className="text-red-500" size={18} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">High Priority</p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">{taskStats.highPriorityTasks}</p>
                </div>
                <AlertCircle className="text-orange-500" size={18} />
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Activity size={16} className="text-blue-600" />
                Task Status Distribution
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>To Do</span>
                    <span>{taskStats.todo}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-400 h-2 rounded-full"
                      style={{ width: `${taskStats.total > 0 ? (taskStats.todo / taskStats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>In Progress</span>
                    <span>{taskStats.inProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${taskStats.total > 0 ? (taskStats.inProgress / taskStats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>Overdue</span>
                    <span>{taskStats.overdue}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${taskStats.total > 0 ? (taskStats.overdue / taskStats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>Completed</span>
                    <span>{taskStats.completed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Users size={16} className="text-purple-600" />
                Team Performance
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">High Priority Tasks</span>
                  <span className="text-sm sm:text-base font-semibold">{taskStats.highPriorityTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Total Estimated Hours</span>
                  <span className="text-sm sm:text-base font-semibold">{taskStats.totalEstimatedHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Total Actual Hours</span>
                  <span className="text-sm sm:text-base font-semibold">{taskStats.totalActualHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Efficiency Rate</span>
                  <span className="text-sm sm:text-base font-semibold">
                    {taskStats.totalEstimatedHours > 0 ? 
                      Math.round((taskStats.totalEstimatedHours / taskStats.totalActualHours) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {Object.entries(kanbanTasks).map(([status, statusTasks]) => (
            <div 
              key={status} 
              className={`bg-white rounded-xl shadow-sm transition-all duration-200 ${
                dragOverStatus === status ? 'ring-2 ring-blue-400 ring-opacity-50 scale-[1.02]' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragEnter={(e) => handleDragEnter(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <h3 className="text-sm sm:text-base font-semibold capitalize flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className="truncate">{status.replace('-', ' ')} ({statusTasks.length})</span>
                </h3>
              </div>
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 min-h-[300px] sm:min-h-[400px]">
                {statusTasks.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {getStatusIcon(status)}
                      </div>
                      <p className="text-xs sm:text-sm">No tasks in {status.replace('-', ' ')}</p>
                      <p className="text-xs">Drag tasks here</p>
                    </div>
                  </div>
                ) : (
                  statusTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={`bg-gray-50 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200 cursor-move border-2 border-transparent hover:border-gray-300 ${
                        draggedTask?.id === task.id ? 'opacity-50 rotate-2' : ''
                      }`}
                      onClick={() => handleEdit(task)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <GripVertical size={12} className="text-gray-400" />
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">{task.title}</h4>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(task.id)
                          }}
                          className="text-red-600 hover:text-red-900 opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar size={10} className="mr-1" />
                            <span className="hidden sm:inline">{new Date(task.dueDate).toLocaleDateString()}</span>
                            <span className="sm:hidden">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Add/Edit Form */}
          {(showAddForm || showEditForm) && (
            <div className="mb-6 bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  showEditForm ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {showEditForm ? (
                    <Edit2 className={`w-6 h-6 ${showEditForm ? 'text-blue-600' : 'text-green-600'}`} />
                  ) : (
                    <Plus className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {showEditForm ? 'Edit Task' : 'Add New Task'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {showEditForm ? 'Update task details and information' : 'Create a new task for your team'}
                  </p>
                </div>
              </div>
              
              <form onSubmit={showEditForm ? handleUpdate : handleSubmit} className="space-y-6">
                {/* Basic Information Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-purple-600" />
                    </div>
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        Task Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        placeholder="Enter task title..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Assigned To
                      </label>
                      <input
                        type="text"
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        placeholder="Assign to team member..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                        rows="4"
                        placeholder="Describe the task details..."
                      />
                    </div>
                  </div>
                </div>

                {/* Task Details Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-orange-600" />
                    </div>
                    Task Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 appearance-none cursor-pointer"
                      >
                        <option value="low">🟢 Low Priority</option>
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="high">🔴 High Priority</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 appearance-none cursor-pointer"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 appearance-none cursor-pointer"
                      >
                        <option value="General">📝 General</option>
                        <option value="Sales">💰 Sales</option>
                        <option value="Customer Success">😊 Customer Success</option>
                        <option value="Reporting">📊 Reporting</option>
                        <option value="Documentation">📚 Documentation</option>
                        <option value="Strategy">🎯 Strategy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        Due Date
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <select
                            value={formData.dueDate ? new Date(formData.dueDate).getMonth() + 1 : ''}
                            onChange={(e) => {
                              const month = e.target.value
                              const currentDay = formData.dueDate ? new Date(formData.dueDate).getDate() : 1
                              const currentYear = formData.dueDate ? new Date(formData.dueDate).getFullYear() : new Date().getFullYear()
                              const newDate = new Date(currentYear, month - 1, currentDay).toISOString().split('T')[0]
                              setFormData({...formData, dueDate: newDate})
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-primary-400 transition-colors duration-200"
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
                            value={formData.dueDate ? new Date(formData.dueDate).getDate() : ''}
                            onChange={(e) => {
                              const day = e.target.value
                              const currentMonth = formData.dueDate ? new Date(formData.dueDate).getMonth() + 1 : new Date().getMonth() + 1
                              const currentYear = formData.dueDate ? new Date(formData.dueDate).getFullYear() : new Date().getFullYear()
                              const newDate = new Date(currentYear, currentMonth - 1, day).toISOString().split('T')[0]
                              setFormData({...formData, dueDate: newDate})
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-primary-400 transition-colors duration-200"
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
                            value={formData.dueDate ? new Date(formData.dueDate).getFullYear() : ''}
                            onChange={(e) => {
                              const year = e.target.value
                              const currentMonth = formData.dueDate ? new Date(formData.dueDate).getMonth() + 1 : new Date().getMonth() + 1
                              const currentDay = formData.dueDate ? new Date(formData.dueDate).getDate() : new Date().getDate()
                              const newDate = new Date(year, currentMonth - 1, currentDay).toISOString().split('T')[0]
                              setFormData({...formData, dueDate: newDate})
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-primary-400 transition-colors duration-200"
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
                  </div>
                </div>

                {/* Time Tracking Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    Time Tracking
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Estimated Hours
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="999"
                          step="0.5"
                          value={formData.estimatedHours}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            if (value >= 0 && value <= 999) {
                              setFormData({...formData, estimatedHours: e.target.value})
                            }
                          }}
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                          placeholder="0.0"
                        />
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Actual Hours
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="999"
                          step="0.5"
                          value={formData.actualHours}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            if (value >= 0 && value <= 999) {
                              setFormData({...formData, actualHours: e.target.value})
                            }
                          }}
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                          placeholder="0.0"
                        />
                        <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className={`flex-1 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 ${
                      showEditForm 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg' 
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg'
                    }`}
                  >
                    {showEditForm ? (
                      <span className="flex items-center justify-center gap-2">
                        <Edit2 size={18} />
                        Update Task
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Plus size={18} />
                        Create Task
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setShowEditForm(false)
                      setSelectedTask(null)
                      setFormData({
                        title: '',
                        description: '',
                        priority: 'medium',
                        status: 'todo',
                        dueDate: '',
                        assignedTo: '',
                        category: 'General',
                        estimatedHours: '',
                        actualHours: ''
                      })
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">To Do</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{taskStats.todo}</p>
                </div>
                <Circle className="text-gray-400" size={18} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Completed</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{taskStats.completed}</p>
                </div>
                <CheckCircle className="text-green-500" size={18} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Overdue</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{taskStats.overdue}</p>
                </div>
                <Clock className="text-red-500" size={18} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Status</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Task List */}
            <div className="divide-y divide-gray-200">
              {filteredTasks.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="text-gray-500">
                    <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">No tasks found</p>
                    <p className="text-xs sm:text-sm mt-1">Add your first task to get started</p>
                  </div>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <button 
                        onClick={() => handleStatusToggle(task.id, task.status)}
                        className="mt-1"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate max-w-[200px] sm:max-w-none">{task.title}</h3>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleEdit(task)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(task.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{task.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center space-x-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 gap-2">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            <span className="hidden sm:inline">Due: {task.dueDate || 'No due date'}</span>
                            <span className="sm:hidden">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}</span>
                          </div>
                          <div className="flex items-center">
                            <User size={14} className="mr-1" />
                            <span className="truncate max-w-[100px] sm:max-w-none">{task.assignedTo || 'Unassigned'}</span>
                          </div>
                          {task.estimatedHours && (
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              <span className="hidden sm:inline">Est: {task.estimatedHours}h</span>
                              <span className="sm:hidden">{task.estimatedHours}h</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 mt-2">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${getCategoryColor(task.category)}`}>
                            <span className="hidden sm:inline">{task.category}</span>
                            <span className="sm:hidden truncate max-w-[80px]">{task.category}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Tasks
