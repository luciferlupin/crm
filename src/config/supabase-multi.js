import { createClient } from '@supabase/supabase-js'

// Default CRM admin Supabase for managing user projects
const crmSupabaseUrl = 'https://ajpbnddzehydezimpuor.supabase.co'
const crmSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqcGJuZGR6ZWh5ZGV6aW1wdW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzMyMDAsImV4cCI6MjA4MzQwOTIwMH0.GAoMAGEnm1OgrSMuPdjNitj3k0eEOXr9xOQLSdiG6TQ'

export const crmSupabase = createClient(crmSupabaseUrl, crmSupabaseAnonKey)

// Create admin client for CRM management
export const crmSupabaseAdmin = createClient(
  crmSupabaseUrl,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqcGJuZGR6ZWh5ZGV6aW1wdW9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgzMzIwMCwiZXhwIjoyMDgzNDA5MjAwfQ.pKqJv8qHhU6HlN_9Q5l1B1xJ1qJ3K7n8m9X2r4L5sY'
)

// Dynamic client for user's Supabase projects
let userSupabaseClient = null

export const createUserSupabaseClient = (supabaseUrl, supabaseKey) => {
  userSupabaseClient = createClient(supabaseUrl, supabaseKey)
  return userSupabaseClient
}

export const getUserSupabaseClient = () => {
  if (!userSupabaseClient) {
    throw new Error('User Supabase client not initialized. Call createUserSupabaseClient first.')
  }
  return userSupabaseClient
}

// Test connection to CRM Supabase
export const testCrmSupabaseConnection = async () => {
  try {
    const { data, error } = await crmSupabase.auth.getSession()
    console.log('CRM Supabase connection test:', { data, error })
    
    if (error && error.message === 'No session') {
      return { connected: true, error: null }
    }
    
    return { connected: !error, error }
  } catch (err) {
    console.error('CRM Supabase connection error:', err)
    return { connected: false, error: err }
  }
}

// Test connection to user's Supabase
export const testUserSupabaseConnection = async () => {
  try {
    if (!userSupabaseClient) {
      return { connected: false, error: 'User Supabase client not initialized' }
    }
    
    const { data, error } = await userSupabaseClient.auth.getSession()
    console.log('User Supabase connection test:', { data, error })
    
    if (error && error.message === 'No session') {
      return { connected: true, error: null }
    }
    
    return { connected: !error, error }
  } catch (err) {
    console.error('User Supabase connection error:', err)
    return { connected: false, error: err }
  }
}
