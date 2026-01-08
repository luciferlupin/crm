import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ajpbnddzehydezimpuor.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqcGJuZGR6ZWh5ZGV6aW1wdW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzMyMDAsImV4cCI6MjA4MzQwOTIwMH0.GAoMAGEnm1OgrSMuPdjNitj3k0eEOXr9xOQLSdiG6TQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
