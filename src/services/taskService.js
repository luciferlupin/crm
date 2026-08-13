// User's personal tasks data with localStorage persistence
const STORAGE_KEY = 'crm_tasks'

const getStoredTasks = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    // Initialize with demo data if empty
    const demoTasks = [
      {
        id: '1',
        title: 'Follow up with John Smith',
        description: 'Discuss the proposal for Tech Corp',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        title: 'Prepare sales presentation',
        description: 'Create presentation for Digital Solutions meeting',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: 'Send contract to Emily Davis',
        description: 'Finalize and send contract for Enterprise Co',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        title: 'Review product roadmap',
        description: 'Quarterly product planning review',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        title: 'Update customer database',
        description: 'Clean up and update customer records',
        status: 'overdue',
        priority: 'low',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoTasks))
    return demoTasks
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error)
    return []
  }
}

const saveTasks = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error('Error saving tasks to localStorage:', error)
  }
}

export const taskService = {
  // Fetch user's tasks from localStorage
  async fetchTasks() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return getStoredTasks()
  },

  // Insert new task and save to localStorage
  async insertTask(taskData) {
    const tasks = getStoredTasks()
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    tasks.unshift(newTask)
    saveTasks(tasks)
    return newTask
  },

  // Update existing task and save to localStorage
  async updateTask(id, updates) {
    const tasks = getStoredTasks()
    const index = tasks.findIndex(task => task.id === id)
    if (index !== -1) {
      tasks[index] = {
        ...tasks[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      saveTasks(tasks)
      return tasks[index]
    }
    throw new Error('Task not found')
  },

  // Delete task and save to localStorage
  async deleteTask(id) {
    const tasks = getStoredTasks()
    const index = tasks.findIndex(task => task.id === id)
    if (index !== -1) {
      tasks.splice(index, 1)
      saveTasks(tasks)
      return true
    }
    throw new Error('Task not found')
  }
}
