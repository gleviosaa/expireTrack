# 🚀 Final Setup - Almost Ready!

## ✅ What's Already Configured

Everything is hardcoded and ready:

- ✅ **Backend server** - Port 5000
- ✅ **Frontend app** - Port 5173
- ✅ **Redis Cloud** - Endpoint configured
- ✅ **JWT secrets** - Hardcoded for development
- ✅ **Session secrets** - Hardcoded for development
- ✅ **API URLs** - All configured
- ✅ **Callback URLs** - All set

## 🔧 You Only Need to Add 2 Things!

### 1. Redis Cloud Password (1 minute)

Your Redis endpoint is already configured:
```
redis-10537.c135.eu-central-1-1.ec2.redns.redis-cloud.com:10537
```

**To get your password:**
1. Go to your Redis Cloud dashboard
2. Find your database
3. Copy the password

**Update `.env` file:**
Replace `YOUR_REDIS_PASSWORD` in this line:
```env
REDIS_URL=rediss://default:YOUR_REDIS_PASSWORD@redis-10537.c135.eu-central-1-1.ec2.redns.redis-cloud.com:10537
```

With your actual password:
```env
REDIS_URL=rediss://default:abc123yourpassword@redis-10537.c135.eu-central-1-1.ec2.redns.redis-cloud.com:10537
```

### 2. Google OAuth Credentials (3 minutes)

**Quick Steps:**

1. **Go to**: https://console.cloud.google.com/

2. **Create/Select Project**: "ExpireTrack"

3. **Enable API**:
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API" → Enable

4. **Create Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - If needed, configure consent screen first:
     - User Type: External
     - App name: ExpireTrack
     - Your email
     - Save
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
   - Click "Create"

5. **Copy Credentials** and update `.env`:
   ```env
   GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here
   ```

## 🏃 Run the App

```bash
# Install dependencies (first time only)
npm install

# Verify setup (optional)
npm run check

# Start the app!
npm run dev:full
```

## 🌐 Open Browser

Go to: **http://localhost:5173**

Click "Sign in with Google" and you're done! 🎉

## 📝 Your .env File Should Look Like:

```env
# GitHub PAT (leave as is)
GITHUB_PAT=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

# ExpireTrack Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Redis Cloud (add your password)
REDIS_URL=rediss://default:YOUR_PASSWORD_HERE@redis-10537.c135.eu-central-1-1.ec2.redns.redis-cloud.com:10537

# JWT & Session (already set)
JWT_SECRET=hardcoded-jwt-secret-key-for-development-only-change-in-production-12345
SESSION_SECRET=hardcoded-session-secret-key-for-development-only-change-in-production-67890

# Google OAuth (add your credentials)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

## 🎯 Quick Checklist

Before running, make sure:

- [ ] Redis Cloud password added to `REDIS_URL` in `.env`
- [ ] Google Client ID added to `.env`
- [ ] Google Client Secret added to `.env`
- [ ] Dependencies installed (`npm install`)

## ✅ Verify Everything

Run the setup checker:
```bash
npm run check
```

This will verify:
- ✅ .env file has all values
- ✅ Google OAuth configured
- ✅ Redis Cloud connection works
- ✅ Dependencies installed

## 🐛 Troubleshooting

### "Redis connection failed"
- Check your password in REDIS_URL
- Make sure it starts with `rediss://` (double 's')
- Verify your Redis Cloud database is active

### "Google OAuth error"
- Verify Client ID and Secret in `.env`
- Check redirect URI in Google Console matches exactly:
  `http://localhost:5000/auth/google/callback`
- Make sure Google+ API is enabled

### "Port already in use"
```bash
# Kill the process using the port
lsof -ti:5000 | xargs kill
lsof -ti:5173 | xargs kill
```

## 🎊 What You Get

- 🔐 Google Sign-In authentication
- 📸 Camera/gallery image upload
- 🤝 Shared product images across users
- 📱 Barcode scanning
- 🔍 Open Food Facts integration
- 📅 Expiry date tracking
- 🔔 Notifications for expiring items
- 💾 Redis Cloud persistent storage

## 🚀 That's It!

You're just 2 values away from running:
1. Redis password
2. Google OAuth credentials

Then: `npm run dev:full` and you're live! 🎉

---

**Need Help?**
- Simple guide: `INSTRUCTIONS.txt`
- Quick start: `START_HERE.md`
- Detailed guide: `HARDCODED_SETUP.md`
