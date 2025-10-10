#!/usr/bin/env node

import { createClient } from 'redis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Checking ExpireTrack Setup...\n');

let allGood = true;

// Check .env file
console.log('1. Checking .env file...');
try {
  const envContent = readFileSync(join(__dirname, '.env'), 'utf-8');

  const hasPort = envContent.includes('PORT=');
  const hasRedis = envContent.includes('REDIS_URL=');
  const hasJWT = envContent.includes('JWT_SECRET=');
  const hasGoogleId = envContent.includes('GOOGLE_CLIENT_ID=') && !envContent.includes('YOUR_GOOGLE_CLIENT_ID_HERE');
  const hasGoogleSecret = envContent.includes('GOOGLE_CLIENT_SECRET=') && !envContent.includes('YOUR_GOOGLE_CLIENT_SECRET_HERE');

  if (hasPort && hasRedis && hasJWT) {
    console.log('   ✅ Basic configuration found');
  } else {
    console.log('   ❌ Missing basic configuration');
    allGood = false;
  }

  if (hasGoogleId && hasGoogleSecret) {
    console.log('   ✅ Google OAuth credentials configured');
  } else {
    console.log('   ⚠️  Google OAuth credentials not configured');
    console.log('   👉 Add your credentials to .env file');
    allGood = false;
  }
} catch (err) {
  console.log('   ❌ .env file not found');
  allGood = false;
}

// Check .env.local file
console.log('\n2. Checking .env.local file...');
try {
  const envLocalContent = readFileSync(join(__dirname, '.env.local'), 'utf-8');
  if (envLocalContent.includes('VITE_API_URL=')) {
    console.log('   ✅ Frontend configuration found');
  } else {
    console.log('   ❌ Frontend configuration missing');
    allGood = false;
  }
} catch (err) {
  console.log('   ❌ .env.local file not found');
  allGood = false;
}

// Check Redis connection
console.log('\n3. Checking Redis connection...');
const redisClient = createClient({
  url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.log('   ❌ Redis connection failed');
  console.log('   👉 Make sure Redis is running: brew services start redis');
  allGood = false;
  process.exit(1);
});

try {
  await redisClient.connect();
  await redisClient.ping();
  console.log('   ✅ Redis is running and connected');
  await redisClient.quit();
} catch (err) {
  console.log('   ❌ Cannot connect to Redis');
  console.log('   👉 Install and start Redis:');
  console.log('      macOS: brew install redis && brew services start redis');
  console.log('      Linux: sudo apt-get install redis-server && sudo systemctl start redis');
  allGood = false;
}

// Check node_modules
console.log('\n4. Checking dependencies...');
try {
  const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));
  const nodeModulesExists = require('fs').existsSync(join(__dirname, 'node_modules'));

  if (nodeModulesExists) {
    console.log('   ✅ Dependencies installed');
  } else {
    console.log('   ⚠️  Dependencies not installed');
    console.log('   👉 Run: npm install');
    allGood = false;
  }
} catch (err) {
  console.log('   ❌ Cannot check dependencies');
  allGood = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All checks passed! You\'re ready to run:');
  console.log('\n   npm run dev:full\n');
  console.log('Then open: http://localhost:5173');
} else {
  console.log('⚠️  Some issues found. Please fix them and try again.');
  console.log('\n📖 See START_HERE.md or HARDCODED_SETUP.md for help');
}
console.log('='.repeat(50) + '\n');

process.exit(allGood ? 0 : 1);
