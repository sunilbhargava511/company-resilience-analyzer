// lib/database.js - Database operations for company reports
import { supabase } from './supabase';
import { nanoid } from 'nanoid';

/**
 * Normalize company name for consistent matching
 */
const normalizeCompanyName = (name) => {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Generate a unique share ID
 */
const generateShareId = () => {
  return nanoid(12); // 12-character URL-safe ID
};

/**
 * Check if a cached report exists for a company (less than 3 months old)
 */
export const getCachedReport = async (companyName) => {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, skipping cache check');
      return null;
    }
    const normalizedName = normalizeCompanyName(companyName);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data, error } = await supabase
      .from('company_reports')
      .select('*')
      .eq('company_name_normalized', normalizedName)
      .gte('created_at', threeMonthsAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching cached report:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getCachedReport:', error);
    return null;
  }
};

/**
 * Save a new report to the database
 */
export const saveReport = async ({
  companyName,
  analysisData,
  modelUsed,
  tokenLimit,
  fileContext = null
}) => {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, skipping report save');
      return {
        id: null,
        share_id: generateShareId(),
        created_at: new Date().toISOString(),
        model_used: modelUsed,
        token_limit: tokenLimit,
        version: 1
      };
    }
    const shareId = generateShareId();
    const normalizedName = normalizeCompanyName(companyName);

    const reportData = {
      company_name: companyName,
      company_name_normalized: normalizedName,
      analysis_data: analysisData,
      model_used: modelUsed,
      token_limit: tokenLimit,
      file_context: fileContext,
      share_id: shareId,
      version: 1
    };

    const { data, error } = await supabase
      .from('company_reports')
      .insert([reportData])
      .select()
      .single();

    if (error) {
      console.error('Error saving report:', error);
      throw new Error(`Failed to save report: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in saveReport:', error);
    throw error;
  }
};

/**
 * Get a report by share ID
 */
export const getReportByShareId = async (shareId) => {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, cannot retrieve shared report');
      return null;
    }
    const { data, error } = await supabase
      .from('company_reports')
      .select('*')
      .eq('share_id', shareId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No matching record
      }
      console.error('Error fetching report by share ID:', error);
      throw new Error(`Failed to fetch report: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getReportByShareId:', error);
    throw error;
  }
};

/**
 * Get the latest report for a company
 */
export const getLatestReportForCompany = async (companyName) => {
  try {
    const normalizedName = normalizeCompanyName(companyName);

    const { data, error } = await supabase
      .from('company_reports')
      .select('*')
      .eq('company_name_normalized', normalizedName)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest report:', error);
      throw new Error(`Failed to fetch latest report: ${error.message}`);
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getLatestReportForCompany:', error);
    throw error;
  }
};

/**
 * Get all reports for a company (for history)
 */
export const getCompanyReportHistory = async (companyName, limit = 10) => {
  try {
    const normalizedName = normalizeCompanyName(companyName);

    const { data, error } = await supabase
      .from('company_reports')
      .select('id, company_name, created_at, model_used, share_id, version')
      .eq('company_name_normalized', normalizedName)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching company report history:', error);
      throw new Error(`Failed to fetch report history: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCompanyReportHistory:', error);
    throw error;
  }
};

/**
 * Initialize database tables (run this once to set up the schema)
 * Note: In production, you should create these tables via Supabase dashboard or migrations
 */
export const initializeDatabase = async () => {
  const createTableSQL = `
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

    CREATE INDEX IF NOT EXISTS idx_company_normalized ON company_reports(company_name_normalized);
    CREATE INDEX IF NOT EXISTS idx_created_at ON company_reports(created_at);
    CREATE INDEX IF NOT EXISTS idx_share_id ON company_reports(share_id);
  `;

  try {
    // Note: This is a simplified version. In production, use proper migrations
    console.log('Database initialization would run:', createTableSQL);
    console.log('Please create this table in your Supabase dashboard or use migrations');
    return { success: true, message: 'Database schema ready for creation' };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, message: error.message };
  }
};