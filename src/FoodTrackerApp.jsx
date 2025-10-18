import React, { useState, useEffect, useRef } from 'react';
import { Camera, User, Package, Bell, Plus, X, Search, Calendar, StickyNote, Trash2, LogOut, Home, Loader, Settings as SettingsIcon } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import LoginRegister from './components/LoginRegister';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ImageUpload from './components/ImageUpload';
import Settings from './components/Settings';
import { supabase } from './config/supabase';
import { products as productsApi } from './utils/api';

const FoodTrackerApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('login');
  const [activeTab, setActiveTab] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetToken, setResetToken] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true; // Default to dark mode
  });
  const html5QrCodeRef = useRef(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    barcode: '',
    expiryDate: '',
    notes: '',
    imageUrl: '',
    brand: '',
    addedDate: new Date().toISOString()
  });

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Check if user is already logged in and handle Supabase auth state
  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email
        });
        setView('products');
        await loadProducts();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setView('login');
      } else if (event === 'PASSWORD_RECOVERY') {
        // User clicked password reset link
        setView('resetPassword');
        setResetToken(session.access_token);
      }
    });

    // Check for existing session
    verifyAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const verifyAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email
        });
        setView('products');
        await loadProducts();
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      setCurrentUser(null);
      setView('login');
    }
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  useEffect(() => {
    if (currentUser && view === 'products') {
      loadProducts();
    }
  }, [currentUser]);

  useEffect(() => {
    checkExpiringProducts();
  }, [products, currentUser]);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
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
      // First check if there's a shared image for this barcode
      const sharedImage = await productsApi.getBarcodeImage(barcode);

      // Then fetch from Open Food Facts
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        return {
          name: product.product_name || product.generic_name || '',
          brand: product.brands || '',
          imageUrl: sharedImage?.imageUrl || product.image_url || product.image_front_url || '',
          category: product.categories || '',
          shared: !!sharedImage
        };
      }

      // If no product info from Open Food Facts but there's a shared image
      if (sharedImage) {
        return {
          name: '',
          brand: '',
          imageUrl: sharedImage.imageUrl,
          shared: true
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setProducts([]);
      setView('login');
      setNotifications([]);
      setActiveTab('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const startScanner = async () => {
    setScanning(true);

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 }
        },
        async (decodedText) => {
          stopScanner();
          await handleBarcodeScanned(decodedText);
        },
        (errorMessage) => {
          // Scanning errors are normal, ignore
        }
      );
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Camera access denied or not available. Please use manual barcode entry.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop()
        .then(() => {
          html5QrCodeRef.current = null;
          setScanning(false);
        })
        .catch(() => {
          setScanning(false);
        });
    } else {
      setScanning(false);
    }
  };

  const handleBarcodeScanned = async (barcode) => {
    const productInfo = await fetchProductInfo(barcode);

    if (productInfo && productInfo.name) {
      setNewProduct({
        ...newProduct,
        barcode: barcode,
        name: productInfo.name,
        brand: productInfo.brand,
        imageUrl: productInfo.imageUrl
      });
    } else if (productInfo && productInfo.imageUrl) {
      // Has shared image but no name
      setNewProduct({
        ...newProduct,
        barcode: barcode,
        name: '',
        brand: '',
        imageUrl: productInfo.imageUrl
      });
    } else {
      setNewProduct({
        ...newProduct,
        barcode: barcode,
        name: '',
        brand: '',
        imageUrl: ''
      });
    }

    setView('addProduct');
  };

  const handleManualBarcodeSubmit = async () => {
    if (manualBarcode.trim()) {
      stopScanner();
      await handleBarcodeScanned(manualBarcode);
      setManualBarcode('');
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.barcode || !newProduct.expiryDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const product = await productsApi.create({
        name: newProduct.name,
        barcode: newProduct.barcode,
        expiryDate: newProduct.expiryDate,
        notes: newProduct.notes,
        imageUrl: newProduct.imageUrl,
        brand: newProduct.brand
      });

      setProducts([...products, product]);
      setNewProduct({ name: '', barcode: '', expiryDate: '', notes: '', imageUrl: '', brand: '', addedDate: new Date().toISOString() });
      setView('products');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await productsApi.delete(productId);
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryStatus = (expiryDate) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return { text: 'Expired', color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800', percentage: 100 };
    if (days === 0) return { text: 'Today', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800', percentage: 90 };
    if (days <= 3) return { text: `${days}d left`, color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', percentage: 70 };
    if (days <= 7) return { text: `${days}d left`, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800', percentage: 50 };
    return { text: `${days}d left`, color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800', percentage: 20 };
  };

  const getProgressColor = (days) => {
    if (days < 0) return '#ef4444';
    if (days === 0) return '#f97316';
    if (days <= 3) return '#eab308';
    if (days <= 7) return '#3b82f6';
    return '#10b981';
  };

  const CircularProgress = ({ percentage, days }) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    const color = getProgressColor(days);

    return (
      <div className="relative w-16 h-16">
        <svg className="transform -rotate-90" width="64" height="64">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{Math.abs(days)}d</span>
        </div>
      </div>
    );
  };

  const userProducts = products.filter(p => p.userId === currentUser?.id)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 p.barcode.includes(searchTerm) ||
                 (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())));

  const stats = {
    total: userProducts.length,
    expired: userProducts.filter(p => getDaysUntilExpiry(p.expiryDate) < 0).length,
    expiringSoon: userProducts.filter(p => {
      const days = getDaysUntilExpiry(p.expiryDate);
      return days >= 0 && days <= 3;
    }).length,
    fresh: userProducts.filter(p => getDaysUntilExpiry(p.expiryDate) > 7).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleAuthSuccess = async (user, token) => {
    try {
      console.log('Auth success! User:', user);
      setCurrentUser(user);
      setView('products');
      await loadProducts();
      console.log('Products loaded successfully');
    } catch (error) {
      console.error('Error in handleAuthSuccess:', error);
      // Still set user and view even if products fail to load
      setCurrentUser(user);
      setView('products');
    }
  };

  if (view === 'login') {
    return <LoginRegister
      onAuthSuccess={handleAuthSuccess}
      onForgotPassword={() => setView('forgotPassword')}
      darkMode={darkMode}
    />;
  }

  if (view === 'forgotPassword') {
    return <ForgotPassword
      onBack={() => setView('login')}
      darkMode={darkMode}
    />;
  }

  if (view === 'resetPassword') {
    return <ResetPassword
      token={resetToken}
      onSuccess={() => {
        setView('login');
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }}
      darkMode={darkMode}
    />;
  }

  if (view === 'addProduct') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between max-w-4xl mx-auto px-4 py-4">
            <button onClick={() => setView('products')} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Product</h2>
            <div className="w-6"></div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 mt-4">
          {loadingProduct && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-4 flex items-center justify-center gap-3">
              <Loader className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-blue-600 dark:text-blue-400 font-medium">Fetching product information...</span>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Image</label>
              <ImageUpload
                barcode={newProduct.barcode}
                currentImage={newProduct.imageUrl}
                onImageUpload={(imageUrl) => setNewProduct({ ...newProduct, imageUrl })}
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name *</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="e.g., Milk, Bread, Yogurt"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {newProduct.brand && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</label>
                <input
                  type="text"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  placeholder="Brand name"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Barcode *</label>
              <input
                type="text"
                value={newProduct.barcode}
                onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                placeholder="Scan or enter manually"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date *</label>
              <input
                type="date"
                value={newProduct.expiryDate}
                onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
              <textarea
                value={newProduct.notes}
                onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows="3"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={addProduct}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
            >
              Save Product
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'scanner') {
    return (
      <div className="min-h-screen bg-gray-900 dark:bg-black">
        <div className="bg-gray-800 dark:bg-gray-900 text-white p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button onClick={() => { stopScanner(); setView('products'); }} className="hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded-lg transition">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold">Scan Barcode</h2>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 mt-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 mb-4">
            <button
              onClick={startScanner}
              disabled={scanning}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition ${
                scanning
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg'
              }`}
            >
              <Camera className="w-5 h-5" />
              {scanning ? 'Scanning...' : 'Start Camera'}
            </button>

            <div id="qr-reader" className="w-full mt-4 rounded-xl overflow-hidden"></div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6">
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4 font-medium">Enter manually</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualBarcodeSubmit()}
                placeholder="Barcode number"
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleManualBarcodeSubmit}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'settings') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">ExpireTrack</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.name || currentUser?.email}</p>
              </div>
            </div>
            <button onClick={() => setActiveTab('home')} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <Settings
          user={currentUser}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
        />

        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-around">
            <button
              onClick={() => setActiveTab('home')}
              className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition relative text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {notifications.length}
                </span>
              )}
              <span className="text-xs font-medium">Alerts</span>
            </button>

            <button
              onClick={() => setView('scanner')}
              className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs font-medium">Scan</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition text-blue-600"
            >
              <SettingsIcon className="w-6 h-6" />
              <span className="text-xs font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 animate-slide-up">
        <div className="flex items-center justify-between max-w-4xl mx-auto px-3 py-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              {currentUser?.picture ? (
                <img src={currentUser.picture} alt={currentUser.name} className="w-10 h-10 rounded-xl" />
              ) : (
                <Package className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">ExpireTrack</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.name || currentUser?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
      {activeTab === 'home' && (
        <div className="max-w-4xl mx-auto p-3">
          <div className="mb-3 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-0 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Items</span>
                <Package className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</span>
                <Bell className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.expiringSoon}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Expired</span>
                <Calendar className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.expired}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Fresh</span>
                <Package className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.fresh}</p>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Your Products</h2>
          </div>

          {userProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">No products yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Tap + to add your first product</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userProducts.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)).map(product => {
                const days = getDaysUntilExpiry(product.expiryDate);
                const status = getExpiryStatus(product.expiryDate);
                return (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-16 h-16 object-contain rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0"
                        />
                      ) : (
                        <CircularProgress percentage={status.percentage} days={days} />
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">{product.name}</h3>
                        {product.brand && <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{product.brand}</p>}
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">Barcode: {product.barcode}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(product.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                          {status.text}
                        </span>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {product.notes && (
                      <div className="mt-3 flex items-start gap-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                        <StickyNote className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{product.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="max-w-4xl mx-auto p-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Notifications</h2>

          {notifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(product => {
                const days = getDaysUntilExpiry(product.expiryDate);
                const status = getExpiryStatus(product.expiryDate);
                return (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border-l-4 border-red-500">
                    <div className="flex items-center gap-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-16 h-16 object-contain rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0"
                        />
                      ) : (
                        <CircularProgress percentage={status.percentage} days={days} />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                        {product.brand && <p className="text-sm text-gray-600 dark:text-gray-400">{product.brand}</p>}
                        <p className="text-sm text-gray-500 dark:text-gray-500">Barcode: {product.barcode}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 border ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setView('scanner')}
        className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      </div>
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition ${
              activeTab === 'home'
                ? 'text-blue-600'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition relative ${
              activeTab === 'notifications'
                ? 'text-blue-600'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Bell className="w-6 h-6" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {notifications.length}
              </span>
            )}
            <span className="text-xs font-medium">Alerts</span>
          </button>

          <button
            onClick={() => setView('scanner')}
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Camera className="w-6 h-6" />
            <span className="text-xs font-medium">Scan</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition ${
              activeTab === 'settings'
                ? 'text-blue-600'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <SettingsIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodTrackerApp;
