// User's personal leads data with localStorage persistence
const STORAGE_KEY = 'crm_leads'

const getStoredLeads = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    // Initialize with demo data if empty
    const demoLeads = [
      {
        id: '1',
        name: 'John Smith',
        company: 'Tech Corp',
        email: 'john@techcorp.com',
        phone: '+91 98765 43210',
        status: 'new',
        value: '50000',
        source: 'Website',
        created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        company: 'Digital Solutions',
        email: 'sarah@digitalsolutions.com',
        phone: '+91 87654 32109',
        status: 'contacted',
        value: '75000',
        source: 'LinkedIn',
        created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        name: 'Michael Brown',
        company: 'Startup Inc',
        email: 'michael@startupinc.com',
        phone: '+91 76543 21098',
        status: 'qualified',
        value: '120000',
        source: 'Referral',
        created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        name: 'Emily Davis',
        company: 'Enterprise Co',
        email: 'emily@enterprise.co',
        phone: '+91 65432 10987',
        status: 'converted',
        value: '200000',
        source: 'Cold Call',
        created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        name: 'Robert Wilson',
        company: 'Global Tech',
        email: 'robert@globaltech.com',
        phone: '+91 54321 09876',
        status: 'lost',
        value: '30000',
        source: 'Trade Show',
        created_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoLeads))
    return demoLeads
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
