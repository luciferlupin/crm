// User's personal tasks data with localStorage persistence
const STORAGE_KEY = 'crm_tasks'

const getStoredTasks = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
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
