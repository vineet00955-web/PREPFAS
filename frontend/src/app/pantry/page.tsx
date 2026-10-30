'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Plus,
  Trash2,
  Search,
  ShoppingCart,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { AisleCategory, PantryItem } from '@/lib/types';
import { formatFraction } from '@/lib/utils';

export default function PantryPage() {
  const store = useStore();
  const pantry = store.getPantry();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Quick Add Form state
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState<number>(1);
  const [unit, setUnit] = useState('cup');
  const [category, setCategory] = useState<AisleCategory>('Pantry');

  const filteredPantry = useMemo(() => {
    return pantry.filter((item) => {
      const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [pantry, searchQuery, selectedCategory]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    store.addPantryItem({
      item_name: itemName.trim(),
      amount: Math.max(0.1, amount),
      unit: unit.trim(),
      category: category,
    });

    setItemName('');
    setAmount(1);
    setUnit('cup');
  };

  const handleUpdateAmount = (id: string, currentAmount: number, delta: number) => {
    const newAmount = Math.max(0, Number((currentAmount + delta).toFixed(2)));
    if (newAmount === 0) {
      store.deletePantryItem(id);
    } else {
      store.updatePantryItem(id, { amount: newAmount });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-subtle">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Stock Deduction</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2">
            <Boxes className="w-7 h-7 text-primary" />
            <span>Pantry Inventory</span>
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-0.5">
            Keep track of staples you already own. Items here are deducted automatically from your grocery list!
          </p>
        </div>

        <Link
          href="/grocery-list"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white text-xs sm:text-sm font-semibold hover:bg-black dark:hover:bg-stone-700 transition-colors"
        >
          <ShoppingCart className="w-4 h-4 text-emerald-400" />
          <span>View Grocery List</span>
        </Link>
      </div>

      {/* Quick Add Card */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-subtle">
        <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-3">
          Quick-Add Pantry Item
        </h2>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              placeholder="Item name (e.g. Olive Oil, Garlic, Oats)"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-primary placeholder-stone-400"
            />
          </div>

          <div>
            <input
              type="number"
              step="0.1"
              min="0.1"
              required
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 1)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Unit (cup, bottle, lb)"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AisleCategory)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-200 capitalize"
            >
              <option value="Pantry">Pantry</option>
              <option value="Produce">Produce</option>
              <option value="Dairy">Dairy</option>
              <option value="Meat">Meat</option>
              <option value="Spices">Spices</option>
              <option value="Frozen">Frozen</option>
              <option value="Bakery">Bakery</option>
              <option value="Beverages">Beverages</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="sm:col-span-5 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Pantry</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-subtle flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pantry stock..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Pantry', 'Produce', 'Dairy', 'Meat', 'Spices'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pantry Items List */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-subtle overflow-hidden">
        {filteredPantry.length === 0 ? (
          <div className="text-center py-12 px-4 text-stone-400 dark:text-stone-500">
            <Boxes className="w-10 h-10 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
            <p className="text-xs font-medium">No items found matching your filter</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {filteredPantry.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">{item.item_name}</h3>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
                      {item.category} Aisle
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-xl border border-stone-200 dark:border-stone-700">
                    <button
                      onClick={() => handleUpdateAmount(item.id, item.amount, -1)}
                      className="w-5 h-5 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold flex items-center justify-center text-xs"
                      title="Decrease"
                    >
                      -
                    </button>
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100 px-2 min-w-[50px] text-center">
                      {formatFraction(item.amount)} {item.unit}
                    </span>
                    <button
                      onClick={() => handleUpdateAmount(item.id, item.amount, 1)}
                      className="w-5 h-5 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold flex items-center justify-center text-xs"
                      title="Increase"
                    >
                      +
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => store.deletePantryItem(item.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
