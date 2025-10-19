import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Search, Plus, Minus } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const AddMealItemModal = ({ isOpen, onClose, onAdd, mealType, savedMeals }) => {
  const [step, setStep] = useState('search'); // 'search', 'scanner', 'details'
  const [searchQuery, setSearchQuery] = useState('');
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [selectedSavedMeal, setSelectedSavedMeal] = useState(null);

  const [portionSize, setPortionSize] = useState(100);
  const [portionUnit, setPortionUnit] = useState('g');
  const [customProductName, setCustomProductName] = useState('');

  const html5QrCodeRef = useRef(null);
  const scannerRef = useRef(null);

  const portionUnits = [
    { value: 'g', label: 'Grams (g)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'piece', label: 'Piece' },
    { value: 'spoon', label: 'Spoon' },
    { value: 'cup', label: 'Cup' },
    { value: 'package', label: 'Package' },
    { value: 'slice', label: 'Slice' }
  ];

  useEffect(() => {
    if (!isOpen) {
      resetModal();
      stopScanner();
    }
  }, [isOpen]);

  const resetModal = () => {
    setStep('search');
    setSearchQuery('');
    setBarcode('');
    setProductInfo(null);
    setSelectedSavedMeal(null);
    setPortionSize(100);
    setPortionUnit('g');
    setCustomProductName('');
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.log('Scanner already stopped');
      }
    }
    setScanning(false);
  };

  const startScanner = async () => {
    setStep('scanner');
    setScanning(true);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('meal-item-scanner');
      }

      const qrCodeSuccessCallback = async (decodedText) => {
        console.log('Scanned barcode:', decodedText);
        setBarcode(decodedText);
        await stopScanner();
        await fetchProductByBarcode(decodedText);
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setScanning(false);
      alert('Failed to start camera. Please enter barcode manually.');
    }
  };

  const fetchProductByBarcode = async (barcodeValue) => {
    setLoadingProduct(true);
    setStep('details');

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcodeValue}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        const productData = {
          name: product.product_name || product.generic_name || '',
          brand: product.brands || '',
          barcode: barcodeValue,
          imageUrl: product.image_url || '',

          // Nutrition per 100g
          nutrition: {
            energyKcal: product.nutriments?.['energy-kcal_100g'] || 0,
            fat: product.nutriments?.fat_100g || 0,
            saturatedFat: product.nutriments?.['saturated-fat_100g'] || 0,
            carbohydrates: product.nutriments?.carbohydrates_100g || 0,
            sugars: product.nutriments?.sugars_100g || 0,
            fiber: product.nutriments?.fiber_100g || 0,
            proteins: product.nutriments?.proteins_100g || 0,
            salt: product.nutriments?.salt_100g || 0,
          }
        };

        setProductInfo(productData);
        setCustomProductName(productData.name);
      } else {
        setProductInfo(null);
        alert('Product not found in database. Please enter details manually.');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProductInfo(null);
      alert('Error fetching product information.');
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleManualBarcodeSubmit = (e) => {
    e.preventDefault();
    if (barcode.trim()) {
      fetchProductByBarcode(barcode.trim());
    }
  };

  const calculateNutrition = () => {
    if (!productInfo?.nutrition) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    // Calculate based on portion size (nutrition data is per 100g/ml)
    const multiplier = portionSize / 100;

    return {
      calories: (productInfo.nutrition.energyKcal || 0) * multiplier,
      protein: (productInfo.nutrition.proteins || 0) * multiplier,
      carbs: (productInfo.nutrition.carbohydrates || 0) * multiplier,
      fat: (productInfo.nutrition.fat || 0) * multiplier
    };
  };

  const handleAddItem = () => {
    if (!customProductName.trim()) {
      alert('Please enter a product name');
      return;
    }

    if (!portionSize || portionSize <= 0) {
      alert('Please enter a valid portion size');
      return;
    }

    const nutrition = calculateNutrition();

    const item = {
      productName: customProductName,
      barcode: barcode || null,
      portionSize: parseFloat(portionSize),
      portionUnit: portionUnit,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    };

    onAdd(item);
    onClose();
  };

  const handleAddSavedMeal = (meal) => {
    const items = meal.items.map(item => ({
      productName: item.productName,
      barcode: item.barcode,
      portionSize: item.portionSize,
      portionUnit: item.portionUnit,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      savedMealId: meal.id
    }));

    onAdd(items);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Add to {mealType}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {/* Saved Meals Section */}
          {savedMeals && savedMeals.length > 0 && step === 'search' && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Add Saved Meals</h4>
              <div className="space-y-2">
                {savedMeals.map(meal => (
                  <button
                    key={meal.id}
                    onClick={() => handleAddSavedMeal(meal)}
                    className="w-full bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-3 text-left hover:from-blue-100 hover:to-green-100 dark:hover:from-blue-900/30 dark:hover:to-green-900/30 transition"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{meal.name}</p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                      <span>{Math.round(meal.totalCalories)} kcal</span>
                      <span>P: {Math.round(meal.totalProtein)}g</span>
                      <span>C: {Math.round(meal.totalCarbs)}g</span>
                      <span>F: {Math.round(meal.totalFat)}g</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or add individual item</span>
                </div>
              </div>
            </div>
          )}

          {/* Search/Scanner Options */}
          {step === 'search' && (
            <div className="space-y-4">
              <form onSubmit={handleManualBarcodeSubmit} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter Barcode
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Enter barcode number..."
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>

              <button
                onClick={startScanner}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-green-700 transition flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Scan Barcode
              </button>

              <button
                onClick={() => {
                  setStep('details');
                  setProductInfo(null);
                }}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Enter Manually
              </button>
            </div>
          )}

          {/* Scanner View */}
          {step === 'scanner' && (
            <div className="space-y-4">
              <div id="meal-item-scanner" className="w-full rounded-xl overflow-hidden"></div>
              <button
                onClick={() => {
                  stopScanner();
                  setStep('search');
                }}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Cancel Scan
              </button>
            </div>
          )}

          {/* Details View */}
          {step === 'details' && (
            <div className="space-y-4">
              {loadingProduct ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Product Info */}
                  {productInfo && (
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-4">
                      {productInfo.imageUrl && (
                        <img
                          src={productInfo.imageUrl}
                          alt={productInfo.name}
                          className="w-full h-32 object-contain rounded-lg mb-3"
                        />
                      )}
                      <h4 className="font-semibold text-gray-900 dark:text-white">{productInfo.name}</h4>
                      {productInfo.brand && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{productInfo.brand}</p>
                      )}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-2">
                          <span className="text-gray-600 dark:text-gray-400">Calories</span>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {productInfo.nutrition.energyKcal} kcal/100g
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-2">
                          <span className="text-gray-600 dark:text-gray-400">Protein</span>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {productInfo.nutrition.proteins}g/100g
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-2">
                          <span className="text-gray-600 dark:text-gray-400">Carbs</span>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {productInfo.nutrition.carbohydrates}g/100g
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-2">
                          <span className="text-gray-600 dark:text-gray-400">Fat</span>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {productInfo.nutrition.fat}g/100g
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={customProductName}
                      onChange={(e) => setCustomProductName(e.target.value)}
                      placeholder="e.g., Chicken Breast"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Portion Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Portion Size
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-3">
                        <button
                          type="button"
                          onClick={() => setPortionSize(Math.max(1, portionSize - 10))}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={portionSize}
                          onChange={(e) => setPortionSize(parseFloat(e.target.value) || 0)}
                          className="flex-1 py-2 bg-transparent border-0 text-center text-gray-900 dark:text-white focus:outline-none"
                          min="0"
                          step="0.1"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setPortionSize(portionSize + 10)}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <select
                        value={portionUnit}
                        onChange={(e) => setPortionUnit(e.target.value)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {portionUnits.map(unit => (
                          <option key={unit.value} value={unit.value}>{unit.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calculated Nutrition */}
                  {productInfo && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Nutrition for {portionSize} {portionUnit}
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">Calories</span>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {Math.round(calculateNutrition().calories)} kcal
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">Protein</span>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {Math.round(calculateNutrition().protein)}g
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">Carbs</span>
                          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {Math.round(calculateNutrition().carbs)}g
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">Fat</span>
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {Math.round(calculateNutrition().fat)}g
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setStep('search');
                        setProductInfo(null);
                        setBarcode('');
                        setCustomProductName('');
                      }}
                      className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAddItem}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                    >
                      Add Item
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMealItemModal;
