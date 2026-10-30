'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Plus,
  BookOpen,
  Filter,
  Trash2,
  Clock,
  Users,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeModal } from '@/components/RecipeModal';
import { ImportRecipeModal } from '@/components/ImportRecipeModal';
import { AddRecipeModal } from '@/components/AddRecipeModal';
import { Recipe } from '@/lib/types';

export default function RecipesPage() {
  const store = useStore();
  const recipes = store.getRecipes();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => r.tags?.forEach((t) => set.add(t)));
    return ['All', ...Array.from(set)];
  }, [recipes]);

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === 'All' || (r.tags && r.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [recipes, searchQuery, selectedTag]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-primary" />
            <span>Recipe Vault</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Organize, import from the web, scale servings, and store your culinary favorites.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Import from URL</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 text-stone-600" />
            <span>New Recipe</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by recipe title or ingredient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-stone-50/50"
            />
          </div>
        </div>

        {/* Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          <span className="text-xs font-semibold text-stone-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Tags:</span>
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-stone-900 text-white font-semibold shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-dashed border-stone-300">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-stone-800 font-bold text-base">No recipes found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search query or import a recipe using a web link.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('All');
            }}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={(r) => setSelectedRecipe(r)}
              onPlan={() => setSelectedRecipe(recipe)}
              onDelete={(id) => store.deleteRecipe(id)}
            />
          ))}
        </div>
      )}

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

