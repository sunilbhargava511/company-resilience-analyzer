# Database Setup Instructions

This application now includes comprehensive report storage, caching, and sharing functionality powered by Supabase PostgreSQL.

## Quick Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be provisioned (2-3 minutes)

### 2. Get Your Database Credentials

From your Supabase project dashboard:

1. Go to **Settings** > **API**
2. Copy your:
   - Project URL (looks like: `https://your-project.supabase.co`)
   - Anon public key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Update Environment Variables

Update your `.env.local` file with your Supabase credentials:

```env
# Anthropic API Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Default Model (optional)
DEFAULT_MODEL=claude-sonnet-4-20250514

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Create Database Tables

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `scripts/setup-database.sql`
4. Click **Run** to execute the SQL

Alternatively, you can copy this SQL directly:

```sql
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

-- Enable Row Level Security (RLS)
ALTER TABLE company_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access" ON company_reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON company_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON company_reports FOR UPDATE USING (true);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_company_reports_updated_at
    BEFORE UPDATE ON company_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5. Test the Connection

1. Start your Next.js application: `npm run dev`
2. Try analyzing a company
3. Check your Supabase dashboard **Table Editor** to see if reports are being saved

## Features Enabled

✅ **Intelligent Caching**: Reports are cached for 3 months to reduce AI API costs  
✅ **Permanent Sharing**: Every report gets a unique shareable URL  
✅ **Force Refresh**: Toggle to bypass cache and generate fresh analysis  
✅ **Report History**: Track analysis evolution over time  
✅ **Metadata Display**: See generation date, model used, cache status  

## How It Works

### Caching Logic
1. When you analyze a company, the system first checks for existing reports < 3 months old
2. If found, returns cached report instantly (saves API costs)
3. If not found or "Force New" is enabled, generates fresh analysis
4. New reports are automatically saved to the database

### Sharing System
- Each report gets a unique 12-character share ID (e.g., `a1b2c3d4e5f6`)
- Share URLs look like: `https://yoursite.com/shared/a1b2c3d4e5f6`
- Shared reports are read-only but include "Analyze This Company" button
- Links always point to the latest report for each company

### URL Structure
- Main app: `https://yoursite.com/`
- Shared reports: `https://yoursite.com/shared/[shareId]`
- Pre-fill company: `https://yoursite.com/?company=Tesla`

## Database Schema

```
company_reports
├── id (SERIAL PRIMARY KEY)
├── company_name (VARCHAR 255) - Original company name
├── company_name_normalized (VARCHAR 255) - Lowercase for matching  
├── analysis_data (TEXT) - Full analysis content
├── model_used (VARCHAR 100) - AI model used
├── token_limit (INTEGER) - Token limit used
├── file_context (TEXT) - Uploaded file data (optional)
├── created_at (TIMESTAMP) - When report was created
├── updated_at (TIMESTAMP) - Last modification time
├── version (INTEGER) - Report version number
└── share_id (VARCHAR 12) - Unique sharing identifier
```

## Troubleshooting

### "Connection Failed" Error
- Check your Supabase project URL and API key
- Ensure your project is not paused (free tier projects pause after 1 week of inactivity)
- Verify environment variables are set correctly

### "Table doesn't exist" Error  
- Run the SQL setup script in your Supabase SQL Editor
- Check that the table was created in the **Table Editor**

### Reports Not Saving
- Check browser console for errors
- Verify Row Level Security policies are set correctly
- Ensure your Supabase project has available database storage

### Sharing Links Don't Work
- Verify the share_id is 12 characters long
- Check that the report exists in your database
- Ensure the shared page route is created correctly

## Production Considerations

- **Security**: The current setup allows public read/write access. For production, consider implementing user authentication and proper RLS policies.
- **Storage Limits**: Supabase free tier includes 500MB storage. Each report is ~50KB, supporting ~10,000 reports.
- **Performance**: Indexes are created for optimal query performance. Consider adding more as your data grows.
- **Backup**: Supabase automatically backs up your data. For critical applications, consider additional backup strategies.

## Cost Optimization

The caching system significantly reduces AI API costs:
- **Without caching**: Every analysis = 1 API call
- **With caching**: Repeat analyses within 3 months = 0 API calls
- **Estimated savings**: 60-80% reduction in API costs for typical usage patterns