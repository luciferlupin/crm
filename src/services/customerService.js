// User's personal customers data with localStorage persistence
const STORAGE_KEY = 'crm_customers'

const getStoredCustomers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading customers from localStorage:', error)
    return []
  }
}

const saveCustomers = (customers) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
  } catch (error) {
    console.error('Error saving customers to localStorage:', error)
  }
}

export const customerService = {
  // Fetch user's customers from localStorage
  async fetchCustomers() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return getStoredCustomers()
  },

  // Insert new customer and save to localStorage
  async insertCustomer(customerData) {
    const customers = getStoredCustomers()
    const newCustomer = {
      id: Date.now().toString(),
      ...customerData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    customers.unshift(newCustomer)
    saveCustomers(customers)
    return newCustomer
  },

  // Update existing customer and save to localStorage
  async updateCustomer(id, updates) {
    const customers = getStoredCustomers()
    const index = customers.findIndex(customer => customer.id === id)
    if (index !== -1) {
      customers[index] = {
        ...customers[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      saveCustomers(customers)
      return customers[index]
    }
    throw new Error('Customer not found')
  },

  // Delete customer and save to localStorage
  async deleteCustomer(id) {
    const customers = getStoredCustomers()
    const index = customers.findIndex(customer => customer.id === id)
    if (index !== -1) {
      customers.splice(index, 1)
      saveCustomers(customers)
      return true
    }
    throw new Error('Customer not found')
  }
}
