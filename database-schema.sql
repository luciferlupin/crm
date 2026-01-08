-- CRM Multi-Tenant Database Schema

-- Table for storing user projects (each user gets their own Supabase project)
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  supabase_url TEXT NOT NULL,
  supabase_anon_key TEXT NOT NULL,
  supabase_service_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active'
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own projects
CREATE POLICY "Users can view own projects" ON user_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON user_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON user_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON user_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_status ON user_projects(status);

-- Sample user project data (for testing)
INSERT INTO user_projects (user_id, project_name, supabase_url, supabase_anon_key, supabase_service_key, status)
VALUES 
  (
    '123e4567-e89b-12d3-a456-426614174000', -- Sample user ID
    'demo-crm',
    'https://demo-crm.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8tY3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzMyMDAsImV4cCI6MjA4MzQwOTIwMH0.sample_anon_key',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8tY3JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgzMzIwMCwiZXhwIjoyMDgzNDA5MjAwfQ.sample_service_key',
    'active'
  )
ON CONFLICT (user_id) DO NOTHING;
