-- Meal Tracking Feature Database Schema

-- Table for user's saved meals (up to 5 per user)
CREATE TABLE IF NOT EXISTS saved_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  total_calories NUMERIC(10, 2) DEFAULT 0,
  total_protein NUMERIC(10, 2) DEFAULT 0,
  total_carbs NUMERIC(10, 2) DEFAULT 0,
  total_fat NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for items within saved meals
CREATE TABLE IF NOT EXISTS saved_meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES saved_meals(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  barcode TEXT,
  portion_size NUMERIC(10, 2) NOT NULL, -- in grams or ml
  portion_unit TEXT NOT NULL DEFAULT 'g', -- g, ml, piece, spoon, package, etc.
  calories NUMERIC(10, 2),
  protein NUMERIC(10, 2),
  carbs NUMERIC(10, 2),
  fat NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for daily menu entries
CREATE TABLE IF NOT EXISTS daily_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'snack_morning', 'lunch', 'snack_afternoon', 'dinner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, menu_date, meal_type, id)
);

-- Table for items in daily menu (can be individual items or saved meals)
CREATE TABLE IF NOT EXISTS daily_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_menu_id UUID NOT NULL REFERENCES daily_menu(id) ON DELETE CASCADE,
  saved_meal_id UUID REFERENCES saved_meals(id) ON DELETE SET NULL, -- if from saved meal
  product_name TEXT NOT NULL,
  barcode TEXT,
  portion_size NUMERIC(10, 2) NOT NULL,
  portion_unit TEXT NOT NULL DEFAULT 'g',
  calories NUMERIC(10, 2),
  protein NUMERIC(10, 2),
  carbs NUMERIC(10, 2),
  fat NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for user's daily calorie goals
CREATE TABLE IF NOT EXISTS user_nutrition_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_calorie_goal NUMERIC(10, 2) NOT NULL DEFAULT 2000,
  daily_protein_goal NUMERIC(10, 2) DEFAULT 150,
  daily_carbs_goal NUMERIC(10, 2) DEFAULT 250,
  daily_fat_goal NUMERIC(10, 2) DEFAULT 65,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_meals_user ON saved_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_menu_user_date ON daily_menu(user_id, menu_date);
CREATE INDEX IF NOT EXISTS idx_daily_menu_items_menu ON daily_menu_items(daily_menu_id);

-- Enable Row Level Security
ALTER TABLE saved_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_meals
CREATE POLICY "Users can view own saved meals" ON saved_meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved meals" ON saved_meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved meals" ON saved_meals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved meals" ON saved_meals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for saved_meal_items
CREATE POLICY "Users can view own saved meal items" ON saved_meal_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM saved_meals WHERE saved_meals.id = saved_meal_items.meal_id AND saved_meals.user_id = auth.uid())
  );

CREATE POLICY "Users can create own saved meal items" ON saved_meal_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM saved_meals WHERE saved_meals.id = saved_meal_items.meal_id AND saved_meals.user_id = auth.uid())
  );

CREATE POLICY "Users can update own saved meal items" ON saved_meal_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM saved_meals WHERE saved_meals.id = saved_meal_items.meal_id AND saved_meals.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own saved meal items" ON saved_meal_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM saved_meals WHERE saved_meals.id = saved_meal_items.meal_id AND saved_meals.user_id = auth.uid())
  );

-- RLS Policies for daily_menu
CREATE POLICY "Users can view own daily menu" ON daily_menu
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own daily menu" ON daily_menu
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily menu" ON daily_menu
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily menu" ON daily_menu
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_menu_items
CREATE POLICY "Users can view own daily menu items" ON daily_menu_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM daily_menu WHERE daily_menu.id = daily_menu_items.daily_menu_id AND daily_menu.user_id = auth.uid())
  );

CREATE POLICY "Users can create own daily menu items" ON daily_menu_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM daily_menu WHERE daily_menu.id = daily_menu_items.daily_menu_id AND daily_menu.user_id = auth.uid())
  );

CREATE POLICY "Users can update own daily menu items" ON daily_menu_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM daily_menu WHERE daily_menu.id = daily_menu_items.daily_menu_id AND daily_menu.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own daily menu items" ON daily_menu_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM daily_menu WHERE daily_menu.id = daily_menu_items.daily_menu_id AND daily_menu.user_id = auth.uid())
  );

-- RLS Policies for user_nutrition_goals
CREATE POLICY "Users can view own nutrition goals" ON user_nutrition_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own nutrition goals" ON user_nutrition_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition goals" ON user_nutrition_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition goals" ON user_nutrition_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger function to enforce 5-meal limit per user
CREATE OR REPLACE FUNCTION check_saved_meals_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM saved_meals WHERE user_id = NEW.user_id) >= 5 THEN
    RAISE EXCEPTION 'Maximum 5 saved meals allowed per user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS enforce_saved_meals_limit ON saved_meals;
CREATE TRIGGER enforce_saved_meals_limit
  BEFORE INSERT ON saved_meals
  FOR EACH ROW
  EXECUTE FUNCTION check_saved_meals_limit();
