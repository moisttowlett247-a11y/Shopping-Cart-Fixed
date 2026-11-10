import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ShoppingCart, ArrowRight } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { setActiveTab, setSelectedCategory, setIsUploadRecipeOpen } = useStore();

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl mb-8">
      {/* Background Hero Image */}
      <div className="absolute inset-0">
        <img
          src="/src/assets/images/hero_walmart_groceries_1794296360517.jpg"
          alt="Walmart Dark Groceries and Essentials"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 sm:p-12 max-w-2xl space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/60 text-xs font-semibold text-blue-200">
          <span className="text-amber-400">✦</span>
          <span>Walmart Dark · 1-Click Recipe Cart & Brand Switcher</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Everyday Essentials & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
            1-Click Recipe Carting.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Switch effortlessly between <strong>Name Brand</strong>, <strong>Great Value</strong>, and{' '}
          <strong>Organic</strong> for each item. Your preferences are saved automatically so you always get the right ingredients at the best price.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 backdrop-blur-sm">
            <div className="text-amber-400 font-bold mb-0.5">✦ 1-Click Recipes</div>
            <div className="text-slate-400 text-[11px]">Instant ingredients to cart</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 backdrop-blur-sm">
            <div className="text-emerald-400 font-bold mb-0.5">🌿 3 Brand Tiers</div>
            <div className="text-slate-400 text-[11px]">Remembers item choices</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 backdrop-blur-sm col-span-2 sm:col-span-1">
            <div className="text-blue-400 font-bold mb-0.5">📦 Non-Food Items</div>
            <div className="text-slate-400 text-[11px]">Paper towels, soap & tech</div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('recipes')}
            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Explore 1-Click Recipes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsUploadRecipeOpen(true)}
            className="px-5 py-3 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white font-bold text-xs transition-all flex items-center gap-2 border border-purple-400/40 shadow-lg"
          >
            <span>+ AI / Link Recipe Builder</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('browse');
              setSelectedCategory('essentials');
            }}
            className="px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4 text-slate-400" />
            <span>Shop Non-Food Essentials</span>
          </button>
        </div>
      </div>
    </div>
  );
};
