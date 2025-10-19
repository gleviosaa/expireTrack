import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import AddMealItemModal from './AddMealItemModal';

const CreateSavedMealModal = ({ isOpen, onClose, onSave }) => {
  const [mealName, setMealName] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [mealItems, setMealItems] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);

  const handleAddItem = (itemsOrItem) => {
    const items = Array.isArray(itemsOrItem) ? itemsOrItem : [itemsOrItem];
    setMealItems([...mealItems, ...items]);
    setShowAddItem(false);
  };

  const handleRemoveItem = (index) => {
    setMealItems(mealItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    return mealItems.reduce((totals, item) => ({
      calories: totals.calories + (item.calories || 0),
      protein: totals.protein + (item.protein || 0),
      carbs: totals.carbs + (item.carbs || 0),
      fat: totals.fat + (item.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleSave = () => {
    if (!mealName.trim()) {
      alert('Please enter a meal name');
      return;
    }

    if (mealItems.length === 0) {
      alert('Please add at least one item to the meal');
      return;
    }

    onSave({
      name: mealName,
      description: mealDescription,
      items: mealItems
    });

    // Reset form
    setMealName('');
    setMealDescription('');
    setMealItems([]);
    onClose();
  };

  const totals = calculateTotals();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Saved Meal</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Meal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meal Name *
              </label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="e.g., Chicken & Rice Bowl"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Meal Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                placeholder="Add notes about this meal..."
                rows={2}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Items List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Items ({mealItems.length})
                </label>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {mealItems.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No items added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {mealItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.portionSize} {item.portionUnit} • {Math.round(item.calories)} kcal
                        </p>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>P: {Math.round(item.protein)}g</span>
                          <span>C: {Math.round(item.carbs)}g</span>
                          <span>F: {Math.round(item.fat)}g</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="ml-3 text-red-500 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            {mealItems.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Total Nutrition
                </h5>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Calories</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(totals.calories)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Protein</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                      {Math.round(totals.protein)}g
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Carbs</p>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {Math.round(totals.carbs)}g
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Fat</p>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {Math.round(totals.fat)}g
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
              >
                Save Meal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Sub-Modal */}
      <AddMealItemModal
        isOpen={showAddItem}
        onClose={() => setShowAddItem(false)}
        onAdd={handleAddItem}
        mealType="Saved Meal"
        savedMeals={[]} // Don't show saved meals when creating a new saved meal
      />
    </>
  );
};

export default CreateSavedMealModal;
