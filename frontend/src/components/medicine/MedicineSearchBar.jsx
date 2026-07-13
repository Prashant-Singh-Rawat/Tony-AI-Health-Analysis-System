import React, { useState } from 'react';
import { Search, X, Pill, AlertCircle } from 'lucide-react';

export default function MedicineSearchBar({ searchHook, onSelectSuggestion }) {
  const { query, setQuery, suggestions, loading, clearSearch } = searchHook;
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-10">
      <div
        className={`bg-white dark:bg-gray-950 border rounded-3xl p-2.5 flex items-center gap-2.5 transition-all duration-300 shadow-floating ${
          focused ? 'ring-2 ring-brand border-transparent' : 'border-gray-150'
        }`}
      >
        <div className="w-10 h-10 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Search className="w-5 h-5 text-brand" />
        </div>
        <input
          type="search"
          value={query}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for medicines (e.g. Paracetamol, Amoxicillin)..."
          className="flex-1 bg-transparent py-3 text-sm text-gray-750 dark:text-white outline-none placeholder-gray-400 font-semibold"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
            aria-label="Clear search"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Autocomplete drawer */}
      {focused && (suggestions.length > 0 || loading) && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-2xl shadow-floating p-2.5 z-40 space-y-1">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-gray-400">
              <span className="w-2 h-2 bg-brand rounded-full animate-bounce" />
              <span>Fetching autocomplete matches…</span>
            </div>
          ) : (
            suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSuggestion(item)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50/30 dark:hover:bg-gray-900 rounded-xl transition text-xs sm:text-sm font-semibold text-gray-750 dark:text-white"
              >
                <Pill className="w-4 h-4 text-brand" />
                <span>{item.name}</span>
                <span className="ml-auto text-[10px] text-gray-400 font-bold uppercase">{item.strength || 'Standard'}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
