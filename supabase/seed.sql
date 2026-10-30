-- ==============================================================================
-- PrepFast: Sample Seed Data
-- Run this in Supabase SQL Editor after running schema.sql
-- (Uses auth.uid() or current user id)
-- ==============================================================================

DO $$
DECLARE
    current_uid UUID;
    r1_id UUID := gen_random_uuid();
    r2_id UUID := gen_random_uuid();
    r3_id UUID := gen_random_uuid();
    r4_id UUID := gen_random_uuid();
BEGIN
    -- Try to grab the first user in auth.users, or generate a placeholder
    SELECT id INTO current_uid FROM auth.users LIMIT 1;
    IF current_uid IS NULL THEN
        current_uid := '00000000-0000-0000-0000-000000000000'::uuid;
    END IF;

    -- Recipe 1: Mediterranean Lemon Herb Salmon
    INSERT INTO public.recipes (id, user_id, title, source_url, image_url, prep_time_mins, servings, tags, instructions)
    VALUES (
        r1_id,
        current_uid,
        'Mediterranean Lemon Herb Salmon',
        'https://example.com/lemon-herb-salmon',
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
        25,
        4,
        ARRAY['Dinner', 'High-Protein', 'Pescatarian', 'Quick'],
        '["Preheat oven to 400°F (200°C) and line a baking sheet with parchment paper.", "Pat salmon fillets dry with paper towels and arrange on the baking sheet.", "In a small bowl, whisk together olive oil, minced garlic, lemon juice, dried oregano, salt, and black pepper.", "Brush mixture generously over fillets and top each with lemon slices.", "Bake for 12-15 minutes until salmon flakes easily with a fork. Garnish with fresh dill."]'::jsonb
    );

    INSERT INTO public.ingredients (recipe_id, name, amount, unit, category) VALUES
        (r1_id, 'Salmon Fillets', 4, 'fillet', 'Meat'),
        (r1_id, 'Olive Oil', 2, 'tbsp', 'Pantry'),
        (r1_id, 'Garlic Cloves', 3, 'clove', 'Produce'),
        (r1_id, 'Fresh Lemon', 2, 'whole', 'Produce'),
        (r1_id, 'Dried Oregano', 1, 'tsp', 'Spices'),
        (r1_id, 'Fresh Dill', 2, 'tbsp', 'Produce'),
        (r1_id, 'Sea Salt', 0.5, 'tsp', 'Spices'),
        (r1_id, 'Black Pepper', 0.5, 'tsp', 'Spices');

    -- Recipe 2: Creamy Tuscan Garlic Chicken
    INSERT INTO public.recipes (id, user_id, title, source_url, image_url, prep_time_mins, servings, tags, instructions)
    VALUES (
        r2_id,
        current_uid,
        'Creamy Tuscan Garlic Chicken',
        'https://example.com/creamy-tuscan-chicken',
        'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80',
        30,
        4,
        ARRAY['Dinner', 'Comfort Food', 'Keto-Friendly'],
        '["Season chicken breasts with Italian seasoning, salt, and pepper.", "Heat 1 tbsp olive oil in a large skillet over medium-high heat. Sear chicken 5-6 mins per side until golden; remove and set aside.", "In the same pan, melt butter and sauté minced garlic for 1 minute.", "Add sun-dried tomatoes, chicken broth, heavy cream, and grated parmesan. Simmer for 3 minutes.", "Stir in fresh baby spinach until wilted. Return chicken to pan and spoon sauce over chicken."]'::jsonb
    );

    INSERT INTO public.ingredients (recipe_id, name, amount, unit, category) VALUES
        (r2_id, 'Chicken Breasts', 2, 'lb', 'Meat'),
        (r2_id, 'Heavy Cream', 1, 'cup', 'Dairy'),
        (r2_id, 'Parmesan Cheese', 0.5, 'cup', 'Dairy'),
        (r2_id, 'Sun-Dried Tomatoes', 0.5, 'cup', 'Pantry'),
        (r2_id, 'Baby Spinach', 3, 'cup', 'Produce'),
        (r2_id, 'Garlic Cloves', 4, 'clove', 'Produce'),
        (r2_id, 'Butter', 2, 'tbsp', 'Dairy'),
        (r2_id, 'Chicken Broth', 0.5, 'cup', 'Pantry');

    -- Recipe 3: Roasted Sweet Potato & Quinoa Bowl
    INSERT INTO public.recipes (id, user_id, title, source_url, image_url, prep_time_mins, servings, tags, instructions)
    VALUES (
        r3_id,
        current_uid,
        'Roasted Sweet Potato & Quinoa Bowl',
        'https://example.com/quinoa-sweet-potato-bowl',
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
        35,
        2,
        ARRAY['Lunch', 'Vegetarian', 'Meal-Prep', 'High-Fiber'],
        '["Toss diced sweet potatoes with 1 tbsp olive oil, cumin, and chili powder. Roast at 400°F for 25 mins.", "Rinse quinoa and cook in 2 cups vegetable broth for 15 minutes.", "Drain and rinse canned black beans.", "Whisk tahini, lemon juice, warm water, and maple syrup for dressing.", "Assemble bowls: quinoa base, roasted sweet potato, black beans, avocado slices, and drizzle tahini dressing."]'::jsonb
    );

    INSERT INTO public.ingredients (recipe_id, name, amount, unit, category) VALUES
        (r3_id, 'Sweet Potato', 2, 'medium', 'Produce'),
        (r3_id, 'Tri-Color Quinoa', 1, 'cup', 'Pantry'),
        (r3_id, 'Black Beans', 1, 'can', 'Pantry'),
        (r3_id, 'Avocado', 1, 'whole', 'Produce'),
        (r3_id, 'Tahini', 2, 'tbsp', 'Pantry'),
        (r3_id, 'Ground Cumin', 1, 'tsp', 'Spices'),
        (r3_id, 'Chili Powder', 0.5, 'tsp', 'Spices');

    -- Recipe 4: Overnight Chia Berry Protein Oats
    INSERT INTO public.recipes (id, user_id, title, source_url, image_url, prep_time_mins, servings, tags, instructions)
    VALUES (
        r4_id,
        current_uid,
        'Overnight Chia Berry Protein Oats',
        'https://example.com/overnight-chia-oats',
        'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80',
        10,
        2,
        ARRAY['Breakfast', 'Quick & Easy', 'Meal-Prep'],
        '["In two mason jars, combine rolled oats, chia seeds, and protein powder.", "Pour almond milk and pure maple syrup into jars. Stir vigorously until no powder clumps remain.", "Seal jars and refrigerate overnight or for at least 4 hours.", "Top with fresh blueberries and sliced strawberries before serving."]'::jsonb
    );

    INSERT INTO public.ingredients (recipe_id, name, amount, unit, category) VALUES
        (r4_id, 'Rolled Oats', 1, 'cup', 'Pantry'),
        (r4_id, 'Chia Seeds', 2, 'tbsp', 'Pantry'),
        (r4_id, 'Almond Milk', 1.5, 'cup', 'Dairy'),
        (r4_id, 'Maple Syrup', 1, 'tbsp', 'Pantry'),
        (r4_id, 'Blueberries', 0.5, 'cup', 'Produce'),
        (r4_id, 'Vanilla Protein Powder', 1, 'scoop', 'Pantry');

    -- Seed Pantry items
    INSERT INTO public.pantry (user_id, item_name, amount, unit, category) VALUES
        (current_uid, 'Olive Oil', 1, 'bottle', 'Pantry'),
        (current_uid, 'Sea Salt', 1, 'container', 'Spices'),
        (current_uid, 'Black Pepper', 1, 'container', 'Spices'),
        (current_uid, 'Garlic Cloves', 6, 'clove', 'Produce'),
        (current_uid, 'Rolled Oats', 2, 'cup', 'Pantry');

    -- Seed Weekly Meal Plan
    INSERT INTO public.meal_plans (user_id, recipe_id, plan_date, meal_type, servings_scaled) VALUES
        (current_uid, r4_id, CURRENT_DATE, 'breakfast', 2),
        (current_uid, r3_id, CURRENT_DATE, 'lunch', 2),
        (current_uid, r1_id, CURRENT_DATE, 'dinner', 4),
        (current_uid, r4_id, CURRENT_DATE + 1, 'breakfast', 2),
        (current_uid, r2_id, CURRENT_DATE + 1, 'dinner', 4);

END $$;

