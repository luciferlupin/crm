import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ajpbnddzehydezimpuor.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqcGJuZGR6ZWh5ZGV6aW1wdW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzMyMDAsImV4cCI6MjA4MzQwOTIwMH0.GAoMAGEnm1OgrSMuPdjNitj3k0eEOXr9xOQLSdiG6TQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create admin client for bypassing email verification
export const supabaseAdmin = createClient(
  supabaseUrl,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqcGJuZGR6ZWh5ZGV6aW1wdW9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgzMzIwMCwiZXhwIjoyMDgzNDA5MjAwfQ.pKqJv8qHhU6HlN_9Q5l1B1xJ1qJ3K7n8m9X2r4L5sY'
)

// Test connection using auth method
export const testSupabaseConnection = async () => {
  try {
    // Test by trying to get the current session (this tests the connection)
    const { data, error } = await supabase.auth.getSession()
    console.log('Supabase connection test:', { data, error })
    
    // If error is just "No session", that's actually a successful connection
    if (error && error.message === 'No session') {
      return { connected: true, error: null }
    }
    
    return { connected: !error, error }
  } catch (err) {
    console.error('Supabase connection error:', err)
    return { connected: false, error: err }
  }
}
