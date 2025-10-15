import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Try service role key first, fallback to anon key
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL:', supabaseUrl ? '✓' : '✗ Missing');
  console.error('SUPABASE_KEY:', process.env.SUPABASE_KEY ? '✓' : '✗ Missing');
  console.error('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✓' : '✗ Missing');
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with auth options for server-side
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

console.log('✅ Connected to Supabase with key type:',
  supabaseKey.includes('service_role') ? 'service_role' :
  supabaseKey.includes('anon') ? 'anon' : 'unknown');
