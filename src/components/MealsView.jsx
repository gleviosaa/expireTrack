import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, UtensilsCrossed, Calendar, Target, TrendingUp, Package, Save, ChevronDown } from 'lucide-react';
import { meals as mealsApi } from '../utils/api';

const MealsView = ({ currentUser }) => {
  const [mealsTab, setMealsTab] = useState('daily'); // 'daily' or 'saved'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyMenu, setDailyMenu] = useState([]);
  const [savedMeals, setSavedMeals] = useState([]);
  const [nutritionGoals, setNutritionGoals] = useState({
    dailyCalorieGoal: 2000,
    dailyProteinGoal: 150,
    dailyCarbsGoal: 250,
    dailyFatGoal: 65
  });
  const [showAddItem, setShowAddItem] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [loading, setLoading] = useState(true);

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { id: 'snack_morning', label: 'Morning Snack', icon: '☕' },
    { id: 'lunch', label: 'Lunch', icon: '🍽️' },
    { id: 'snack_afternoon', label: 'Afternoon Snack', icon: '🥤' },
    { id: 'dinner', label: 'Dinner', icon: '🌙' }
  ];

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuData, savedMealsData, goalsData] = await Promise.all([
        mealsApi.getDailyMenu(selectedDate),
        mealsApi.getSavedMeals(),
        mealsApi.getNutritionGoals()
      ]);

      setDailyMenu(menuData || []);
      setSavedMeals(savedMealsData || []);
      setNutritionGoals(goalsData || nutritionGoals);
    } catch (error) {
      console.error('Error loading meals data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily totals
  const dailyTotals = dailyMenu.reduce((totals, mealEntry) => {
    mealEntry.items?.forEach(item => {
      totals.calories += item.calories || 0;
      totals.protein += item.protein || 0;
      totals.carbs += item.carbs || 0;
      totals.fat += item.fat || 0;
    });
    return totals;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const CircularProgress = ({ percentage, value, goal, label, color }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`${color} transition-all duration-500`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(value)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">/{goal}</span>
          </div>
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">{label}</span>
      </div>
    );
  };

  const getMealItems = (mealType) => {
    const entry = dailyMenu.find(m => m.mealType === mealType);
    return entry?.items || [];
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await mealsApi.deleteDailyMenuItem(itemId);
      await loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDeleteSavedMeal = async (mealId) => {
    try {
      await mealsApi.deleteSavedMeal(mealId);
      await loadData();
    } catch (error) {
      console.error('Error deleting saved meal:', error);
    }
  };

  const handleUpdateGoals = async (newGoals) => {
    try {
      await mealsApi.updateNutritionGoals(newGoals);
      setNutritionGoals(newGoals);
      setShowGoalsModal(false);
    } catch (error) {
      console.error('Error updating goals:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-3">
      {/* Tab Switcher */}
      <div className="mb-4 bg-white dark:bg-gray-800 rounded-2xl p-1 flex gap-1 shadow-sm animate-fade-in">
        <button
          onClick={() => setMealsTab('daily')}
          className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition ${
            mealsTab === 'daily'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4 inline-block mr-2" />
          Daily Menu
        </button>
        <button
          onClick={() => setMealsTab('saved')}
          className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition ${
            mealsTab === 'saved'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Save className="w-4 h-4 inline-block mr-2" />
          Saved Meals
        </button>
      </div>

      {/* Daily Menu View */}
      {mealsTab === 'daily' && (
        <div className="space-y-3 animate-slide-up">
          {/* Date Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Daily Progress */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Progress</h3>
              <button
                onClick={() => setShowGoalsModal(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Set Goals
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CircularProgress
                percentage={Math.min((dailyTotals.calories / nutritionGoals.dailyCalorieGoal) * 100, 100)}
                value={dailyTotals.calories}
                goal={nutritionGoals.dailyCalorieGoal}
                label="Calories"
                color="text-blue-600"
              />
              <CircularProgress
                percentage={Math.min((dailyTotals.protein / nutritionGoals.dailyProteinGoal) * 100, 100)}
                value={dailyTotals.protein}
                goal={nutritionGoals.dailyProteinGoal}
                label="Protein (g)"
                color="text-green-600"
              />
              <CircularProgress
                percentage={Math.min((dailyTotals.carbs / nutritionGoals.dailyCarbsGoal) * 100, 100)}
                value={dailyTotals.carbs}
                goal={nutritionGoals.dailyCarbsGoal}
                label="Carbs (g)"
                color="text-orange-600"
              />
              <CircularProgress
                percentage={Math.min((dailyTotals.fat / nutritionGoals.dailyFatGoal) * 100, 100)}
                value={dailyTotals.fat}
                goal={nutritionGoals.dailyFatGoal}
                label="Fat (g)"
                color="text-purple-600"
              />
            </div>
          </div>

          {/* Meal Types */}
          {mealTypes.map(mealType => {
            const items = getMealItems(mealType.id);
            const mealTotals = items.reduce((totals, item) => ({
              calories: totals.calories + (item.calories || 0),
              protein: totals.protein + (item.protein || 0),
              carbs: totals.carbs + (item.carbs || 0),
              fat: totals.fat + (item.fat || 0)
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

            return (
              <div key={mealType.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mealType.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{mealType.label}</h3>
                        {items.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(mealTotals.calories)} kcal • {Math.round(mealTotals.protein)}g protein
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMealType(mealType.id);
                        setShowAddItem(true);
                      }}
                      className="w-8 h-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {items.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {items.map(item => (
                      <div key={item.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{item.productName}</p>
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
                          onClick={() => handleDeleteItem(item.id)}
                          className="ml-3 text-red-500 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-400 dark:text-gray-500 text-sm">
                    No items added yet
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Saved Meals View */}
      {mealsTab === 'saved' && (
        <div className="space-y-3 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {savedMeals.length}/5 meals saved
            </p>
            {savedMeals.length < 5 && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                <Plus className="w-4 h-4 inline-block mr-1" />
                Create Meal
              </button>
            )}
          </div>

          {savedMeals.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">No saved meals yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Create custom meals to quickly add to your daily menu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedMeals.map(meal => (
                <div key={meal.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{meal.name}</h3>
                        {meal.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{meal.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteSavedMeal(meal.id)}
                        className="text-red-500 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Calories</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(meal.totalCalories)}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Protein</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(meal.totalProtein)}g</p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Carbs</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(meal.totalCarbs)}g</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Fat</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(meal.totalFat)}g</p>
                      </div>
                    </div>

                    {meal.items && meal.items.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Items:</p>
                        {meal.items.map(item => (
                          <p key={item.id} className="text-xs text-gray-500 dark:text-gray-500">
                            • {item.productName} ({item.portionSize} {item.portionUnit})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Goals Modal */}
      {showGoalsModal && (
        <GoalsModal
          currentGoals={nutritionGoals}
          onSave={handleUpdateGoals}
          onClose={() => setShowGoalsModal(false)}
        />
      )}
    </div>
  );
};

// Goals Modal Component
const GoalsModal = ({ currentGoals, onSave, onClose }) => {
  const [goals, setGoals] = useState(currentGoals);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(goals);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Daily Goals</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Daily Calorie Goal (kcal)
            </label>
            <input
              type="number"
              value={goals.dailyCalorieGoal}
              onChange={(e) => setGoals({ ...goals, dailyCalorieGoal: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Daily Protein Goal (g)
            </label>
            <input
              type="number"
              value={goals.dailyProteinGoal}
              onChange={(e) => setGoals({ ...goals, dailyProteinGoal: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Daily Carbs Goal (g)
            </label>
            <input
              type="number"
              value={goals.dailyCarbsGoal}
              onChange={(e) => setGoals({ ...goals, dailyCarbsGoal: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Daily Fat Goal (g)
            </label>
            <input
              type="number"
              value={goals.dailyFatGoal}
              onChange={(e) => setGoals({ ...goals, dailyFatGoal: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Save Goals
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealsView;
