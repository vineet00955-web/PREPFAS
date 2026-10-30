'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  CheckCircle2,
  Boxes,
  Printer,
  Copy,
  Plus,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Check,
  Calendar,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { computeClientGroceryList } from '@/lib/api';
import { AisleCategory, GroceryItem } from '@/lib/types';
import { formatFraction } from '@/lib/utils';
import confetti from 'canvas-confetti';

const AISLE_ICONS: Record<AisleCategory, string> = {
  Produce: '🥬',
  Dairy: '🧀',
  Meat: '🥩',
  Pantry: '🌾',
  Spices: '🧂',
  Frozen: '🧊',
  Bakery: '🍞',
  Beverages: '☕',
  Other: '📦',
};

export default function GroceryListPage() {
  const store = useStore();
  const recipes = store.getRecipes();
  const mealPlans = store.getMealPlans();
  const pantry = store.getPantry();

  // Pantry deduction toggle state
  const [deductPantry, setDeductPantry] = useState<boolean>(true);
  // Checked items set (by item id)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  // Custom manual items
  const [customItems, setCustomItems] = useState<GroceryItem[]>([]);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomCategory, setNewCustomCategory] = useState<AisleCategory>('Produce');
  const [copySuccess, setCopySuccess] = useState(false);

  // Compute aggregated list
  const aggregatedData = useMemo(() => {
    return computeClientGroceryList(mealPlans, recipes, pantry, deductPantry);
  }, [mealPlans, recipes, pantry, deductPantry]);

  // Combine aggregated aisle groups with custom items
  const aisleGroups = useMemo(() => {
    const groups = aggregatedData.aisles.map((g) => ({
      ...g,
      items: [...g.items],
    }));

    // Inject custom items into their respective category
    customItems.forEach((ci) => {
      const target = groups.find((g) => g.category === ci.category);
      if (target) {
        target.items.push(ci);
        target.count += 1;
      } else {
        groups.push({
          category: ci.category,
          count: 1,
          items: [ci],
        });
      }
    });

    return groups;
  }, [aggregatedData, customItems]);

  const totalItemCount = useMemo(() => {
    return aisleGroups.reduce((acc, g) => acc + g.items.length, 0);
  }, [aisleGroups]);

  const checkedCount = useMemo(() => {
    let count = 0;
    aisleGroups.forEach((g) => {
      g.items.forEach((item) => {
        if (checkedItems[item.id]) count++;
      });
    });
    return count;
  }, [aisleGroups, checkedItems]);

  const toggleCheck = (itemId: string) => {
    const nextState = !checkedItems[itemId];
    setCheckedItems((prev) => ({ ...prev, [itemId]: nextState }));

    // If all items checked, trigger celebratory confetti!
    if (nextState && checkedCount + 1 === totalItemCount && totalItemCount > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }
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
    let text = '🛒 PrepFast Grocery Checklist\n\n';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-subtle">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aisle-Optimized Generator</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-primary" />
            <span>Smart Grocery List</span>
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Auto-aggregated from {mealPlans.length} scheduled meals across your weekly planner.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyList}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors"
          >
            {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <Link
            href="/planner"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Edit Planner</span>
          </Link>
        </div>
      </div>

      {/* Control Bar: Pantry Deduction Toggle + Progress Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Pantry Toggle */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-900">
                  Deduct items in my Pantry
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  {pantry.length} in stock
                </span>
              </div>
              <p className="text-xs text-stone-500">
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
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Progress Bar for Shopping Walk */}
        {totalItemCount > 0 && (
          <div className="pt-2 border-t border-stone-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700">Shopping Progress</span>
              <span className="text-stone-500 font-medium">
                {checkedCount} of {totalItemCount} items packed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
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
        className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center gap-3"
      >
        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          Quick Add:
        </span>
        <input
          type="text"
          placeholder="e.g. Paper towels, Sparkling water, Coffee"
          value={newCustomName}
          onChange={(e) => setNewCustomName(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select
          value={newCustomCategory}
          onChange={(e) => setNewCustomCategory(e.target.value as AisleCategory)}
          className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs capitalize text-stone-800"
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
          className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add to List</span>
        </button>
      </form>

      {/* Empty State */}
      {totalItemCount === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-dashed border-stone-300 space-y-3">
          <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-stone-800 font-bold text-base">Your grocery list is empty!</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
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
              className="bg-white rounded-2xl border border-stone-200/90 shadow-subtle overflow-hidden"
            >
              {/* Aisle Header */}
              <div className="bg-stone-50/90 border-b border-stone-200 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{AISLE_ICONS[aisle.category] || '📦'}</span>
                  <h2 className="font-bold text-stone-900 text-sm">{aisle.category} Aisle</h2>
                </div>
                <span className="text-[11px] font-semibold text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-full">
                  {aisle.items.length} {aisle.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Checklist Items */}
              <div className="divide-y divide-stone-100">
                {aisle.items.map((item) => {
                  const isChecked = Boolean(checkedItems[item.id]);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`p-3.5 sm:px-5 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                        isChecked
                          ? 'bg-stone-50/70 text-stone-400'
                          : 'hover:bg-amber-50/30 text-stone-800'
                      }`}
                    >
                      {/* Checkbox & Name */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-stone-300 bg-white hover:border-primary'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isChecked ? 'line-through text-stone-400' : 'text-stone-900'
                            }`}
                          >
                            {item.name}
                          </p>

                          {item.recipes && item.recipes.length > 0 && (
                            <p className="text-[11px] text-stone-400 truncate">
                              For: {item.recipes.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Pantry Badges */}
                      <div className="flex items-center gap-2 text-right flex-shrink-0">
                        {item.pantry_stock > 0 && deductPantry && (
                          <span
                            className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md"
                            title={`Had ${item.pantry_stock} in pantry`}
                          >
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            <span>Pantry -{item.pantry_stock}</span>
                          </span>
                        )}

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            isChecked
                              ? 'bg-stone-100 text-stone-400'
                              : 'bg-stone-100 text-stone-900'
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

