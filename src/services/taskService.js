// User's personal tasks data (starts empty)
let userTasks = []

export const taskService = {
  // Fetch user's tasks (starts empty)
  async fetchTasks() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return userTasks
  },

  // Insert new task
  async insertTask(taskData) {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    userTasks.unshift(newTask)
    return newTask
  },

  // Update existing task
  async updateTask(id, updates) {
    const index = userTasks.findIndex(task => task.id === id)
    if (index !== -1) {
      userTasks[index] = {
        ...userTasks[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      return userTasks[index]
    }
    throw new Error('Task not found')
  },

  // Delete task
  async deleteTask(id) {
    const index = userTasks.findIndex(task => task.id === id)
    if (index !== -1) {
      userTasks.splice(index, 1)
      return true
    }
    throw new Error('Task not found')
  }
}
