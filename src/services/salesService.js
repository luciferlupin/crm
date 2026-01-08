// User's personal sales data with localStorage persistence
const STORAGE_KEY = 'crm_sales'

const getStoredSales = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
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
