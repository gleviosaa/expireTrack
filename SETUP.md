# ExpireTrack Setup Guide

Complete setup guide for ExpireTrack with Google OAuth, Redis, and image upload features.

## Prerequisites

- Node.js 16+ installed
- Git installed
- Google Cloud Account (for OAuth)
- Redis Cloud account (for production) or local Redis (for development)

## 1. Clone and Install

```bash
git clone https://github.com/gleviosaa/expireTrack.git
cd expireTrack
npm install
```

## 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - `https://your-app-name.vercel.app` (production)
   - Authorized redirect URIs:
     - `http://localhost:5000/auth/google/callback` (development)
     - `https://your-api-url.vercel.app/auth/google/callback` (production)
5. Copy your Client ID and Client Secret

## 3. Set Up Redis

### Option A: Local Redis (Development)
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
```

### Option B: Redis Cloud (Production - Recommended)
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a free account
3. Create a new database
4. Copy the connection URL (format: `rediss://default:password@host:port`)

## 4. Configure Environment Variables

### Backend (.env in root directory):
```bash
cp .env.example .env
```

Edit `.env` and fill in:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Redis
REDIS_URL=redis://localhost:6379
# Or for Redis Cloud: rediss://default:password@your-redis.upstash.io:port

# JWT & Session Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-super-secret-session-key-change-this

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

### Frontend (.env.local):
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=http://localhost:5000
```

## 5. Run Development

### Option A: Run both frontend and backend together:
```bash
npm run dev:full
```

### Option B: Run separately:

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

App will be available at: `http://localhost:5173`

## 6. Deploy to Vercel

### Prepare for deployment:

1. **Push to GitHub:**
```bash
git add .
git commit -m "Add backend and new features"
git push origin main
```

2. **Deploy to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables in Vercel:
     - Go to Project Settings > Environment Variables
     - Add all variables from `.env` file
     - Update URLs for production:
       - `CLIENT_URL`: Your Vercel frontend URL
       - `GOOGLE_CALLBACK_URL`: `https://your-app.vercel.app/auth/google/callback`
       - `REDIS_URL`: Your Redis Cloud URL
       - `NODE_ENV`: `production`

3. **Update Google OAuth:**
   - Go back to Google Cloud Console
   - Add your Vercel URLs to authorized origins and redirect URIs

4. **Deploy:**
   - Vercel will automatically deploy when you push to main branch

## Features

### ✅ Implemented Features

1. **Google Sign-In Authentication**
   - Secure login with Google OAuth
   - JWT token-based sessions
   - User profile with name and picture

2. **Redis Database**
   - All data stored in Redis
   - Fast and scalable
   - User products and images persistence

3. **Image Upload**
   - Take photos with camera
   - Select from gallery
   - Images stored as base64 in Redis
   - 5MB file size limit

4. **Shared Product Images**
   - When you scan a barcode and upload an image, it's saved for all users
   - Other users scanning the same barcode will see your uploaded image
   - Reduces redundant uploads
   - Community-driven product database

5. **Open Food Facts Integration**
   - Automatic product information lookup
   - Product names, brands, and images
   - Combined with user-uploaded images

6. **Barcode Scanning**
   - Camera-based scanning
   - Manual barcode entry
   - Multiple barcode format support

7. **Expiry Tracking**
   - Visual expiry status indicators
   - Notifications for expiring products
   - Product statistics dashboard

## Troubleshooting

### Redis Connection Issues
- Check if Redis is running: `redis-cli ping` (should return "PONG")
- Verify REDIS_URL in .env
- For Redis Cloud, ensure the URL starts with `rediss://` (with double 's')

### Google OAuth Errors
- Verify redirect URIs match exactly in Google Console
- Check CLIENT_ID and CLIENT_SECRET in .env
- Ensure Google+ API is enabled

### Image Upload Issues
- Check file size (must be under 5MB)
- Verify Redis has enough memory
- Check browser console for errors

### Deployment Issues
- Ensure all environment variables are set in Vercel
- Check Vercel logs for errors
- Verify Redis Cloud connection from Vercel

## Development Tips

- Use Redux DevTools to inspect state
- Check browser Network tab for API calls
- View Redis data: `redis-cli` then `KEYS *`
- Check server logs for backend errors

## API Endpoints

- `GET /auth/google` - Initiate Google login
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/verify` - Verify JWT token
- `POST /auth/logout` - Logout user
- `GET /api/products` - Get all user products
- `POST /api/products` - Create new product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/barcode/:barcode/image` - Get shared barcode image
- `POST /api/upload` - Upload product image
- `GET /health` - Health check

## Support

For issues or questions:
- Create an issue on GitHub
- Check the README.md for general information
- Review environment variables carefully

## License

MIT
