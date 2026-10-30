import { Recipe, PantryItem, MealPlan } from './types';

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    title: 'Mediterranean Lemon Herb Salmon',
    source_url: 'https://example.com/lemon-herb-salmon',
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
    prep_time_mins: 25,
    servings: 4,
    tags: ['Dinner', 'High-Protein', 'Pescatarian', 'Quick'],
    instructions: [
      'Preheat oven to 400°F (200°C) and line a baking sheet with parchment paper.',
      'Pat salmon fillets dry with paper towels and arrange on the baking sheet.',
      'In a small bowl, whisk together olive oil, minced garlic, lemon juice, dried oregano, salt, and black pepper.',
      'Brush mixture generously over fillets and top each with fresh lemon slices.',
      'Bake for 12-15 minutes until salmon flakes easily with a fork. Garnish with fresh dill.'
    ],
    ingredients: [
      { id: 'ing-1-1', name: 'Salmon Fillets', amount: 4, unit: 'fillet', category: 'Meat' },
      { id: 'ing-1-2', name: 'Olive Oil', amount: 2, unit: 'tbsp', category: 'Pantry' },
      { id: 'ing-1-3', name: 'Garlic Cloves', amount: 3, unit: 'clove', category: 'Produce' },
      { id: 'ing-1-4', name: 'Fresh Lemon', amount: 2, unit: 'whole', category: 'Produce' },
      { id: 'ing-1-5', name: 'Dried Oregano', amount: 1, unit: 'tsp', category: 'Spices' },
      { id: 'ing-1-6', name: 'Fresh Dill', amount: 2, unit: 'tbsp', category: 'Produce' },
      { id: 'ing-1-7', name: 'Sea Salt', amount: 0.5, unit: 'tsp', category: 'Spices' },
      { id: 'ing-1-8', name: 'Black Pepper', amount: 0.5, unit: 'tsp', category: 'Spices' },
    ]
  },
  {
    id: 'rec-2',
    title: 'Creamy Tuscan Garlic Chicken',
    source_url: 'https://example.com/creamy-tuscan-chicken',
    image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80',
    prep_time_mins: 30,
    servings: 4,
    tags: ['Dinner', 'Comfort Food', 'Keto-Friendly'],
    instructions: [
      'Season chicken breasts generously with Italian seasoning, salt, and pepper.',
      'Heat 1 tbsp olive oil in a large skillet over medium-high heat. Sear chicken 5-6 mins per side until golden; set aside.',
      'In the same skillet, melt butter and sauté minced garlic for 1 minute until fragrant.',
      'Add sun-dried tomatoes, chicken broth, heavy cream, and grated parmesan. Simmer gently for 3 minutes.',
      'Stir in fresh baby spinach until wilted. Return chicken to pan and spoon sauce over top.'
    ],
    ingredients: [
      { id: 'ing-2-1', name: 'Chicken Breasts', amount: 2, unit: 'lb', category: 'Meat' },
      { id: 'ing-2-2', name: 'Heavy Cream', amount: 1, unit: 'cup', category: 'Dairy' },
      { id: 'ing-2-3', name: 'Parmesan Cheese', amount: 0.5, unit: 'cup', category: 'Dairy' },
      { id: 'ing-2-4', name: 'Sun-Dried Tomatoes', amount: 0.5, unit: 'cup', category: 'Pantry' },
      { id: 'ing-2-5', name: 'Baby Spinach', amount: 3, unit: 'cup', category: 'Produce' },
      { id: 'ing-2-6', name: 'Garlic Cloves', amount: 4, unit: 'clove', category: 'Produce' },
      { id: 'ing-2-7', name: 'Butter', amount: 2, unit: 'tbsp', category: 'Dairy' },
      { id: 'ing-2-8', name: 'Chicken Broth', amount: 0.5, unit: 'cup', category: 'Pantry' },
    ]
  },
  {
    id: 'rec-3',
    title: 'Roasted Sweet Potato & Quinoa Bowl',
    source_url: 'https://example.com/quinoa-sweet-potato-bowl',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    prep_time_mins: 35,
    servings: 2,
    tags: ['Lunch', 'Vegetarian', 'Meal-Prep', 'High-Fiber'],
    instructions: [
      'Toss diced sweet potatoes with olive oil, cumin, and chili powder. Roast at 400°F for 25 mins.',
      'Rinse quinoa and simmer in 2 cups vegetable broth for 15 minutes until fluffy.',
      'Drain and rinse canned black beans.',
      'Whisk tahini, lemon juice, warm water, and maple syrup to create a creamy dressing.',
      'Assemble bowls: fluffy quinoa base, roasted sweet potatoes, black beans, avocado slices, and tahini drizzle.'
    ],
    ingredients: [
      { id: 'ing-3-1', name: 'Sweet Potato', amount: 2, unit: 'whole', category: 'Produce' },
      { id: 'ing-3-2', name: 'Tri-Color Quinoa', amount: 1, unit: 'cup', category: 'Pantry' },
      { id: 'ing-3-3', name: 'Black Beans', amount: 1, unit: 'can', category: 'Pantry' },
      { id: 'ing-3-4', name: 'Avocado', amount: 1, unit: 'whole', category: 'Produce' },
      { id: 'ing-3-5', name: 'Tahini', amount: 2, unit: 'tbsp', category: 'Pantry' },
      { id: 'ing-3-6', name: 'Ground Cumin', amount: 1, unit: 'tsp', category: 'Spices' },
      { id: 'ing-3-7', name: 'Chili Powder', amount: 0.5, unit: 'tsp', category: 'Spices' },
    ]
  },
  {
    id: 'rec-4',
    title: 'Overnight Chia Berry Protein Oats',
    source_url: 'https://example.com/overnight-chia-oats',
    image_url: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80',
    prep_time_mins: 10,
    servings: 2,
    tags: ['Breakfast', 'Quick & Easy', 'Meal-Prep'],
    instructions: [
      'In two mason jars or bowls, whisk rolled oats, chia seeds, and protein powder.',
      'Pour in almond milk and pure maple syrup. Stir vigorously until evenly mixed.',
      'Seal containers and refrigerate overnight (or minimum 4 hours).',
      'Top with fresh blueberries and sliced strawberries before enjoying cold.'
    ],
    ingredients: [
      { id: 'ing-4-1', name: 'Rolled Oats', amount: 1, unit: 'cup', category: 'Pantry' },
      { id: 'ing-4-2', name: 'Chia Seeds', amount: 2, unit: 'tbsp', category: 'Pantry' },
      { id: 'ing-4-3', name: 'Almond Milk', amount: 1.5, unit: 'cup', category: 'Dairy' },
      { id: 'ing-4-4', name: 'Maple Syrup', amount: 1, unit: 'tbsp', category: 'Pantry' },
      { id: 'ing-4-5', name: 'Fresh Blueberries', amount: 0.5, unit: 'cup', category: 'Produce' },
      { id: 'ing-4-6', name: 'Vanilla Protein Powder', amount: 1, unit: 'scoop', category: 'Pantry' },
    ]
  }
];

