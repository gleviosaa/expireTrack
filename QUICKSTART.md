# Quick Start Guide

Get ExpireTrack running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

## Step 2: Get Google OAuth Credentials (2 min)

1. Go to https://console.cloud.google.com/
2. Create/select a project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials:
   - Authorized origins: `http://localhost:5173`
   - Redirect URIs: `http://localhost:5000/auth/google/callback`
5. Copy your Client ID and Client Secret

## Step 3: Set Up Redis (1 min)

### Option A: Use Redis Cloud (Recommended - Free)
1. Go to https://redis.com/try-free/
2. Create account and database
3. Copy connection URL

### Option B: Install Locally
```bash
# macOS
brew install redis && brew services start redis

# Ubuntu
sudo apt-get install redis-server && sudo systemctl start redis
```

## Step 4: Configure Environment (1 min)

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Use your Redis Cloud URL or local Redis
REDIS_URL=redis://localhost:6379

# Generate random strings for these
JWT_SECRET=my-super-secret-jwt-key-123
SESSION_SECRET=my-super-secret-session-key-456

# Paste your Google credentials
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

Create `.env.local` file:
```env
VITE_API_URL=http://localhost:5000
```

## Step 5: Run the App (30 seconds)

```bash
npm run dev:full
```

Open http://localhost:5173 and sign in with Google!

## 🎉 That's it!

You should now see:
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:5173
- ✅ Google Sign-In working
- ✅ Redis connected

## Common Issues

**"Redis connection failed"**
- Check Redis is running: `redis-cli ping`
- Verify REDIS_URL in .env

**"Google OAuth error"**
- Verify Client ID/Secret in .env
- Check redirect URI matches Google Console exactly

**"Cannot find module"**
- Run `npm install` again
- Delete node_modules and package-lock.json, then reinstall

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed documentation
- Deploy to Vercel (see deployment section in SETUP.md)
- Customize the app for your needs

Need help? Create an issue on GitHub!
