// User's personal sales data with localStorage persistence
const STORAGE_KEY = 'crm_sales'

const getStoredSales = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    // Initialize with demo data if empty
    const demoSales = [
      {
        id: '1',
        customer: 'John Smith',
        product: 'Enterprise License',
        amount: '50000',
        status: 'Completed',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        customer: 'Sarah Johnson',
        product: 'Premium Package',
        amount: '75000',
        status: 'Completed',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        customer: 'Emily Davis',
        product: 'Custom Solution',
        amount: '200000',
        status: 'Completed',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        customer: 'Michael Brown',
        product: 'Basic Plan',
        amount: '30000',
        status: 'Pending',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        customer: 'Robert Wilson',
        product: 'Starter Kit',
        amount: '15000',
        status: 'Cancelled',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '6',
        customer: 'John Smith',
        product: 'Support Contract',
        amount: '25000',
        status: 'Pending',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoSales))
    return demoSales
  } catch (error) {
    console.error('Error loading sales from localStorage:', error)
    return []
  }
}

const saveSales = (sales) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sales))
  } catch (error) {
    console.error('Error saving sales to localStorage:', error)
  }
}

export const salesService = {
  // Fetch user's sales from localStorage
  async fetchSales() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return getStoredSales()
  },

  // Insert new sale and save to localStorage
  async insertSale(saleData) {
    const sales = getStoredSales()
    const newSale = {
      id: Date.now().toString(),
      ...saleData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    sales.unshift(newSale)
    saveSales(sales)
    return newSale
  },

  // Update existing sale and save to localStorage
  async updateSale(id, updates) {
    const sales = getStoredSales()
    const index = sales.findIndex(sale => sale.id === id)
    if (index !== -1) {
      sales[index] = {
        ...sales[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      saveSales(sales)
      return sales[index]
    }
    throw new Error('Sale not found')
  },

  // Delete sale and save to localStorage
  async deleteSale(id) {
    const sales = getStoredSales()
    const index = sales.findIndex(sale => sale.id === id)
    if (index !== -1) {
      sales.splice(index, 1)
      saveSales(sales)
      return true
    }
    throw new Error('Sale not found')
  }
}
