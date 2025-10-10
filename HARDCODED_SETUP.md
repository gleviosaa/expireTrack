# Hardcoded Setup Guide

This guide will get you running with minimal configuration needed.

## ✅ Already Configured (Hardcoded)

The following are already set in `.env` and `.env.local`:
- ✅ Port numbers
- ✅ API URLs
- ✅ JWT secrets
- ✅ Session secrets
- ✅ Callback URLs

## 🔧 What You Need to Setup

### 1. Install Redis (Required - 2 minutes)

**Option A: macOS**
```bash
brew install redis
brew services start redis
```

**Option B: Ubuntu/Debian**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

**Option C: Windows**
```bash
# Use WSL2 and follow Ubuntu instructions, or
# Download from: https://github.com/microsoftarchive/redis/releases
```

**Verify Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

### 2. Get Google OAuth Credentials (Required - 3 minutes)

You need to get Google OAuth credentials. Here's the quick way:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create/Select Project**
   - Click "Select a project" → "New Project"
   - Name it "ExpireTrack" → Create

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API" → Enable

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - If prompted, configure consent screen:
     - User Type: External → Create
     - App name: ExpireTrack
     - User support email: your email
     - Developer contact: your email
     - Save and Continue (skip scopes, test users)
   - Back to Create Credentials:
     - Application type: **Web application**
     - Name: ExpireTrack Dev
     - Authorized JavaScript origins:
       ```
       http://localhost:5173
       ```
     - Authorized redirect URIs:
       ```
       http://localhost:5000/auth/google/callback
       ```
     - Click Create

5. **Copy Your Credentials**
   - You'll see a dialog with Client ID and Client Secret
   - Copy both values

6. **Update .env file**
   - Open `.env` file in the project root
   - Replace these lines:
     ```env
     GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
     GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
     ```
   - With your actual values:
     ```env
     GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
     ```

### 3. Install Dependencies (1 minute)

```bash
npm install
```

### 4. Run the Application (30 seconds)

```bash
npm run dev:full
```

This will start:
- 🖥️ Backend server on http://localhost:5000
- 🌐 Frontend app on http://localhost:5173

### 5. Test It Out!

1. Open http://localhost:5173
2. Click "Sign in with Google"
3. Sign in with your Google account
4. Start adding products!

## 🎯 Quick Verification Checklist

Before running, verify:

- [ ] Redis is installed and running (`redis-cli ping` returns PONG)
- [ ] Google OAuth credentials are in `.env`
- [ ] Dependencies installed (`node_modules` folder exists)
- [ ] Both `.env` and `.env.local` files exist

## 🐛 Troubleshooting

### Redis Connection Error
```bash
# Check if Redis is running
redis-cli ping

# Start Redis (macOS)
brew services start redis

# Start Redis (Linux)
sudo systemctl start redis
```

### Google OAuth Error
- **Error: redirect_uri_mismatch**
  - Make sure the callback URL in Google Console exactly matches:
    `http://localhost:5000/auth/google/callback`

- **Error: invalid_client**
  - Check your Client ID and Secret in `.env` file
  - Make sure there are no extra spaces or quotes

### Port Already in Use
```bash
# If port 5000 or 5173 is in use, kill the process:
# macOS/Linux
lsof -ti:5000 | xargs kill
lsof -ti:5173 | xargs kill

# Or change the port in .env (PORT=5001)
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📝 Configuration Summary

### Your .env file should look like:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
JWT_SECRET=hardcoded-jwt-secret-key-for-development-only-change-in-production-12345
SESSION_SECRET=hardcoded-session-secret-key-for-development-only-change-in-production-67890
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

### Your .env.local file should be:
```env
VITE_API_URL=http://localhost:5000
```

## 🎉 That's It!

With Redis running and Google OAuth configured, you're ready to go!

```bash
npm run dev:full
```

Open http://localhost:5173 and enjoy! 🚀

## 🔗 Useful Commands

```bash
# Check Redis status
redis-cli ping

# View Redis data
redis-cli
> KEYS *
> GET user:123
> EXIT

# Check if backend is running
curl http://localhost:5000/health

# View backend logs
# (They appear in the terminal where you ran npm run dev:full)

# Stop everything
# Press Ctrl+C in the terminal
```

## 📚 Next Steps

Once everything is working:
- Read [README.md](./README.md) for feature details
- Check [SETUP.md](./SETUP.md) for deployment instructions
- Test the shared image feature with multiple Google accounts!

Need help? The configurations are already hardcoded - you only need Redis and Google OAuth! 🎊
