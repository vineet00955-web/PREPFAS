-- ==============================================================================
-- PrepFast: Smart Recipe Vault, Interactive Meal Planner & Automated Grocery Engine
-- Database Setup Script for Supabase (PostgreSQL 15+)
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean up existing tables if resetting (safe re-run)
DROP TABLE IF EXISTS public.meal_plans CASCADE;
DROP TABLE IF EXISTS public.ingredients CASCADE;
DROP TABLE IF EXISTS public.recipes CASCADE;
DROP TABLE IF EXISTS public.pantry CASCADE;

-- 3. Utility Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. TABLE: recipes
-- Stores user's personal & imported recipes
-- ==============================================================================
CREATE TABLE public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    source_url TEXT,
    image_url TEXT,
    prep_time_mins INTEGER DEFAULT 30 CHECK (prep_time_mins >= 0),
    servings INTEGER DEFAULT 4 CHECK (servings > 0),
    tags TEXT[] DEFAULT '{}',
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX idx_recipes_created_at ON public.recipes(created_at DESC);

CREATE TRIGGER set_recipes_timestamp
BEFORE UPDATE ON public.recipes
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. TABLE: ingredients
-- Normalized ingredients belonging to a recipe with categorization
-- ==============================================================================
CREATE TABLE public.ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 1 CHECK (amount >= 0),
    unit TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL CHECK (
        category IN ('Produce', 'Dairy', 'Meat', 'Pantry', 'Spices', 'Frozen', 'Bakery', 'Beverages', 'Other')
    ) DEFAULT 'Other',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ingredients_recipe_id ON public.ingredients(recipe_id);
CREATE INDEX idx_ingredients_category ON public.ingredients(category);

-- ==============================================================================
-- 6. TABLE: meal_plans
-- Weekly calendar slots mapped to recipes and scaled servings
-- ==============================================================================
CREATE TABLE public.meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    plan_date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (
        meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')
    ),
    servings_scaled INTEGER NOT NULL DEFAULT 4 CHECK (servings_scaled > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_plans_user_date ON public.meal_plans(user_id, plan_date);
CREATE INDEX idx_meal_plans_recipe_id ON public.meal_plans(recipe_id);

-- ==============================================================================
-- 7. TABLE: pantry
-- User's current inventory to subtract from generated grocery lists
-- ==============================================================================
CREATE TABLE public.pantry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 1 CHECK (amount >= 0),
    unit TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL CHECK (
        category IN ('Produce', 'Dairy', 'Meat', 'Pantry', 'Spices', 'Frozen', 'Bakery', 'Beverages', 'Other')
    ) DEFAULT 'Pantry',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pantry_user_id ON public.pantry(user_id);
CREATE INDEX idx_pantry_item_name ON public.pantry(LOWER(item_name));

CREATE TRIGGER set_pantry_timestamp
BEFORE UPDATE ON public.pantry
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict multi-tenant isolation: users can only manage their own data
-- ==============================================================================
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry ENABLE ROW LEVEL SECURITY;

-- Recipes RLS
CREATE POLICY "Users can view their own recipes"
    ON public.recipes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipes"
    ON public.recipes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
    ON public.recipes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
    ON public.recipes FOR DELETE
    USING (auth.uid() = user_id);

-- Ingredients RLS (via Recipe ownership)
CREATE POLICY "Users can view ingredients for their recipes"
    ON public.ingredients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE recipes.id = ingredients.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert ingredients for their recipes"
    ON public.ingredients FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE recipes.id = ingredients.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update ingredients for their recipes"
    ON public.ingredients FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE recipes.id = ingredients.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete ingredients for their recipes"
    ON public.ingredients FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE recipes.id = ingredients.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

-- Meal Plans RLS
CREATE POLICY "Users can view their own meal plans"
    ON public.meal_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal plans"
    ON public.meal_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans"
    ON public.meal_plans FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans"
    ON public.meal_plans FOR DELETE
    USING (auth.uid() = user_id);

-- Pantry RLS
CREATE POLICY "Users can view their own pantry items"
    ON public.pantry FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pantry items"
    ON public.pantry FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pantry items"
    ON public.pantry FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pantry items"
    ON public.pantry FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKET CONFIGURATION (for Recipe Photos)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Read Access for Recipe Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'recipe-images');

CREATE POLICY "Authenticated Users Can Upload Recipe Images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'recipe-images'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users Can Update Their Own Uploaded Images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'recipe-images'
        AND auth.uid() = owner
    );

CREATE POLICY "Users Can Delete Their Own Uploaded Images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'recipe-images'
        AND auth.uid() = owner
    );

-- ==============================================================================
-- 10. DATABASE SEED DATA (For development & demo)
-- Note: Replace '<demo-user-uuid>' or use inside an authenticated session
-- ==============================================================================
-- Sample view or helper to calculate grocery list aggregates directly in PostgreSQL:
CREATE OR REPLACE VIEW public.grocery_aggregates_view AS
SELECT 
    mp.user_id,
    mp.plan_date,
    i.category,
    i.name AS ingredient_name,
    i.unit,
    SUM(i.amount * (mp.servings_scaled::numeric / NULLIF(r.servings, 0)::numeric)) AS total_quantity_needed
FROM public.meal_plans mp
JOIN public.recipes r ON mp.recipe_id = r.id
JOIN public.ingredients i ON r.id = i.recipe_id
GROUP BY mp.user_id, mp.plan_date, i.category, i.name, i.unit;

