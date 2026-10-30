export type AisleCategory =
  | 'Produce'
  | 'Dairy'
  | 'Meat'
  | 'Pantry'
  | 'Spices'
  | 'Frozen'
  | 'Bakery'
  | 'Beverages'
  | 'Other';

export interface Ingredient {
  id?: string;
  recipe_id?: string;
  name: string;
  amount: number;
  unit: string;
  category: AisleCategory;
}

export interface Recipe {
  id: string;
  user_id?: string;
  title: string;
  source_url?: string;
  image_url?: string;
  prep_time_mins: number;
  servings: number;
  tags: string[];
  instructions: string[];
  ingredients: Ingredient[];
  created_at?: string;
  updated_at?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealPlan {
  id: string;
  user_id?: string;
  recipe_id: string;
  plan_date: string; // YYYY-MM-DD
  meal_type: MealType;
  servings_scaled: number;
  recipe?: Recipe;
  created_at?: string;
}

export interface PantryItem {
  id: string;
  user_id?: string;
  item_name: string;
  amount: number;
  unit: string;
  category: AisleCategory;
  created_at?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  original_needed: number;
  pantry_stock: number;
  net_needed: number;
  unit: string;
  category: AisleCategory;
  recipes: string[];
  checked: boolean;
  isCustom?: boolean;
}

export interface GroceryAisleGroup {
  category: AisleCategory;
  count: number;
  items: GroceryItem[];
}

export interface ParsedRecipeResponse {
  title: string;
  source_url: string;
  image_url?: string;
  prep_time_mins: number;
  servings: number;
  tags: string[];
  ingredients: {
    name: string;
    amount: number;
    unit: string;
    category: AisleCategory;
  }[];
  instructions: string[];
}

