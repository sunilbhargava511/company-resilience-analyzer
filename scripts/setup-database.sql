-- scripts/setup-database.sql
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Create the company_reports table
CREATE TABLE IF NOT EXISTS company_reports (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_name_normalized VARCHAR(255) NOT NULL,
  analysis_data TEXT NOT NULL,
  model_used VARCHAR(100),
  token_limit INTEGER,
  file_context TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  share_id VARCHAR(12) UNIQUE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_normalized ON company_reports(company_name_normalized);
CREATE INDEX IF NOT EXISTS idx_created_at ON company_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_share_id ON company_reports(share_id);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE company_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust these based on your security needs)
-- Policy for SELECT (reading reports) - anyone can read
CREATE POLICY "Allow public read access" ON company_reports
  FOR SELECT USING (true);

-- Policy for INSERT (creating reports) - anyone can insert
CREATE POLICY "Allow public insert access" ON company_reports
  FOR INSERT WITH CHECK (true);

-- Policy for UPDATE (updating reports) - anyone can update
CREATE POLICY "Allow public update access" ON company_reports
  FOR UPDATE USING (true);

-- Note: In production, you might want to restrict these policies
-- For example, you could require authentication or limit by user_id

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_company_reports_updated_at
    BEFORE UPDATE ON company_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a test record (optional)
-- INSERT INTO company_reports (
--   company_name,
--   company_name_normalized, 
--   analysis_data,
--   model_used,
--   token_limit,
--   share_id
-- ) VALUES (
--   'Test Company',
--   'test company',
--   '{"test": "This is a test analysis"}',
--   'claude-3-sonnet',
--   4000,
--   'test12345678'
-- );