'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UtensilsCrossed,
  BookOpen,
  CalendarDays,
  ShoppingCart,
  Boxes,
  Home,
  Database,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/recipes', label: 'Recipe Box', icon: BookOpen },
  { href: '/planner', label: 'Meal Planner', icon: CalendarDays },
  { href: '/grocery-list', label: 'Grocery List', icon: ShoppingCart },
  { href: '/pantry', label: 'Pantry Inventory', icon: Boxes },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasSupabase = isSupabaseConfigured();

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-stone-900 text-white z-40 flex items-center justify-between px-4 border-b border-stone-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-md">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Prep<span className="text-primary">Fast</span></span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-stone-800 text-stone-200 hover:text-white"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-stone-900 text-stone-200 z-50 flex flex-col border-r border-stone-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-stone-800/80 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white">
                Prep<span className="text-primary">Fast</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
                PRO
              </span>
            </div>
            <p className="text-xs text-stone-400">Smart Culinary Engine</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 font-semibold'
                    : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Tips / AI Card */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-gradient-to-br from-stone-800/90 to-stone-800/40 border border-stone-700/50">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>FastAPI Scraper Active</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Import any web recipe link with auto unit normalization and pantry deduction.
          </p>
        </div>

        {/* Bottom Connection Status */}
        <div className="p-4 border-t border-stone-800 text-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-stone-400" />
              <span>Database</span>
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                hasSupabase
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {hasSupabase ? 'Supabase Live' : 'Local / Demo'}
            </span>
          </div>
          <p className="text-[11px] text-stone-400">
            {hasSupabase
              ? 'Synchronized with Supabase Cloud'
              : 'Local persistent vault (zero setup required)'}
          </p>
        </div>
      </aside>
    </>
  );
}

