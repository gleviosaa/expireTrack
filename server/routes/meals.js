import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ============================================================================
// SAVED MEALS ROUTES
// ============================================================================

// Get all saved meals for user
router.get('/saved', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching saved meals for user:', req.user.id);

    const { data: meals, error } = await supabase
      .from('saved_meals')
      .select(`
        *,
        saved_meal_items (*)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching saved meals:', error);
      return res.status(500).json({ error: error.message });
    }

    // Transform to camelCase
    const transformedMeals = (meals || []).map(meal => ({
      id: meal.id,
      userId: meal.user_id,
      name: meal.name,
      description: meal.description,
      totalCalories: parseFloat(meal.total_calories) || 0,
      totalProtein: parseFloat(meal.total_protein) || 0,
      totalCarbs: parseFloat(meal.total_carbs) || 0,
      totalFat: parseFloat(meal.total_fat) || 0,
      createdAt: meal.created_at,
      updatedAt: meal.updated_at,
      items: (meal.saved_meal_items || []).map(item => ({
        id: item.id,
        mealId: item.meal_id,
        productName: item.product_name,
        barcode: item.barcode,
        portionSize: parseFloat(item.portion_size),
        portionUnit: item.portion_unit,
        calories: parseFloat(item.calories) || 0,
        protein: parseFloat(item.protein) || 0,
        carbs: parseFloat(item.carbs) || 0,
        fat: parseFloat(item.fat) || 0,
        createdAt: item.created_at
      }))
    }));

    console.log('✅ Fetched', transformedMeals.length, 'saved meals');
    res.json(transformedMeals);
  } catch (err) {
    console.error('❌ Error in GET /saved:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new saved meal
router.post('/saved', authenticateToken, async (req, res) => {
  try {
    const { name, description, items } = req.body;
    console.log('📝 Creating saved meal:', name);

    // Check meal limit
    const { count } = await supabase
      .from('saved_meals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    if (count >= 5) {
      return res.status(400).json({ error: 'Maximum 5 saved meals allowed per user' });
    }

    // Calculate totals from items
    const totals = items.reduce((acc, item) => ({
      calories: acc.calories + (parseFloat(item.calories) || 0),
      protein: acc.protein + (parseFloat(item.protein) || 0),
      carbs: acc.carbs + (parseFloat(item.carbs) || 0),
      fat: acc.fat + (parseFloat(item.fat) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Create meal
    const { data: meal, error: mealError } = await supabase
      .from('saved_meals')
      .insert({
        user_id: req.user.id,
        name,
        description,
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fat: totals.fat
      })
      .select()
      .single();

    if (mealError) {
      console.error('❌ Error creating meal:', mealError);
      return res.status(500).json({ error: mealError.message });
    }

    // Create meal items
    if (items && items.length > 0) {
      const mealItems = items.map(item => ({
        meal_id: meal.id,
        product_name: item.productName,
        barcode: item.barcode,
        portion_size: item.portionSize,
        portion_unit: item.portionUnit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat
      }));

      const { error: itemsError } = await supabase
        .from('saved_meal_items')
        .insert(mealItems);

      if (itemsError) {
        console.error('❌ Error creating meal items:', itemsError);
        return res.status(500).json({ error: itemsError.message });
      }
    }

    console.log('✅ Created saved meal:', meal.id);
    res.status(201).json({
      id: meal.id,
      userId: meal.user_id,
      name: meal.name,
      description: meal.description,
      totalCalories: parseFloat(meal.total_calories),
      totalProtein: parseFloat(meal.total_protein),
      totalCarbs: parseFloat(meal.total_carbs),
      totalFat: parseFloat(meal.total_fat),
      createdAt: meal.created_at
    });
  } catch (err) {
    console.error('❌ Error in POST /saved:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete saved meal
router.delete('/saved/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting saved meal:', id);

    const { error } = await supabase
      .from('saved_meals')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('❌ Error deleting meal:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Deleted saved meal:', id);
    res.json({ message: 'Meal deleted successfully' });
  } catch (err) {
    console.error('❌ Error in DELETE /saved/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// DAILY MENU ROUTES
// ============================================================================

// Get daily menu for specific date
router.get('/daily/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    console.log('📋 Fetching daily menu for:', date);

    const { data: menuEntries, error } = await supabase
      .from('daily_menu')
      .select(`
        *,
        daily_menu_items (*)
      `)
      .eq('user_id', req.user.id)
      .eq('menu_date', date);

    if (error) {
      console.error('❌ Error fetching daily menu:', error);
      return res.status(500).json({ error: error.message });
    }

    // Transform to camelCase and group by meal type
    const transformedMenu = (menuEntries || []).map(entry => ({
      id: entry.id,
      userId: entry.user_id,
      menuDate: entry.menu_date,
      mealType: entry.meal_type,
      createdAt: entry.created_at,
      items: (entry.daily_menu_items || []).map(item => ({
        id: item.id,
        dailyMenuId: item.daily_menu_id,
        savedMealId: item.saved_meal_id,
        productName: item.product_name,
        barcode: item.barcode,
        portionSize: parseFloat(item.portion_size),
        portionUnit: item.portion_unit,
        calories: parseFloat(item.calories) || 0,
        protein: parseFloat(item.protein) || 0,
        carbs: parseFloat(item.carbs) || 0,
        fat: parseFloat(item.fat) || 0,
        createdAt: item.created_at
      }))
    }));

    console.log('✅ Fetched daily menu with', transformedMenu.length, 'meal entries');
    res.json(transformedMenu);
  } catch (err) {
    console.error('❌ Error in GET /daily/:date:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add item to daily menu
router.post('/daily', authenticateToken, async (req, res) => {
  try {
    const { menuDate, mealType, items } = req.body;
    console.log('📝 Adding items to daily menu:', mealType, 'on', menuDate);

    // Find or create daily menu entry
    let { data: menuEntry, error: findError } = await supabase
      .from('daily_menu')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('menu_date', menuDate)
      .eq('meal_type', mealType)
      .maybeSingle();

    if (findError) {
      console.error('❌ Error finding menu entry:', findError);
      return res.status(500).json({ error: findError.message });
    }

    // Create menu entry if it doesn't exist
    if (!menuEntry) {
      const { data: newEntry, error: createError } = await supabase
        .from('daily_menu')
        .insert({
          user_id: req.user.id,
          menu_date: menuDate,
          meal_type: mealType
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating menu entry:', createError);
        return res.status(500).json({ error: createError.message });
      }

      menuEntry = newEntry;
    }

    // Add items to menu
    const menuItems = items.map(item => ({
      daily_menu_id: menuEntry.id,
      saved_meal_id: item.savedMealId || null,
      product_name: item.productName,
      barcode: item.barcode,
      portion_size: item.portionSize,
      portion_unit: item.portionUnit,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from('daily_menu_items')
      .insert(menuItems)
      .select();

    if (itemsError) {
      console.error('❌ Error creating menu items:', itemsError);
      return res.status(500).json({ error: itemsError.message });
    }

    console.log('✅ Added', createdItems.length, 'items to daily menu');
    res.status(201).json({
      id: menuEntry.id,
      menuDate: menuEntry.menu_date,
      mealType: menuEntry.meal_type,
      items: createdItems.map(item => ({
        id: item.id,
        productName: item.product_name,
        portionSize: parseFloat(item.portion_size),
        portionUnit: item.portion_unit,
        calories: parseFloat(item.calories) || 0,
        protein: parseFloat(item.protein) || 0,
        carbs: parseFloat(item.carbs) || 0,
        fat: parseFloat(item.fat) || 0
      }))
    });
  } catch (err) {
    console.error('❌ Error in POST /daily:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete item from daily menu
router.delete('/daily/item/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting daily menu item:', id);

    // Verify ownership through daily_menu
    const { data: item } = await supabase
      .from('daily_menu_items')
      .select('daily_menu_id, daily_menu!inner(user_id)')
      .eq('id', id)
      .single();

    if (!item || item.daily_menu.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from('daily_menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting menu item:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Deleted daily menu item:', id);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('❌ Error in DELETE /daily/item/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// NUTRITION GOALS ROUTES
// ============================================================================

// Get user's nutrition goals
router.get('/goals', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching nutrition goals for user:', req.user.id);

    const { data: goals, error } = await supabase
      .from('user_nutrition_goals')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching goals:', error);
      return res.status(500).json({ error: error.message });
    }

    // Return default goals if none set
    if (!goals) {
      return res.json({
        dailyCalorieGoal: 2000,
        dailyProteinGoal: 150,
        dailyCarbsGoal: 250,
        dailyFatGoal: 65
      });
    }

    res.json({
      id: goals.id,
      userId: goals.user_id,
      dailyCalorieGoal: parseFloat(goals.daily_calorie_goal),
      dailyProteinGoal: parseFloat(goals.daily_protein_goal),
      dailyCarbsGoal: parseFloat(goals.daily_carbs_goal),
      dailyFatGoal: parseFloat(goals.daily_fat_goal),
      createdAt: goals.created_at,
      updatedAt: goals.updated_at
    });
  } catch (err) {
    console.error('❌ Error in GET /goals:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update nutrition goals
router.put('/goals', authenticateToken, async (req, res) => {
  try {
    const { dailyCalorieGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatGoal } = req.body;
    console.log('📝 Updating nutrition goals for user:', req.user.id);

    const { data: goals, error } = await supabase
      .from('user_nutrition_goals')
      .upsert({
        user_id: req.user.id,
        daily_calorie_goal: dailyCalorieGoal,
        daily_protein_goal: dailyProteinGoal,
        daily_carbs_goal: dailyCarbsGoal,
        daily_fat_goal: dailyFatGoal,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating goals:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Updated nutrition goals');
    res.json({
      id: goals.id,
      userId: goals.user_id,
      dailyCalorieGoal: parseFloat(goals.daily_calorie_goal),
      dailyProteinGoal: parseFloat(goals.daily_protein_goal),
      dailyCarbsGoal: parseFloat(goals.daily_carbs_goal),
      dailyFatGoal: parseFloat(goals.daily_fat_goal),
      updatedAt: goals.updated_at
    });
  } catch (err) {
    console.error('❌ Error in PUT /goals:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
