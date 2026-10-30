'use client';

import { useEffect, useState } from 'react';
import { INITIAL_RECIPES, INITIAL_PANTRY, getInitialMealPlans } from './initialData';
import { MealPlan, PantryItem, Recipe, MealType } from './types';
import { isSupabaseConfigured, supabase } from './supabase';

const RECIPES_KEY = 'prepfast_recipes';
const PANTRY_KEY = 'prepfast_pantry';
const MEAL_PLANS_KEY = 'prepfast_meal_plans';

// Simple pub-sub bus for multi-component reactivity
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeToStore(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Local storage helpers
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    notify();
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

// ==============================================================================
// Store Operations
// ==============================================================================

export const DataStore = {
  // Recipes
  getRecipes(): Recipe[] {
    return getLocal<Recipe[]>(RECIPES_KEY, INITIAL_RECIPES);
  },

  saveRecipe(recipe: Recipe): Recipe {
    const recipes = this.getRecipes();
    const existingIndex = recipes.findIndex((r) => r.id === recipe.id);
    let updated: Recipe[];

    if (existingIndex >= 0) {
      updated = [...recipes];
      updated[existingIndex] = { ...recipe, updated_at: new Date().toISOString() };
    } else {
      const newRec = {
        ...recipe,
        id: recipe.id || `rec-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      updated = [newRec, ...recipes];
    }

    setLocal(RECIPES_KEY, updated);

    // If Supabase configured, sync async
    if (isSupabaseConfigured() && supabase) {
      this.syncRecipeToSupabase(recipe);
    }

    return recipe;
  },

  deleteRecipe(id: string): void {
    const recipes = this.getRecipes().filter((r) => r.id !== id);
    setLocal(RECIPES_KEY, recipes);

    // Also remove from meal plans
    const plans = this.getMealPlans().filter((mp) => mp.recipe_id !== id);
    setLocal(MEAL_PLANS_KEY, plans);

    if (isSupabaseConfigured() && supabase) {
      supabase.from('recipes').delete().eq('id', id).then();
    }
  },

  async syncRecipeToSupabase(recipe: Recipe) {
    try {
      if (!supabase) return;
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      const { data, error } = await supabase.from('recipes').upsert({
        id: recipe.id.startsWith('rec-') ? undefined : recipe.id,
        user_id: user.user.id,
        title: recipe.title,
        source_url: recipe.source_url,
        image_url: recipe.image_url,
        prep_time_mins: recipe.prep_time_mins,
        servings: recipe.servings,
        tags: recipe.tags,
        instructions: recipe.instructions,
      }).select().single();

      if (error) throw error;

      if (data && recipe.ingredients) {
        // Upsert ingredients
        await supabase.from('ingredients').delete().eq('recipe_id', data.id);
        const ingsToInsert = recipe.ingredients.map((ing) => ({
          recipe_id: data.id,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: ing.category,
        }));
        await supabase.from('ingredients').insert(ingsToInsert);
      }
    } catch (err) {
      console.warn('Supabase sync skipped/failed:', err);
    }
  },

  // Meal Plans
  getMealPlans(): MealPlan[] {
    return getLocal<MealPlan[]>(MEAL_PLANS_KEY, getInitialMealPlans());
  },

  setMealSlot(recipeId: string, planDate: string, mealType: MealType, servingsScaled?: number): MealPlan {
    const plans = this.getMealPlans();
    const existingIndex = plans.findIndex(
      (p) => p.plan_date === planDate && p.meal_type === mealType
    );

    const recipes = this.getRecipes();
    const recipe = recipes.find((r) => r.id === recipeId);
    const servings = servingsScaled || (recipe ? recipe.servings : 4);

    const newPlan: MealPlan = {
      id: existingIndex >= 0 ? plans[existingIndex].id : `mp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      recipe_id: recipeId,
      plan_date: planDate,
      meal_type: mealType,
      servings_scaled: servings,
      recipe: recipe,
      created_at: new Date().toISOString(),
    };

    let updated: MealPlan[];
    if (existingIndex >= 0) {
      updated = [...plans];
      updated[existingIndex] = newPlan;
    } else {
      updated = [...plans, newPlan];
    }

    setLocal(MEAL_PLANS_KEY, updated);
    return newPlan;
  },

  updateMealPlanServings(planId: string, servings: number): void {
    const plans = this.getMealPlans().map((p) =>
      p.id === planId ? { ...p, servings_scaled: Math.max(1, servings) } : p
    );
    setLocal(MEAL_PLANS_KEY, plans);
  },

  removeMealSlot(planId: string): void {
    const plans = this.getMealPlans().filter((p) => p.id !== planId);
    setLocal(MEAL_PLANS_KEY, plans);

    if (isSupabaseConfigured() && supabase) {
      supabase.from('meal_plans').delete().eq('id', planId).then();
    }
  },

  clearAllMealPlans(): void {
    setLocal(MEAL_PLANS_KEY, []);
  },

  // Pantry
  getPantry(): PantryItem[] {
    return getLocal<PantryItem[]>(PANTRY_KEY, INITIAL_PANTRY);
  },

  addPantryItem(item: Omit<PantryItem, 'id'>): PantryItem {
    const current = this.getPantry();
    const newItem: PantryItem = {
      ...item,
      id: `pan-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...current];
    setLocal(PANTRY_KEY, updated);
    return newItem;
  },

  updatePantryItem(id: string, updates: Partial<PantryItem>): void {
    const current = this.getPantry().map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    setLocal(PANTRY_KEY, current);
  },

  deletePantryItem(id: string): void {
    const updated = this.getPantry().filter((p) => p.id !== id);
    setLocal(PANTRY_KEY, updated);
  },
};

// React hook for consuming store with real-time reactivity
export function useStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    // Subscribe to local state mutations
    const unsubscribe = subscribeToStore(() => setTick((t) => t + 1));
    return () => unsubscribe();
  }, []);

  return DataStore;
}

