-- Leads table schema for single-tenant CRM
-- Run this in your Supabase SQL editor

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'lost')),
  source VARCHAR(255) DEFAULT 'Website',
  value DECIMAL(10,2),
  score INTEGER DEFAULT 50,
  assigned_to VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for single-tenant setup)
CREATE POLICY "Allow all operations on leads" ON leads
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO leads (name, email, company, phone, status, source, value, score) VALUES
('John Smith', 'john.smith@example.com', 'Tech Corp', '+1-555-0123', 'new', 'Website', 5000.00, 75),
('Sarah Johnson', 'sarah.j@example.com', 'Marketing Inc', '+1-555-0124', 'contacted', 'Referral', 7500.00, 85),
('Mike Wilson', 'mike.w@example.com', 'StartupXYZ', '+1-555-0125', 'qualified', 'LinkedIn', 10000.00, 90),
('Emily Davis', 'emily.d@example.com', 'Enterprise Co', '+1-555-0126', 'new', 'Cold Email', 3000.00, 60),
('David Brown', 'david.b@example.com', 'Local Business', '+1-555-0127', 'lost', 'Website', 2000.00, 40)
ON CONFLICT DO NOTHING;
