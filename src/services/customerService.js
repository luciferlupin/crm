// User's personal customers data (starts empty)
let userCustomers = []

export const customerService = {
  // Fetch user's customers (starts empty)
  async fetchCustomers() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return userCustomers
  },

  // Insert new customer
  async insertCustomer(customerData) {
    const newCustomer = {
      id: Date.now().toString(),
      ...customerData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    userCustomers.unshift(newCustomer)
    return newCustomer
  },

  // Update existing customer
  async updateCustomer(id, updates) {
    const index = userCustomers.findIndex(customer => customer.id === id)
    if (index !== -1) {
      userCustomers[index] = {
        ...userCustomers[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      return userCustomers[index]
    }
    throw new Error('Customer not found')
  },

  // Delete customer
  async deleteCustomer(id) {
    const index = userCustomers.findIndex(customer => customer.id === id)
    if (index !== -1) {
      userCustomers.splice(index, 1)
      return true
    }
    throw new Error('Customer not found')
  }
}
