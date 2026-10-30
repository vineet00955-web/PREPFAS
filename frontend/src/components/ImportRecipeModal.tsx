'use client';

import { useState } from 'react';
import { X, Globe, Sparkles, Loader2, Plus, Trash2, CheckCircle } from 'lucide-react';
import { parseRecipeFromUrl } from '@/lib/api';
import { AisleCategory, Recipe } from '@/lib/types';

interface ImportRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
}

export function ImportRecipeModal({ isOpen, onClose, onSave }: ImportRecipeModalProps) {
  if (!isOpen) return null;

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable parsed recipe state
  const [parsed, setParsed] = useState<Recipe | null>(null);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await parseRecipeFromUrl(url.trim());
      setParsed({
        id: `rec-${Date.now()}`,
        title: data.title,
        source_url: data.source_url,
        image_url: data.image_url,
        prep_time_mins: data.prep_time_mins || 30,
        servings: data.servings || 4,
        tags: data.tags || ['Imported'],
        ingredients: data.ingredients.map((ing, i) => ({
          id: `ing-${Date.now()}-${i}`,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: ing.category,
        })),
        instructions: data.instructions,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to scrape this recipe. Please check the URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = () => {
    if (!parsed) return;
    onSave(parsed);
    onClose();
    setUrl('');
    setParsed(null);
  };

  // Field editors
  const updateParsedField = <K extends keyof Recipe>(field: K, value: Recipe[K]) => {
    if (!parsed) return;
    setParsed({ ...parsed, [field]: value });
  };

  const handleIngredientChange = (idx: number, key: string, val: any) => {
    if (!parsed) return;
    const updated = [...parsed.ingredients];
    updated[idx] = { ...updated[idx], [key]: val };
    setParsed({ ...parsed, ingredients: updated });
  };

  const removeIngredient = (idx: number) => {
    if (!parsed) return;
    const updated = parsed.ingredients.filter((_, i) => i !== idx);
    setParsed({ ...parsed, ingredients: updated });
  };

  const addIngredientRow = () => {
    if (!parsed) return;
    setParsed({
      ...parsed,
      ingredients: [
        ...parsed.ingredients,
        {
          id: `ing-new-${Date.now()}`,
          name: '',
          amount: 1,
          unit: '',
          category: 'Produce',
        },
      ],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Import Recipe via URL</h2>
              <p className="text-xs text-stone-400">
                Powered by FastAPI scraper with automatic aisle categorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Step 1: URL input */}
          <form onSubmit={handleScrape} className="space-y-3">
            <label className="block text-sm font-semibold text-stone-800">
              Paste Recipe Link (Food Network, Allrecipes, NYT Cooking, blogs, etc.)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://www.allrecipes.com/recipe/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-stone-300 text-white font-semibold text-sm shadow-md transition-colors flex items-center gap-2 flex-shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Scraping...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {error}
              </p>
            )}
          </form>

          {/* Step 2: Parsed Preview & Editable Form */}
          {parsed && (
            <div className="border-t border-stone-200 pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Parsed Recipe (Editable Preview)</span>
                </h3>
                <span className="text-xs text-stone-500">Review before saving</span>
              </div>

              {/* Title, Time, Servings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Recipe Title</label>
                  <input
                    type="text"
                    value={parsed.title}
                    onChange={(e) => updateParsedField('title', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 font-semibold text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={parsed.prep_time_mins}
                    onChange={(e) => updateParsedField('prep_time_mins', parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Servings Yield</label>
                  <input
                    type="number"
                    value={parsed.servings}
                    onChange={(e) => updateParsedField('servings', parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={parsed.image_url || ''}
                    onChange={(e) => updateParsedField('image_url', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Editable Ingredients Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Ingredients ({parsed.ingredients.length})
                  </label>
                  <button
                    type="button"
                    onClick={addIngredientRow}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {parsed.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200"
                    >
                      <input
                        type="number"
                        step="0.05"
                        value={ing.amount}
                        onChange={(e) => handleIngredientChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs rounded-lg border border-stone-300 bg-white"
                        placeholder="Qty"
                      />
                      <input
                        type="text"
                        value={ing.unit}
                        onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                        className="w-20 px-2 py-1 text-xs rounded-lg border border-stone-300 bg-white"
                        placeholder="Unit (cup, tbsp)"
                      />
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white font-medium"
                        placeholder="Ingredient name"
                      />
                      <select
                        value={ing.category}
                        onChange={(e) => handleIngredientChange(idx, 'category', e.target.value as AisleCategory)}
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

              {/* Editable Instructions */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Instructions ({parsed.instructions.length} steps)
                </label>
                <textarea
                  rows={4}
                  value={parsed.instructions.join('\n')}
                  onChange={(e) =>
                    updateParsedField(
                      'instructions',
                      e.target.value.split('\n').filter((s) => s.trim().length > 0)
                    )
                  }
                  className="w-full p-3 text-xs rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                  placeholder="One step per line..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {parsed && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-medium text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRecipe}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md transition-colors"
            >
              Save Recipe to Vault
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

