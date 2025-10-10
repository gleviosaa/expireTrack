# 🚀 START HERE - Hardcoded Setup

Everything is already configured! You just need 2 things:

## Step 1: Install Redis (2 min)

```bash
# macOS
brew install redis && brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server && sudo systemctl start redis

# Verify it's running
redis-cli ping  # Should return: PONG
```

## Step 2: Get Google OAuth (3 min)

1. Go to: https://console.cloud.google.com/
2. Create new project called "ExpireTrack"
3. Enable "Google+ API" in APIs & Services → Library
4. Create OAuth credentials in APIs & Services → Credentials:
   - Type: Web application
   - Origins: `http://localhost:5173`
   - Redirect: `http://localhost:5000/auth/google/callback`
5. Copy the Client ID and Secret
6. Open `.env` file and replace:
   ```
   GOOGLE_CLIENT_ID=paste-your-client-id-here
   GOOGLE_CLIENT_SECRET=paste-your-secret-here
   ```

## Step 3: Run It! (1 min)

```bash
npm install
npm run dev:full
```

Open http://localhost:5173 and sign in with Google! 🎉

---

**Having issues?** Read [HARDCODED_SETUP.md](./HARDCODED_SETUP.md) for detailed instructions.

**Everything already set up:**
- ✅ API URLs configured
- ✅ Ports configured
- ✅ Secrets hardcoded
- ✅ Environment files created

**You only need:**
- 🔧 Redis running locally
- 🔑 Google OAuth credentials in `.env`
