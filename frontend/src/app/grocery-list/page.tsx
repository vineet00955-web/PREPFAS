'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Boxes,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { computeClientGroceryList } from '@/lib/api';
import { AisleCategory, GroceryItem } from '@/lib/types';
import { formatFraction } from '@/lib/utils';

const AISLE_ICONS: Record<AisleCategory, string> = {
  Produce: '🥬',
  Dairy: '🧀',
  Meat: '🥩',
  Pantry: '🥫',
  Spices: '🧂',
  Frozen: '🧊',
  Bakery: '🍞',
  Beverages: '🧃',
  Other: '📦',
};

export default function GroceryListPage() {
  const store = useStore();
  const mealPlans = store.getMealPlans();
  const recipes = store.getRecipes();
  const pantry = store.getPantry();

  // Deduct pantry switch
  const [deductPantry, setDeductPantry] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copySuccess, setCopySuccess] = useState(false);

  // Quick manual add item
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomCategory, setNewCustomCategory] = useState<AisleCategory>('Produce');
  const [customItems, setCustomItems] = useState<GroceryItem[]>([]);

  // Compute aggregated list
  const { total_items_count, aisles } = computeClientGroceryList(
    mealPlans,
    recipes,
    pantry,
    deductPantry
  );

  // Merge custom items into aisles
  const aisleMap = new Map<string, GroceryItem[]>();
  aisles.forEach((g) => aisleMap.set(g.category, [...g.items]));

  customItems.forEach((c) => {
    const list = aisleMap.get(c.category) || [];
    list.push(c);
    aisleMap.set(c.category, list);
  });

  const aisleOrder: AisleCategory[] = [
    'Produce',
    'Dairy',
    'Meat',
    'Pantry',
    'Spices',
    'Frozen',
    'Bakery',
    'Beverages',
    'Other',
  ];

  const aisleGroups = aisleOrder
    .map((cat) => ({
      category: cat,
      items: aisleMap.get(cat) || [],
    }))
    .filter((g) => g.items.length > 0);

  const totalItemCount = aisleGroups.reduce((acc, curr) => acc + curr.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomName.trim()) return;

    const newItem: GroceryItem = {
      id: `custom-${Date.now()}`,
      name: newCustomName.trim(),
      original_needed: 1,
      pantry_stock: 0,
      net_needed: 1,
      unit: 'item',
      category: newCustomCategory,
      recipes: ['Manual addition'],
      checked: false,
      isCustom: true,
    };

    setCustomItems((prev) => [...prev, newItem]);
    setNewCustomName('');
  };

  const handleCopyList = () => {
    let text = '🛒 EXTEP Grocery Checklist\n\n';
    aisleGroups.forEach((group) => {
      text += `--- ${group.category.toUpperCase()} ---\n`;
      group.items.forEach((item) => {
        const isDone = checkedItems[item.id] ? '[x]' : '[ ]';
        text += `${isDone} ${item.name}: ${formatFraction(item.net_needed)} ${item.unit}\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const progressPercent = totalItemCount > 0 ? Math.round((checkedCount / totalItemCount) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-subtle">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aisle-Optimized Generator</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-primary" />
            <span>Smart Grocery List</span>
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-0.5">
            Auto-aggregated from {mealPlans.length} scheduled meals across your weekly planner.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyList}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors"
          >
            {copySuccess ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <Link
            href="/planner"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white text-xs font-semibold hover:bg-black dark:hover:bg-stone-700 transition-colors"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Edit Planner</span>
          </Link>
        </div>
      </div>

      {/* Control Bar: Pantry Deduction Toggle + Progress Bar */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Pantry Toggle */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Deduct items in my Pantry
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  {pantry.length} in stock
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Automatically subtract matching pantry inventory from needed quantities
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={deductPantry}
              onChange={(e) => setDeductPantry(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-200 dark:bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Progress Bar for Shopping Walk */}
        {totalItemCount > 0 && (
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700 dark:text-stone-300">Shopping Progress</span>
              <span className="text-stone-500 dark:text-stone-400 font-medium">
                {checkedCount} of {totalItemCount} items packed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Custom Item Form */}
      <form
        onSubmit={handleAddCustomItem}
        className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850/70 border border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-3"
      >
        <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
          Quick Add:
        </span>
        <input
          type="text"
          placeholder="e.g. Paper towels, Sparkling water, Coffee"
          value={newCustomName}
          onChange={(e) => setNewCustomName(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select
          value={newCustomCategory}
          onChange={(e) => setNewCustomCategory(e.target.value as AisleCategory)}
          className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs capitalize text-stone-800 dark:text-stone-200"
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
          type="submit"
          className="px-4 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-800 hover:bg-black dark:hover:bg-stone-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add to List</span>
        </button>
      </form>

      {/* Empty State */}
      {totalItemCount === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700 space-y-3">
          <ShoppingCart className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
          <h3 className="text-stone-800 dark:text-stone-200 font-bold text-base">Your grocery list is empty!</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            Schedule recipes into your weekly meal planner, or toggle off pantry deduction if all
            items are already covered by your pantry stock.
          </p>
          <Link
            href="/planner"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-md transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Open Meal Planner</span>
          </Link>
        </div>
      ) : (
        /* Categorized Aisle Sections */
        <div className="space-y-6">
          {aisleGroups.map((aisle) => (
            <div
              key={aisle.category}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-subtle overflow-hidden"
            >
              {/* Aisle Header */}
              <div className="bg-stone-50/90 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{AISLE_ICONS[aisle.category] || '📦'}</span>
                  <h2 className="font-bold text-stone-900 dark:text-stone-100 text-sm">{aisle.category} Aisle</h2>
                </div>
                <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 bg-stone-200/60 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                  {aisle.items.length} {aisle.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Checklist Items */}
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {aisle.items.map((item) => {
                  const isChecked = Boolean(checkedItems[item.id]);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`p-3.5 sm:px-5 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                        isChecked
                          ? 'bg-stone-50/70 dark:bg-stone-950/40 text-stone-400 dark:text-stone-500'
                          : 'hover:bg-amber-50/30 dark:hover:bg-stone-800/50 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      {/* Checkbox & Name */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:border-primary'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isChecked ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'
                            }`}
                          >
                            {item.name}
                          </p>

                          {item.recipes && item.recipes.length > 0 && (
                            <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">
                              For: {item.recipes.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Pantry Badges */}
                      <div className="flex items-center gap-2 text-right flex-shrink-0">
                        {item.pantry_stock > 0 && deductPantry && (
                          <span
                            className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md"
                            title={`Had ${item.pantry_stock} in pantry`}
                          >
                            <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>Pantry -{item.pantry_stock}</span>
                          </span>
                        )}

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            isChecked
                              ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                          }`}
                        >
                          {formatFraction(item.net_needed)} {item.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
