# ExpireTrack 🥫

A modern food expiry date tracker with barcode scanning, Google authentication, and community-shared product images.

## ✨ Features

- 🔐 **Google Sign-In Authentication** - Secure login with your Google account
- 📱 **Barcode Scanning** - Camera-based or manual barcode entry
- 🔍 **Open Food Facts Integration** - Automatic product information lookup
- 📸 **Image Upload** - Take photos or select from gallery
- 🤝 **Shared Product Images** - Community-driven image database (images shared across users by barcode)
- 💾 **Redis Database** - Fast and persistent data storage
- 📅 **Expiry Date Tracking** - Visual indicators and notifications
- 🔔 **Smart Notifications** - Alerts for expiring and expired products
- 📊 **Dashboard Statistics** - Track total, expiring, expired, and fresh items
- 📝 **Product Notes** - Add custom notes to your products

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions including Google OAuth and Redis configuration.

### Basic Installation

```bash
# Clone repository
git clone https://github.com/gleviosaa/expireTrack.git
cd expireTrack

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
cp .env.local.example .env.local
# Edit .env and .env.local with your credentials

# Run development server
npm run dev:full
```

## 📋 Prerequisites

- Node.js 16+
- Google Cloud account (for OAuth)
- Redis (local or Redis Cloud for production)

## 🛠️ Technologies

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios
- html5-qrcode
- Lucide React (icons)

### Backend
- Express.js
- Redis (database)
- Passport.js (Google OAuth)
- JWT (authentication)
- Multer (image uploads)

### APIs
- Open Food Facts API
- Google OAuth 2.0

## 📖 Usage

1. **Sign In** - Click "Sign in with Google"
2. **Scan Product** - Tap the camera button or + icon
3. **Add Details** - Product info auto-fills from barcode
4. **Upload Image** - Take a photo or select from gallery (shared with other users!)
5. **Set Expiry Date** - Choose when the product expires
6. **Track & Monitor** - View dashboard with expiry status

## 🌟 Key Features Explained

### Shared Product Images
When you scan a barcode and upload an image:
- The image is stored in Redis with the barcode as the key
- Other users scanning the same barcode will automatically see your uploaded image
- This creates a community-driven product image database
- Reduces redundant uploads and improves user experience

### Authentication Flow
- Google OAuth 2.0 for secure authentication
- JWT tokens for session management
- User data stored in Redis
- Automatic token verification on app load

## 📁 Project Structure

```
expireTrack/
├── server/              # Backend Express server
│   ├── config/         # Redis, Passport configuration
│   ├── middleware/     # Auth middleware
│   └── routes/         # API routes (auth, products, upload)
├── src/                # Frontend React app
│   ├── components/     # React components
│   ├── utils/          # API utilities
│   └── FoodTrackerApp.jsx  # Main app component
├── vercel.json         # Vercel deployment config
└── SETUP.md           # Detailed setup guide
```

## 🚢 Deployment

The app is configured for Vercel deployment:

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

## 🔧 Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `REDIS_URL` - Redis connection URL
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `JWT_SECRET` - Secret for JWT tokens
- `SESSION_SECRET` - Secret for sessions
- `CLIENT_URL` - Frontend URL

### Frontend (.env.local)
- `VITE_API_URL` - Backend API URL

## 📝 API Endpoints

- `GET /auth/google` - Initiate Google login
- `GET /auth/verify` - Verify JWT token
- `GET /api/products` - Get all user products
- `POST /api/products` - Create new product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/barcode/:barcode/image` - Get shared image
- `POST /api/upload` - Upload product image

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🐛 Issues

Found a bug? Please [create an issue](https://github.com/gleviosaa/expireTrack/issues)

## 👥 Author

Created with ❤️ for reducing food waste
# ExpireTrack - Vercel Deployment 1760261430
