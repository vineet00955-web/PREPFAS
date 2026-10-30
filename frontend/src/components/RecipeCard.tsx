'use client';

import { Recipe } from '@/lib/types';
import { Clock, Users, ExternalLink, CalendarPlus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface RecipeCardProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
  onPlan?: (recipe: Recipe) => void;
  onDelete?: (recipeId: string) => void;
}

export function RecipeCard({ recipe, onView, onPlan, onDelete }: RecipeCardProps) {
  const [imgError, setImgError] = useState(false);

  const fallbackImage =
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-subtle hover:shadow-lift transition-all duration-300 flex flex-col overflow-hidden">
      {/* Recipe Photo */}
      <div
        className="relative h-48 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden cursor-pointer"
        onClick={() => onView(recipe)}
      >
        <img
          src={imgError || !recipe.image_url ? fallbackImage : recipe.image_url}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Badges on top */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-stone-900/90 text-stone-800 dark:text-stone-200 backdrop-blur-md shadow-sm">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {recipe.prep_time_mins} mins
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-stone-900/90 text-stone-800 dark:text-stone-200 backdrop-blur-md shadow-sm">
            <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            {recipe.servings} srv
          </span>
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 2).map((t, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/60 text-white backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onView(recipe)}
            className="font-bold text-stone-900 dark:text-stone-100 text-base leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer"
            title={recipe.title}
          >
            {recipe.title}
          </h3>

          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
            <span>{recipe.ingredients?.length || 0} ingredients</span>
            <span>•</span>
            <span>{recipe.instructions?.length || 0} steps</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
          <button
            onClick={() => onView(recipe)}
            className="text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white py-1.5 px-2.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Details
          </button>

          <div className="flex items-center gap-1.5">
            {onPlan && (
              <button
                onClick={() => onPlan(recipe)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-white bg-primary/10 hover:bg-primary dark:bg-primary/20 dark:hover:bg-primary py-1.5 px-3 rounded-lg transition-all"
                title="Schedule into Meal Planner"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Plan</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(recipe.id)}
                className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                title="Delete Recipe"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
