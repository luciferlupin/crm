// User's personal leads data with localStorage persistence
const STORAGE_KEY = 'crm_leads'

const getStoredLeads = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading leads from localStorage:', error)
    return []
  }
}

const saveLeads = (leads) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  } catch (error) {
    console.error('Error saving leads to localStorage:', error)
  }
}

export const leadService = {
  // Fetch user's leads from localStorage
  async fetchLeads() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return getStoredLeads()
  },

  // Insert new lead and save to localStorage
  async insertLead(leadData) {
    const leads = getStoredLeads()
    const newLead = {
      id: Date.now().toString(),
      ...leadData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    leads.unshift(newLead)
    saveLeads(leads)
    return newLead
  },

  // Update existing lead and save to localStorage
  async updateLead(id, updates) {
    const leads = getStoredLeads()
    const index = leads.findIndex(lead => lead.id === id)
    if (index !== -1) {
      leads[index] = {
        ...leads[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      saveLeads(leads)
      return leads[index]
    }
    throw new Error('Lead not found')
  },

  // Delete lead and save to localStorage
  async deleteLead(id) {
    const leads = getStoredLeads()
    const index = leads.findIndex(lead => lead.id === id)
    if (index !== -1) {
      leads.splice(index, 1)
      saveLeads(leads)
      return true
    }
    throw new Error('Lead not found')
  }
}
