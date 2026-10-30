'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Users,
  ShoppingCart,
  GripVertical,
  Clock,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { MealPlan, MealType, Recipe } from '@/lib/types';
import { formatDateLabel } from '@/lib/utils';
import { RecipeModal } from '@/components/RecipeModal';

const MEAL_TYPES: { type: MealType; label: string; icon: string }[] = [
  { type: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { type: 'lunch', label: 'Lunch', icon: '☀️' },
  { type: 'dinner', label: 'Dinner', icon: '🌙' },
  { type: 'snack', label: 'Snack', icon: '🍎' },
];

export default function MealPlannerPage() {
  const store = useStore();
  const recipes = store.getRecipes();
  const mealPlans = store.getMealPlans();

  // Week offset state (0 = current week, 1 = next week, -1 = last week)
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeSearch, setRecipeSearch] = useState('');

  // Quick Add Slot Modal state (for mobile / click support)
  const [quickAddSlot, setQuickAddSlot] = useState<{ date: string; mealType: MealType } | null>(null);

  // Compute 7 days for the selected week
  const weekDates = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday + weekOffset * 7);

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [weekOffset]);

  // Filter recipes for sidebar
  const filteredRecipes = useMemo(() => {
    if (!recipeSearch.trim()) return recipes;
    return recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(recipeSearch.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(recipeSearch.toLowerCase()))
    );
  }, [recipes, recipeSearch]);

  // Handle Drag & Drop Drop Event
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // Check if dragging from recipes sidebar into a slot
    if (source.droppableId === 'recipes-sidebar') {
      const recipeId = draggableId.replace('recipe-', '');
      const [destDate, destMealType] = destination.droppableId.split('::');

      if (destDate && destMealType) {
        const targetRecipe = recipes.find((r) => r.id === recipeId);
        store.setMealSlot(
          recipeId,
          destDate,
          destMealType as MealType,
          targetRecipe?.servings || 4
        );
      }
    }
  };

  const handleQuickAdd = (recipeId: string) => {
    if (!quickAddSlot) return;
    const targetRecipe = recipes.find((r) => r.id === recipeId);
    store.setMealSlot(
      recipeId,
      quickAddSlot.date,
      quickAddSlot.mealType,
      targetRecipe?.servings || 4
    );
    setQuickAddSlot(null);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6">
        {/* Top Header & Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-subtle">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2.5">
              <CalendarDays className="w-7 h-7 text-primary" />
              <span>Interactive Meal Planner</span>
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-0.5">
              Drag recipes from the sidebar into slots. Adjust servings on each meal card.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Week Switcher */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className="px-3 py-1 rounded-lg text-xs font-semibold hover:bg-white dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors"
              >
                {weekOffset === 0 ? 'Current Week' : `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`}
              </button>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Grocery CTA */}
            <Link
              href="/grocery-list"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Generate Grocery List</span>
            </Link>
          </div>
        </div>

        {/* Main Grid & Draggable Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Draggable Recipe Drawer */}
          <div className="w-full lg:w-72 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-subtle p-4 flex-shrink-0 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Drag Recipes</span>
              </h3>
              <span className="text-[11px] font-semibold text-stone-400">
                {recipes.length} available
              </span>
            </div>

            <input
              type="text"
              placeholder="Search recipes..."
              value={recipeSearch}
              onChange={(e) => setRecipeSearch(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs mb-3 focus:outline-none focus:ring-1 focus:ring-primary bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            />

            <Droppable droppableId="recipes-sidebar" isDropDisabled={true}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-[300px]"
                >
                  {filteredRecipes.map((recipe, index) => (
                    <Draggable
                      key={recipe.id}
                      draggableId={`recipe-${recipe.id}`}
                      index={index}
                    >
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className={`p-2.5 rounded-xl border transition-all select-none cursor-grab active:cursor-grabbing ${
                            dragSnapshot.isDragging
                              ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-400 shadow-xl ring-2 ring-amber-400 scale-105 z-50'
                              : 'bg-stone-50/80 dark:bg-stone-800/60 hover:bg-white dark:hover:bg-stone-800 border-stone-200 dark:border-stone-750 hover:border-stone-300 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <GripVertical className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                            <img
                              src={recipe.image_url}
                              alt={recipe.title}
                              className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                                {recipe.title}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                                <span>{recipe.prep_time_mins}m</span>
                                <span>•</span>
                                <span>{recipe.servings} srv</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* 7-Day Calendar Grid Canvas */}
          <div className="flex-1 w-full overflow-x-auto pb-4">
            <div className="min-w-[900px] grid grid-cols-7 gap-3">
              {weekDates.map((dateStr) => {
                const { dayName, formattedDate, isToday } = formatDateLabel(dateStr);
                return (
                  <div key={dateStr} className="flex flex-col space-y-2.5">
                    {/* Day Column Header */}
                    <div
                      className={`p-3 rounded-2xl text-center border transition-all ${
                        isToday
                          ? 'bg-primary text-white border-primary shadow-md font-bold'
                          : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-800 shadow-subtle'
                      }`}
                    >
                      <div className="text-xs font-bold uppercase tracking-wider">{dayName}</div>
                      <div className={`text-sm mt-0.5 ${isToday ? 'text-white' : 'text-stone-500 dark:text-stone-400 font-medium'}`}>
                        {formattedDate}
                      </div>
                    </div>

                    {/* Meal Slots (Breakfast, Lunch, Dinner, Snack) */}
                    <div className="space-y-2.5">
                      {MEAL_TYPES.map(({ type, label, icon }) => {
                        const slotId = `${dateStr}::${type}`;
                        const currentPlan = mealPlans.find(
                          (mp) => mp.plan_date === dateStr && mp.meal_type === type
                        );
                        const assignedRecipe = currentPlan
                          ? recipes.find((r) => r.id === currentPlan.recipe_id)
                          : null;

                        return (
                          <Droppable key={slotId} droppableId={slotId}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`min-h-[110px] rounded-2xl p-2.5 border transition-all flex flex-col justify-between ${
                                  snapshot.isDraggingOver
                                    ? 'bg-amber-50 dark:bg-amber-950/40 border-dashed border-2 border-primary shadow-inner ring-2 ring-primary/20'
                                    : assignedRecipe
                                    ? 'bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800 shadow-sm'
                                    : 'bg-stone-50/50 dark:bg-stone-850/40 hover:bg-stone-50 dark:hover:bg-stone-850/70 border-stone-200/60 dark:border-stone-800 border-dashed'
                                }`}
                              >
                                {/* Slot Label */}
                                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 dark:text-stone-500 mb-1.5">
                                  <span className="flex items-center gap-1">
                                    <span>{icon}</span>
                                    <span>{label}</span>
                                  </span>

                                  {assignedRecipe && currentPlan && (
                                    <button
                                      onClick={() => store.removeMealSlot(currentPlan.id)}
                                      className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                                      title="Remove from slot"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                {assignedRecipe && currentPlan ? (
                                  <div className="space-y-2">
                                    <div
                                      onClick={() => setSelectedRecipe(assignedRecipe)}
                                      className="cursor-pointer group flex items-start gap-1.5"
                                    >
                                      <img
                                        src={assignedRecipe.image_url}
                                        alt={assignedRecipe.title}
                                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                      />
                                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                        {assignedRecipe.title}
                                      </p>
                                    </div>

                                    {/* Serving Scaler Control */}
                                    <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400">
                                      <span className="flex items-center gap-1 font-medium">
                                        <Users className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                        <span>Yield</span>
                                      </span>

                                      <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
                                        <button
                                          onClick={() =>
                                            store.updateMealPlanServings(
                                              currentPlan.id,
                                              currentPlan.servings_scaled - 1
                                            )
                                          }
                                          className="w-4 h-4 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold flex items-center justify-center text-xs"
                                        >
                                          -
                                        </button>
                                        <span className="font-bold text-stone-900 dark:text-stone-100 px-1">
                                          {currentPlan.servings_scaled}
                                        </span>
                                        <button
                                          onClick={() =>
                                            store.updateMealPlanServings(
                                              currentPlan.id,
                                              currentPlan.servings_scaled + 1
                                            )
                                          }
                                          className="w-4 h-4 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold flex items-center justify-center text-xs"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setQuickAddSlot({ date: dateStr, mealType: type })}
                                    className="flex-1 flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 py-3 text-center transition-colors group"
                                  >
                                    <Plus className="w-4 h-4 mb-0.5 group-hover:scale-125 transition-transform text-stone-400 group-hover:text-primary" />
                                    <span className="text-[10px] font-medium">Add Meal</span>
                                  </button>
                                )}

                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Add Modal (Click-to-Add for touch/mobile) */}
        {quickAddSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base capitalize">
                    Add to {quickAddSlot.mealType}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{quickAddSlot.date}</p>
                </div>
                <button
                  onClick={() => setQuickAddSlot(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                {recipes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleQuickAdd(r.id)}
                    className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-primary dark:hover:border-primary hover:bg-amber-50/50 dark:hover:bg-stone-800/60 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={r.image_url}
                        alt={r.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-xs text-stone-900 dark:text-stone-100">{r.title}</p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          {r.prep_time_mins}m • {r.servings} servings
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-primary">Select</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recipe Modal */}
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onAddToPlanner={(recipeId, date, mealType, servings) => {
            store.setMealSlot(recipeId, date, mealType, servings);
          }}
        />
      </div>
    </DragDropContext>
  );
}
