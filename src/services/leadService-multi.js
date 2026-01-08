import { getUserSupabaseClient } from '../config/supabase-multi.js'

// Lead service for user's Supabase project
export const leadService = {
  async getLeads() {
    try {
      const supabase = getUserSupabaseClient()
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching leads:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Leads fetch error:', error)
      throw error
    }
  },

  async createLead(leadData) {
    try {
      const supabase = getUserSupabaseClient()
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select()

      if (error) {
        console.error('Error creating lead:', error)
        throw error
      }

      return data[0]
    } catch (error) {
      console.error('Lead creation error:', error)
      throw error
    }
  },

  async updateLead(id, updates) {
    try {
      const supabase = getUserSupabaseClient()
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error updating lead:', error)
        throw error
      }

      return data[0]
    } catch (error) {
      console.error('Lead update error:', error)
      throw error
    }
  },

  async deleteLead(id) {
    try {
      const supabase = getUserSupabaseClient()
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting lead:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Lead deletion error:', error)
      throw error
    }
  }
}

export default leadService
