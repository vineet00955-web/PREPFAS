'use client';

import { useState } from 'react';
import { X, Plus, Trash2, ChefHat } from 'lucide-react';
import { AisleCategory, Recipe, Ingredient } from '@/lib/types';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
}

export function AddRecipeModal({ isOpen, onClose, onSave }: AddRecipeModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState(30);
  const [servings, setServings] = useState(4);
  const [tagsInput, setTagsInput] = useState('Dinner, Quick');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: 'Garlic Cloves', amount: 3, unit: 'clove', category: 'Produce' },
    { id: '2', name: 'Olive Oil', amount: 2, unit: 'tbsp', category: 'Pantry' },
  ]);
  const [instructionsText, setInstructionsText] = useState(
    '1. Heat oil in a pan over medium heat.\n2. Add ingredients and cook until golden.\n3. Serve hot with your favorite side.'
  );

  const addIngredientRow = () => {
    setIngredients([
      ...ingredients,
      {
        id: `ing-${Date.now()}`,
        name: '',
        amount: 1,
        unit: '',
        category: 'Produce',
      },
    ]);
  };

  const updateIngredient = (idx: number, key: keyof Ingredient, val: any) => {
    const updated = [...ingredients];
    updated[idx] = { ...updated[idx], [key]: val };
    setIngredients(updated);
  };

  const removeIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const steps = instructionsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newRecipe: Recipe = {
      id: `rec-${Date.now()}`,
      title: title.trim(),
      image_url:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80',
      prep_time_mins: prepTime,
      servings: servings,
      tags: tags.length > 0 ? tags : ['Homemade'],
      ingredients: ingredients.filter((i) => i.name.trim().length > 0),
      instructions: steps.length > 0 ? steps : ['Cook and enjoy!'],
    };

    onSave(newRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create New Recipe</h2>
              <p className="text-xs text-stone-400">Add a custom recipe with aisle categorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Recipe Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Crispy Honey Garlic Tofu"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 font-semibold text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Prep Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={prepTime}
                onChange={(e) => setPrepTime(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Servings Yield
              </label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="Dinner, Quick, High-Protein"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Photo URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Ingredients ({ingredients.length})
              </label>
              <button
                type="button"
                onClick={addIngredientRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200"
                >
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={ing.amount}
                    onChange={(e) => updateIngredient(idx, 'amount', parseFloat(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-xs rounded-lg border border-stone-300 bg-white"
                    placeholder="Qty"
                  />
                  <input
                    type="text"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                    className="w-20 px-2 py-1 text-xs rounded-lg border border-stone-300 bg-white"
                    placeholder="Unit"
                  />
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white font-medium"
                    placeholder="Ingredient name (e.g. Baby Spinach)"
                    required
                  />
                  <select
                    value={ing.category}
                    onChange={(e) => updateIngredient(idx, 'category', e.target.value as AisleCategory)}
                    className="px-2 py-1 text-xs rounded-lg border border-stone-300 bg-white capitalize"
                  >
                    <option value="Produce">Produce</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Meat">Meat</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Spices">Spices</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeIngredient(idx)}
                    className="p-1 text-stone-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Cooking Instructions (One step per line)
            </label>
            <textarea
              rows={4}
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
              placeholder="1. Prep ingredients...&#10;2. Sauté aromatics...&#10;3. Plate and serve."
              required
            />
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-medium text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md transition-colors"
            >
              Create Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

