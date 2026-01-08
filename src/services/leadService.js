import { supabase } from '../config/supabase'

export const leadService = {
  // Fetch all leads for the current user
  async fetchLeads() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching leads:', error)
      throw error
    }
  },

  // Insert a new lead
  async insertLead(leadData) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          ...leadData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error inserting lead:', error)
      throw error
    }
  },

  // Update an existing lead
  async updateLead(id, updates) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating lead:', error)
      throw error
    }
  },

  // Delete a lead
  async deleteLead(id) {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting lead:', error)
      throw error
    }
  }
}
