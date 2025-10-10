#!/bin/bash

echo "🚀 Setting up ExpireTrack project..."

# Create directories
mkdir -p src public

# Create package.json
cat > package.json << 'EOF'
{
  "name": "expiretrack",
  "version": "1.0.0",
  "description": "Food expiry date tracker with barcode scanning",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}
EOF

# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ExpireTrack - Food Expiry Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# Create vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
EOF

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules
/.pnp
.pnp.js
/coverage
/dist
/build
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.vscode
.idea
EOF

# Create README.md
cat > README.md << 'EOF'
# ExpireTrack 🥫

A modern food expiry date tracker with barcode scanning capabilities.

## Features

- 📱 Barcode scanning with camera
- 🔍 Automatic product information from Open Food Facts API
- 📅 Expiry date tracking
- 🔔 Notifications for expiring products
- 👤 Multi-user support
- 💾 Local storage persistence
- 🖼️ Product images
- 📝 Notes for products

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Technologies

- React
- Vite
- Tailwind CSS
- Open Food Facts API
- Barcode Detection API
- Local Storage

## Usage

1. Create a user profile
2. Click the + button to add products
3. Scan barcodes or enter manually
4. Set expiry dates
5. Get notifications for expiring items

## License

MIT
EOF

# Create src/index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF

# Create src/main.jsx
cat > src/main.jsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Create src/App.jsx - Part 1
cat > src/App.jsx << 'APPEOF'
import React, { useState, useEffect, useRef } from 'react';
import { Camera, User, Package, Bell, Plus, X, Search, Calendar, StickyNote, Trash2, LogOut, Loader } from 'lucide-react';

const FoodTrackerApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('login');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loginUsername, setLoginUsername] = useState('');
  const videoRef = useRef(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [scanningMessage, setScanningMessage] = useState('');
  const [loadingProduct, setLoadingProduct] = useState(false);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    barcode: '',
    expiryDate: '',
    notes: '',
    imageUrl: '',
    brand: '',
    addedDate: new Date().toISOString()
  });

  useEffect(() => {
    const storedUsers = localStorage.getItem('foodTrackerUsers');
    const storedProducts = localStorage.getItem('foodTrackerProducts');
    
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedProducts) setProducts(JSON.parse(storedProducts));
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('foodTrackerUsers', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('foodTrackerProducts', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    checkExpiringProducts();
  }, [products, currentUser]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const checkExpiringProducts = () => {
    if (!currentUser) return;
    
    const userProducts = products.filter(p => p.userId === currentUser.id);
    const today = new Date();
    const expiring = userProducts.filter(product => {
      const expiryDate = new Date(product.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
    });
    
    const expired = userProducts.filter(product => {
      const expiryDate = new Date(product.expiryDate);
      return expiryDate < today;
    });
    
    setNotifications([...expired, ...expiring]);
  };

  const fetchProductInfo = async (barcode) => {
    setLoadingProduct(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const product = data.product;
        return {
          name: product.product_name || product.generic_name || 'Unknown Product',
          brand: product.brands || '',
          imageUrl: product.image_url || product.image_front_url || '',
          category: product.categories || ''
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching product info:', error);
      return null;
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleLogin = () => {
    if (!loginUsername.trim()) return;
    
    let user = users.find(u => u.username === loginUsername);
    if (!user) {
      user = { id: Date.now().toString(), username: loginUsername, createdAt: new Date().toISOString() };
      setUsers([...users, user]);
    }
    setCurrentUser(user);
    setView('products');
    setLoginUsername('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    setNotifications([]);
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
    setScanningMessage('');
  };

  const startCamera = async () => {
    try {
      setScanningMessage('Requesting camera access...');
      
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          setScanningMessage('Camera ready! Point at a barcode');
          startBarcodeDetection();
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      setScanningMessage('Camera access denied. Please use manual entry below.');
      setCameraActive(false);
      
      if (error.name === 'NotAllowedError') {
        alert('Camera permission denied. Please allow camera access and try again, or use manual barcode entry.');
      } else if (error.name === 'NotFoundError') {
        alert('No camera found on this device. Please use manual barcode entry.');
      } else {
        alert('Camera error: ' + error.message + '. Please use manual barcode entry.');
      }
    }
  };

  const startBarcodeDetection = () => {
    if (!('BarcodeDetector' in window)) {
      setScanningMessage('Barcode detection not supported on this browser. Please use manual entry.');
      return;
    }

    const barcodeDetector = new window.BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
    });

    const detectBarcode = async () => {
      if (!videoRef.current || !cameraActive) return;

      try {
        const barcodes = await barcodeDetector.detect(videoRef.current);
        
        if (barcodes.length > 0) {
          const barcode = barcodes[0].rawValue;
          setScanningMessage(`Barcode detected: ${barcode}. Fetching product info...`);
          
          stopCamera();
          await handleBarcodeScanned(barcode);
          
          return;
        }
      } catch (error) {
        console.error('Detection error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(detectBarcode);
    };

    detectBarcode();
  };

  const handleBarcodeScanned = async (barcode) => {
    const productInfo = await fetchProductInfo(barcode);
    
    if (productInfo) {
      setNewProduct({
        ...newProduct,
        barcode: barcode,
        name: productInfo.name,
        brand: productInfo.brand,
        imageUrl: productInfo.imageUrl
      });
    } else {
      setNewProduct({
        ...newProduct,
        barcode: barcode
      });
    }
    
    setView('addProduct');
  };

  const handleManualBarcodeSubmit = async () => {
    if (manualBarcode.trim()) {
      stopCamera();
      await handleBarcodeScanned(manualBarcode);
      setManualBarcode('');
    }
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.barcode || !newProduct.expiryDate) {
      alert('Please fill in all required fields');
      return;
    }

    const product = {
      ...newProduct,
      id: Date.now().toString(),
      userId: currentUser.id,
      addedDate: new Date().toISOString()
    };

    setProducts([...products, product]);
    setNewProduct({ name: '', barcode: '', expiryDate: '', notes: '', imageUrl: '', brand: '', addedDate: new Date().toISOString() });
    setView('products');
  };

  const deleteProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryStatus = (expiryDate) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return { text: 'Expired', color: 'bg-red-100 text-red-800' };
    if (days === 0) return { text: 'Expires today', color: 'bg-orange-100 text-orange-800' };
    if (days <= 3) return { text: \`\${days} days left\`, color: 'bg-yellow-100 text-yellow-800' };
    return { text: \`\${days} days left\`, color: 'bg-green-100 text-green-800' };
  };

  const userProducts = products.filter(p => p.userId === currentUser?.id)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 p.barcode.includes(searchTerm) ||
                 (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())));

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <Package className="w-16 h-16 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Food Tracker</h1>
          <p className="text-center text-gray-600 mb-8">Track your products and expiry dates</p>
          
          <div>
            <input
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'addProduct') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-indigo-600 text-white p-4 shadow-md">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button onClick={() => setView('products')} className="flex items-center gap-2 hover:bg-indigo-700 px-3 py-2 rounded">
              <X className="w-5 h-5" />
              Cancel
            </button>
            <h2 className="text-xl font-semibold">Add Product</h2>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 mt-4">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            {newProduct.imageUrl && (
              <div className="flex justify-center mb-4">
                <img 
                  src={newProduct.imageUrl} 
                  alt={newProduct.name}
                  className="w-32 h-32 object-contain rounded-lg border border-gray-200"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="e.g., Milk, Bread, Yogurt"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {newProduct.brand && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <input
                  type="text"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  placeholder="Brand name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Barcode *</label>
              <input
                type="text"
                value={newProduct.barcode}
                onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                placeholder="Barcode number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
              <input
                type="date"
                value={newProduct.expiryDate}
                onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
              <textarea
                value={newProduct.notes}
                onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                placeholder="Add any additional notes about this product"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={addProduct}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'scanner') {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="bg-gray-800 text-white p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button 
              onClick={() => { 
                stopCamera(); 
                setView('products'); 
              }} 
              className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <h2 className="text-xl font-semibold">Scan Barcode</h2>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 mt-4">
          {loadingProduct && (
            <div className="bg-indigo-600 text-white rounded-lg p-4 mb-4 flex items-center justify-center gap-3">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Fetching product information...</span>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-4">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                disabled={loadingProduct}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5" />
                Start Camera Scan
              </button>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-40 border-4 border-red-500 rounded-lg"></div>
                  </div>
                </div>
                
                {scanningMessage && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
       className="text-gray-500 mb-4">No products yet. Start by scanning your first product!</p>
            </div>
          ) : (
            <div className="space-y-3 mb-20">
              {userProducts.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)).map(product => {
                const status = getExpiryStatus(product.expiryDate);
                return (
                  <div key={product.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-start gap-3 mb-2">
                      {product.imageUrl && (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-20 h-20 object-contain rounded border border-gray-200 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
                            {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}
                            <p className="text-xs text-gray-500">Barcode: {product.barcode}</p>
                          </div>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-500 hover:text-red-700 p-2 flex-shrink-0"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Expires: {new Date(product.expiryDate).toLocaleDateString()}
                          </span>
                        </div>

                        <span className={\`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 \${status.color}\`}>
                          {status.text}
                        </span>

                        {product.notes && (
                          <div className="mt-3 flex items-start gap-2 bg-gray-50 p-3 rounded">
                            <StickyNote className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{product.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setView('scanner')}
            className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodTrackerApp;
APPEOF

echo ""
echo "✅ All files created successfully!"
echo ""
echo "📦 Next steps:"
echo "1. Run: npm install"
echo "2. Run: npm run dev (to test locally)"
echo "3. Run: git add ."
echo "4. Run: git commit -m 'Initial commit'"
echo "5. Run: git remote add origin https://github.com/gleviosaa/expireTrack.git"
echo "6. Run: git push -u origin main"
echo ""
echo "🎉 Your ExpireTrack project is ready!"
