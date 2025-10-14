import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dswgcsijupqsvmttpilw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzd2djc2lqdXBxc3ZtdHRwaWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5ODkwMjcsImV4cCI6MjA3NTU2NTAyN30.dVBkuFHzxpZeoW9ddjRx5g3TabEZVEu1wpoF-PyDBtw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Supabase client initialized');
