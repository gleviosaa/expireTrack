import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
  try {
    console.log('📋 Running email verification migration...');

    // Read the SQL migration file
    const migrationPath = path.join(__dirname, 'server', 'migrations', 'add_email_verification.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('SQL to execute:');
    console.log(sql);

    // Note: Supabase client doesn't directly support executing raw SQL
    // You need to run this in the Supabase SQL Editor or use the service role key
    console.log('\n⚠️  Please run the above SQL in your Supabase SQL Editor:');
    console.log('1. Go to https://dswgcsijupqsvmttpilw.supabase.co/project/_/sql');
    console.log('2. Copy and paste the SQL above');
    console.log('3. Click "Run" to execute');

  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
