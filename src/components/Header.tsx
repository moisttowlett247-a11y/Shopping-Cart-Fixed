import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BrandTierType } from '../types';
import { Search, ShoppingBag, MapPin, Sparkles, PlusCircle, Package } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    setIsUploadRecipeOpen,
    searchQuery,
    setSearchQuery,
    globalBrandPreference,
    setGlobalBrandPreference,
    setSelectedCategory,
    orders,
  } = useStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    if (activeTab !== 'browse') {
      setActiveTab('browse');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800/90 backdrop-blur-md">
      {/* 1. Universal Top Bar Contract: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('recipes');
            setSelectedCategory('all');
            setSearchQuery('');
            setLocalSearch('');
          }}
          className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <span className="text-amber-400 text-xl font-bold">✦</span>
          <span>SparkStore</span>
          <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/50">
            CartCraft Recipe Shopper
          </span>
        </button>

        {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab('recipes')}
            className={`whitespace-nowrap shrink-0 hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1 ${
              activeTab === 'recipes' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : ''
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Recipe Hub & 1-Click Cart</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('browse');
              setSelectedCategory('all');
            }}
            className={`whitespace-nowrap shrink-0 hover:text-amber-400 transition-colors py-1 ${
              activeTab === 'browse' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : ''
            }`}
          >
            Browse Products (Food & Non-Food)
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('browse');
              setSelectedCategory('essentials');
            }}
            className="whitespace-nowrap shrink-0 hover:text-amber-400 transition-colors py-1"
          >
            Everyday Non-Food Essentials
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`whitespace-nowrap shrink-0 hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1 ${
              activeTab === 'orders' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : ''
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Track Orders</span>
            {orders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action (Cart with Live Count) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('recipes');
              setIsUploadRecipeOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/90 hover:bg-purple-600 border border-purple-400/40 text-xs font-bold text-white transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>Upload Recipe</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md whitespace-nowrap"
            aria-label="Open Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-mono">
              ${cartSubtotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Secondary Utility Strip: Search Bar & Store Preferences */}
      <div className="bg-slate-900/80 border-t border-slate-800/60 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Walmart Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative flex items-center">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search groceries, paper towels, chicken, pasta, recipes, USB cables..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-3.5 pr-24 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {/* Delivery Location & Global Brand Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            {/* Delivery Location */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-medium hidden sm:inline text-slate-400">Delivery to:</span>
              <span className="text-white font-semibold text-xs">Sacramento, 95814</span>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            {/* Global Brand Preference Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 hidden lg:inline">Priority:</span>
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                {(['none', 'great_value', 'name_brand', 'organic'] as ('none' | BrandTierType)[]).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setGlobalBrandPreference(pref)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      globalBrandPreference === pref
                        ? pref === 'great_value'
                          ? 'bg-blue-600 text-white font-bold'
                          : pref === 'organic'
                          ? 'bg-emerald-600 text-white font-bold'
                          : pref === 'name_brand'
                          ? 'bg-slate-700 text-white font-bold'
                          : 'bg-slate-800 text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pref === 'none'
                      ? 'Item Default'
                      : pref === 'great_value'
                      ? 'Great Value'
                      : pref === 'name_brand'
                      ? 'Name Brand'
                      : 'Organic'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
