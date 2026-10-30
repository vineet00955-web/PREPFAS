'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CalendarDays,
  ShoppingCart,
  Boxes,
  ArrowRight,
  Plus,
  Sparkles,
  Utensils,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeModal } from '@/components/RecipeModal';
import { ImportRecipeModal } from '@/components/ImportRecipeModal';
import { AddRecipeModal } from '@/components/AddRecipeModal';
import { Recipe } from '@/lib/types';
import { computeClientGroceryList } from '@/lib/api';

export default function DashboardPage() {
  const store = useStore();
  const recipes = store.getRecipes();
  const mealPlans = store.getMealPlans();
  const pantry = store.getPantry();

  // Active modals
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Compute stats
  const todayIso = new Date().toISOString().split('T')[0];
  const todayMeals = mealPlans.filter((mp) => mp.plan_date === todayIso);
  const grocerySummary = computeClientGroceryList(mealPlans, recipes, pantry, true);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-8 lg:p-10 overflow-hidden shadow-xl border border-stone-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary-light border border-primary/30">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Smart Culinary Engine Ready</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
            Plan effortlessly. <br className="hidden sm:inline" />
            Cook deliciously with <span className="text-primary">EXTEP</span>.
          </h1>

          <p className="text-stone-300 text-sm lg:text-base leading-relaxed">
            Import recipes with one click, drag your weekly menu across days, and let our engine
            generate a categorized supermarket checklist automatically deducting what is in your pantry.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Import via URL</span>
            </button>

            <Link
              href="/planner"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-semibold border border-stone-700 transition-colors"
            >
              <CalendarDays className="w-4 h-4 text-amber-500" />
              <span>Open Meal Planner</span>
            </Link>

            <Link
              href="/grocery-list"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-semibold border border-stone-700 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>View Grocery List</span>
            </Link>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none rounded-r-3xl" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/recipes"
          className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-subtle hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Saved Recipes
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">{recipes.length}</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">in vault</span>
          </div>
        </Link>

        <Link
          href="/planner"
          className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-subtle hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Planned Meals
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">{mealPlans.length}</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">scheduled</span>
          </div>
        </Link>

        <Link
          href="/grocery-list"
          className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-subtle hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Groceries Needed
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">
              {grocerySummary.total_items_count}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">net items</span>
          </div>
        </Link>

        <Link
          href="/pantry"
          className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-subtle hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Pantry Inventory
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">{pantry.length}</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">stocked items</span>
          </div>
        </Link>
      </div>

      {/* Today's Meals Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-subtle">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" />
              <span>Today&apos;s Menu</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          <Link
            href="/planner"
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
          >
            <span>Full Week Planner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {todayMeals.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-stone-50 dark:bg-stone-850/60 border border-dashed border-stone-300 dark:border-stone-750">
            <CalendarDays className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <p className="text-stone-700 dark:text-stone-300 font-semibold text-sm">No meals scheduled for today yet</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1 mb-4">
              Drag recipes into today&apos;s slots in the meal planner to automatically aggregate your ingredients.
            </p>
            <Link
              href="/planner"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white text-xs font-semibold hover:bg-black dark:hover:bg-stone-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Today&apos;s Meals</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
              const meal = todayMeals.find((m) => m.meal_type === type);
              const recipe = meal ? recipes.find((r) => r.id === meal.recipe_id) : null;

              return (
                <div
                  key={type}
                  className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/50 flex flex-col justify-between"
                >
                  <span className="text-[11px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider capitalize">
                    {type}
                  </span>

                  {recipe ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            onClick={() => setSelectedRecipe(recipe)}
                            className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate hover:text-primary cursor-pointer"
                          >
                            {recipe.title}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            {meal?.servings_scaled} servings • {recipe.prep_time_mins}m
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <Link
                        href="/planner"
                        className="text-xs text-stone-500 dark:text-stone-400 hover:text-primary flex items-center gap-1 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add {type}</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Featured Recipe Vault Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Your Recipe Vault</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">Favorites & recently saved recipes</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-xs font-semibold text-stone-700 dark:text-stone-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom</span>
            </button>

            <Link
              href="/recipes"
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 ml-2"
            >
              <span>View All ({recipes.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recipes.slice(0, 4).map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={(r) => setSelectedRecipe(r)}
              onPlan={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <RecipeModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onAddToPlanner={(recipeId, date, mealType, servings) => {
          store.setMealSlot(recipeId, date, mealType, servings);
        }}
      />

      <ImportRecipeModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSave={(newRecipe) => store.saveRecipe(newRecipe)}
      />

      <AddRecipeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(newRecipe) => store.saveRecipe(newRecipe)}
      />
    </div>
  );
}
