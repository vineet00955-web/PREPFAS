'use client';

import { Recipe, MealType } from '@/lib/types';
import { X, Clock, Users, ExternalLink, CalendarPlus, CheckCircle2, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { formatFraction } from '@/lib/utils';

interface RecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onAddToPlanner?: (recipeId: string, date: string, mealType: MealType, servings: number) => void;
}

export function RecipeModal({ recipe, onClose, onAddToPlanner }: RecipeModalProps) {
  if (!recipe) return null;

  const [scaledServings, setScaledServings] = useState<number>(recipe.servings || 4);
  const [showPlannerForm, setShowPlannerForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('dinner');
  const [planSuccess, setPlanSuccess] = useState(false);

  const scaleRatio = scaledServings / Math.max(recipe.servings || 4, 1);

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddToPlanner) {
      onAddToPlanner(recipe.id, selectedDate, selectedMealType, scaledServings);
      setPlanSuccess(true);
      setTimeout(() => {
        setPlanSuccess(false);
        setShowPlannerForm(false);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Photo & Close */}
        <div className="relative h-64 w-full bg-stone-900 flex-shrink-0">
          <img
            src={recipe.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80'}
            alt={recipe.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Metadata */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex flex-wrap gap-2 mb-2">
              {recipe.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/90 text-white shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight drop-shadow-md">
              {recipe.title}
            </h2>
          </div>
        </div>

        {/* Modal Controls Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-stone-700">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-primary" />
              <span>{recipe.prep_time_mins} minutes</span>
            </div>

            {/* Serving Scaler */}
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-stone-200 shadow-sm">
              <Users className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-stone-500">Yield:</span>
              <button
                type="button"
                onClick={() => setScaledServings((s) => Math.max(1, s - 1))}
                className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-sm"
              >
                -
              </button>
              <span className="font-bold text-stone-900 px-1 text-sm">{scaledServings}</span>
              <button
                type="button"
                onClick={() => setScaledServings((s) => s + 1)}
                className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-sm"
              >
                +
              </button>
              <span className="text-xs text-stone-500">servings</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {recipe.source_url && (
              <a
                href={recipe.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
              >
                <span>Original Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {onAddToPlanner && (
              <button
                onClick={() => setShowPlannerForm(!showPlannerForm)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm hover:bg-primary-hover transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Add to Meal Plan</span>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Form for Adding to Meal Plan */}
        {showPlannerForm && (
          <form
            onSubmit={handlePlanSubmit}
            className="bg-amber-50/70 border-b border-amber-200 p-4 px-6 flex flex-wrap items-center gap-4 transition-all"
          >
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-stone-700">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-stone-700">Meal:</label>
              <select
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                className="text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white text-stone-800 capitalize focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={planSuccess}
              className="px-4 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-black transition-colors flex items-center gap-1.5"
            >
              {planSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Scheduled!</span>
                </>
              ) : (
                <span>Confirm Slot</span>
              )}
            </button>
          </form>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* Ingredients Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <span>Ingredients</span>
                {scaleRatio !== 1 && (
                  <span className="text-xs font-normal text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Scaled from {recipe.servings} to {scaledServings} servings
                  </span>
                )}
              </h3>
              <span className="text-xs text-stone-400">
                {recipe.ingredients?.length || 0} items
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {recipe.ingredients?.map((ing, idx) => {
                const scaledAmount = ing.amount * scaleRatio;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between gap-3 text-sm hover:bg-stone-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-primary/60 flex-shrink-0" />
                      <span className="font-semibold text-stone-900">
                        {formatFraction(Number(scaledAmount.toFixed(2)))} {ing.unit}
                      </span>
                      <span className="text-stone-700">{ing.name}</span>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-200/80 text-stone-600 flex-shrink-0">
                      {ing.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions Section */}
          <div>
            <h3 className="text-lg font-bold text-stone-900 mb-4">Step-by-Step Directions</h3>
            <div className="space-y-4">
              {recipe.instructions?.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 text-stone-700 text-sm leading-relaxed">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="flex-1 pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

