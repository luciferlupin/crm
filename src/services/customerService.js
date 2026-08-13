// User's personal customers data with localStorage persistence
const STORAGE_KEY = 'crm_customers'

const getStoredCustomers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    // Initialize with demo data if empty
    const demoCustomers = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@techcorp.com',
        phone: '+91 98765 43210',
        company: 'Tech Corp',
        status: 'active',
        total_purchases: 5,
        total_spent: '250000',
        last_purchase: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@digitalsolutions.com',
        phone: '+91 87654 32109',
        company: 'Digital Solutions',
        status: 'active',
        total_purchases: 3,
        total_spent: '180000',
        last_purchase: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        name: 'Emily Davis',
        email: 'emily@enterprise.co',
        phone: '+91 65432 10987',
        company: 'Enterprise Co',
        status: 'active',
        total_purchases: 8,
        total_spent: '450000',
        last_purchase: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        name: 'Michael Brown',
        email: 'michael@startupinc.com',
        phone: '+91 76543 21098',
        company: 'Startup Inc',
        status: 'inactive',
        total_purchases: 2,
        total_spent: '75000',
        last_purchase: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoCustomers))
    return demoCustomers
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
