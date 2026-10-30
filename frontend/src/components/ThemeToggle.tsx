'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

interface ThemeToggleProps {
  align?: 'left' | 'right' | 'center';
  variant?: 'compact' | 'expanded';
}

export function ThemeToggle({ align = 'right', variant = 'compact' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-stone-800/80 border border-stone-700/50 animate-pulse" />
    );
  }

  const currentTheme = theme || 'system';

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  const ActiveIcon =
    currentTheme === 'dark' ? Moon : currentTheme === 'light' ? Sun : Monitor;

  if (variant === 'expanded') {
    return (
      <div className="flex items-center gap-1 p-1 bg-stone-800/90 rounded-xl border border-stone-700/60">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = currentTheme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-primary text-white shadow-sm font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-700/50'
              }`}
              title={`Switch to ${opt.label} mode`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme"
        className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700/60 shadow-sm transition-all hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <ActiveIcon className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium capitalize hidden sm:inline-block text-stone-300">
          {currentTheme}
        </span>
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'left' ? 'left-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'
          } bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-36 rounded-xl bg-stone-900 border border-stone-700/80 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-800 mb-1">
            Appearance
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = currentTheme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-primary/15 text-primary font-semibold'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-stone-400'}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

