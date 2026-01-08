// User's personal leads data (starts empty)
let userLeads = []

export const leadService = {
  // Fetch user's leads (starts empty)
  async fetchLeads() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return userLeads
  },

  // Insert new lead
  async insertLead(leadData) {
    const newLead = {
      id: Date.now().toString(),
      ...leadData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    userLeads.unshift(newLead)
    return newLead
  },

  // Update existing lead
  async updateLead(id, updates) {
    const index = userLeads.findIndex(lead => lead.id === id)
    if (index !== -1) {
      userLeads[index] = {
        ...userLeads[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      return userLeads[index]
    }
    throw new Error('Lead not found')
  },

  // Delete lead
  async deleteLead(id) {
    const index = userLeads.findIndex(lead => lead.id === id)
    if (index !== -1) {
      userLeads.splice(index, 1)
      return true
    }
    throw new Error('Lead not found')
  }
}
