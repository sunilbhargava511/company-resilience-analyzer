// lib/supabase.js - Supabase client configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// For build-time compatibility, provide fallback values during build
const isBuild = process.env.NODE_ENV === 'production' && !supabaseUrl && !supabaseAnonKey;

let supabase;

if (isBuild || (!supabaseUrl || !supabaseAnonKey)) {
  // During build or when env vars are missing, create a mock client
  console.warn('Supabase environment variables not found. Using build-time fallback.');
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
      insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      eq: () => ({ data: [], error: new Error('Supabase not configured') }),
      gte: () => ({ data: [], error: new Error('Supabase not configured') }),
      order: () => ({ data: [], error: new Error('Supabase not configured') }),
      limit: () => ({ data: [], error: new Error('Supabase not configured') }),
      single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
    })
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// Test connection helper
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('company_reports')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      throw error;
    }
    
    return { success: true, message: 'Connected to Supabase successfully' };
  } catch (error) {
    return { success: false, message: `Supabase connection failed: ${error.message}` };
  }
};