export const INITIAL_PANTRY: PantryItem[] = [
  { id: 'pan-1', item_name: 'Olive Oil', amount: 1, unit: 'bottle', category: 'Pantry' },
  { id: 'pan-2', item_name: 'Sea Salt', amount: 1, unit: 'container', category: 'Spices' },
  { id: 'pan-3', item_name: 'Black Pepper', amount: 1, unit: 'container', category: 'Spices' },
  { id: 'pan-4', item_name: 'Garlic Cloves', amount: 6, unit: 'clove', category: 'Produce' },
  { id: 'pan-5', item_name: 'Rolled Oats', amount: 2, unit: 'cup', category: 'Pantry' },
  { id: 'pan-6', item_name: 'Butter', amount: 1, unit: 'tbsp', category: 'Dairy' },
];

// Helper to get formatted dates for the current week (Monday - Sunday)
export function getCurrentWeekDates(): string[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export const getInitialMealPlans = (): MealPlan[] => {
  const dates = getCurrentWeekDates();
  return [
    {
      id: 'mp-1',
      recipe_id: 'rec-4',
      plan_date: dates[0], // Monday
      meal_type: 'breakfast',
      servings_scaled: 2,
    },
    {
      id: 'mp-2',
      recipe_id: 'rec-3',
      plan_date: dates[0], // Monday
      meal_type: 'lunch',
      servings_scaled: 2,
    },
    {
      id: 'mp-3',
      recipe_id: 'rec-1',
      plan_date: dates[0], // Monday
      meal_type: 'dinner',
      servings_scaled: 4,
    },
    {
      id: 'mp-4',
      recipe_id: 'rec-4',
      plan_date: dates[1], // Tuesday
      meal_type: 'breakfast',
      servings_scaled: 2,
    },
    {
      id: 'mp-5',
      recipe_id: 'rec-2',
      plan_date: dates[1], // Tuesday
      meal_type: 'dinner',
      servings_scaled: 4,
    },
    {
      id: 'mp-6',
      recipe_id: 'rec-1',
      plan_date: dates[3], // Thursday
      meal_type: 'dinner',
      servings_scaled: 4,
    },
  ];
};

